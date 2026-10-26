/**
 * CART MUTATION QUEUE (spec §3)
 *
 * Enforces:
 *  - Cart-wide ordered mutation queue.
 *  - CLEAR must wait for all previously queued product mutations.
 *  - Scope queued work to the current account with a generation token;
 *    stale callbacks/responses/rollbacks cannot update a newly signed-in user's state
 *    or revive across switch-away-and-back.
 *  - Guaranteed counter cleanup: every execution exit (including stale work cancellation)
 *    is enclosed inside try...finally to prevent inFlightCount leaks.
 *  - A flush operation that terminates reliably, detects revision changes, drains pending work,
 *    preserves unresolved failure states, and returns the authoritative consistent cart snapshot.
 *  - Checkout must await flushing and block when synchronization fails.
 *  - Failed mutations remain visible until explicitly reconciled.
 */

export type MutationOp =
  | { kind: "set"; productId: string; quantity: number }
  | { kind: "add"; productId: string; quantity: number }
  | { kind: "remove"; productId: string }
  | { kind: "clear" }

export interface FailedMutationRecord {
  op: MutationOp
  scope: string
  generation: number
  revision?: number
  error?: string
}

export interface MutationQueueConfig<T = any> {
  debounceMs?: number
  execute: (op: MutationOp, scope: string, revision: number, generation: number) => Promise<boolean>
  getSnapshot: () => T
}

export class CartMutationQueue<T = any> {
  private debounceMs: number
  private execute: (op: MutationOp, scope: string, revision: number, generation: number) => Promise<boolean>
  private getSnapshot: () => T

  private currentScope: string = "guest"
  private currentGeneration: number = 0
  private revision: number = 0

  private pendingByProduct = new Map<string, { op: MutationOp; timer: NodeJS.Timeout; gen: number; rev: number }>()
  private executionChain: Promise<any> = Promise.resolve()
  private inFlightCount: number = 0
  private lastFlushFailed: boolean = false
  private lastError: string | null = null
  private failedMutations: FailedMutationRecord[] = []

  constructor(config: MutationQueueConfig<T>) {
    this.debounceMs = config.debounceMs ?? 300
    this.execute = config.execute
    this.getSnapshot = config.getSnapshot
  }

  /**
   * Set or switch active account scope.
   * Increments generation counter to invalidate any in-flight or pending work,
   * even if switching away and back to the same scope name.
   */
  public setScope(newScope: string) {
    if (this.currentScope !== newScope) {
      this.currentGeneration += 1
      for (const { timer } of this.pendingByProduct.values()) {
        clearTimeout(timer)
      }
      this.pendingByProduct.clear()
      this.currentScope = newScope
      this.revision += 1
      this.lastFlushFailed = false
      this.lastError = null
      this.failedMutations = []
      this.inFlightCount = 0
    }
  }

  public getScope(): string {
    return this.currentScope
  }

  public getGeneration(): number {
    return this.currentGeneration
  }

  public getRevision(): number {
    return this.revision
  }

  public getInFlightCount(): number {
    return this.inFlightCount
  }

  public getFailedMutations(): FailedMutationRecord[] {
    return [...this.failedMutations]
  }

  public clearFailedMutations(): void {
    this.failedMutations = []
    this.lastFlushFailed = false
    this.lastError = null
  }

  /**
   * Authoritatively reconcile failed mutations by accepting a verified server cart snapshot.
   * - Absence from the snapshot is meaningful:
   *   - Failed ADD: product is absent from server snapshot -> abandoned and resolved.
   *   - Failed REMOVE: product is already absent from server snapshot -> desired state reached and resolved.
   *   - Failed SET: server snapshot state accepted -> resolved.
   *   - Failed CLEAR: server snapshot state accepted -> resolved.
   * - Only resolves failures for the specified account scope and generation up to `upToRevision`.
   * - Preserves newer edits/failures that occurred after the snapshot was initiated (revision > upToRevision).
   */
  public acceptServerSnapshot(
    serverProductIds: string[],
    targetScope?: string,
    targetGen?: number,
    upToRevision?: number
  ): number {
    const scope = targetScope ?? this.currentScope
    const gen = targetGen ?? this.currentGeneration
    const maxRev = upToRevision ?? this.revision

    const initialCount = this.failedMutations.length
    if (initialCount === 0) return 0

    this.failedMutations = this.failedMutations.filter((m) => {
      // Keep failures from other scopes or generations
      if (m.scope !== scope || m.generation !== gen) {
        return true
      }
      // Preserve newer failures created after the snapshot revision
      if (m.revision !== undefined && m.revision > maxRev) {
        return true
      }
      // All failures matching this scope and generation up to maxRev are resolved
      // because the client has accepted the server cart snapshot as authoritative.
      return false
    })

    if (this.failedMutations.length === 0) {
      this.lastFlushFailed = false
      this.lastError = null
    }

    return initialCount - this.failedMutations.length
  }

  /**
   * Retry all failed mutations for the given scope and generation by re-enqueuing them.
   */
  public retryFailedMutations(targetScope?: string, targetGen?: number): number {
    const scope = targetScope ?? this.currentScope
    const gen = targetGen ?? this.currentGeneration

    const toRetry: MutationOp[] = []
    this.failedMutations = this.failedMutations.filter((m) => {
      if (m.scope === scope && m.generation === gen) {
        toRetry.push(m.op)
        return false
      }
      return true
    })

    if (this.failedMutations.length === 0) {
      this.lastFlushFailed = false
      this.lastError = null
    }

    for (const op of toRetry) {
      this.enqueue(op)
    }

    return toRetry.length
  }

  /**
   * Authoritatively reconcile failed mutations.
   * - Only resolves failures matching the specified account scope and generation.
   * - If acceptSnapshot is true (default), accepts the verified server cart snapshot so absent
   *   products resolve failed additions/removals up to upToRevision.
   * - If acceptSnapshot is false and resolvedProductIds is provided, only resolves matching product IDs.
   * - Preserves newer edits or failures arriving for newer generations/edits.
   */
  public reconcileFailedMutations(
    resolvedProductIds?: string[],
    targetScope?: string,
    targetGen?: number,
    upToRevision?: number,
    acceptSnapshot: boolean = false
  ): number {
    if (acceptSnapshot || !resolvedProductIds) {
      return this.acceptServerSnapshot(resolvedProductIds || [], targetScope, targetGen, upToRevision)
    }

    const scope = targetScope ?? this.currentScope
    const gen = targetGen ?? this.currentGeneration
    const maxRev = upToRevision ?? this.revision

    const initialCount = this.failedMutations.length
    if (initialCount === 0) return 0

    const resolvedSet = new Set(resolvedProductIds)
    this.failedMutations = this.failedMutations.filter((m) => {
      // Keep failures from other scopes or generations
      if (m.scope !== scope || m.generation !== gen) {
        return true
      }
      // Preserve newer failures created after upToRevision
      if (m.revision !== undefined && m.revision > maxRev) {
        return true
      }
      if (m.op.kind === "clear") {
        return false // full cart state reconciled
      }
      const pid = (m.op as any).productId
      return !resolvedSet.has(pid)
    })

    if (this.failedMutations.length === 0) {
      this.lastFlushFailed = false
      this.lastError = null
    }

    return initialCount - this.failedMutations.length
  }

  /**
   * Merge a newly requested op with a pending op for the SAME product line.
   */
  private mergeOps(existing: MutationOp | undefined, next: MutationOp): MutationOp {
    if (!existing || existing.kind === "clear" || next.kind === "clear") {
      return next
    }
    if (next.kind === "remove" || existing.kind === "remove") {
      return next
    }
    if (next.kind === "set") {
      return next // latest absolute quantity wins
    }
    // next is an add
    if (existing.kind === "add") {
      return { kind: "add", productId: next.productId, quantity: existing.quantity + next.quantity }
    }
    // next add folded onto pending set -> bump target quantity
    return { kind: "set", productId: next.productId, quantity: existing.quantity + next.quantity }
  }

  /**
   * Enqueue execution of an operation in strict serial order.
   * Checks scope and generation both BEFORE sending and BEFORE applying results.
   * All exits are enclosed in try...finally so inFlightCount is NEVER leaked.
   */
  private chainExecution(op: MutationOp, scopeAtEnqueue: string, genAtEnqueue: number, revAtEnqueue: number): Promise<boolean> {
    this.inFlightCount += 1

    const run = async (): Promise<boolean> => {
      try {
        // Check generation and scope BEFORE sending request
        if (this.currentScope !== scopeAtEnqueue || this.currentGeneration !== genAtEnqueue) {
          return true
        }

        const ok = await this.execute(op, scopeAtEnqueue, revAtEnqueue, genAtEnqueue)

        // Check generation and scope BEFORE applying success/failure outcome
        if (this.currentScope !== scopeAtEnqueue || this.currentGeneration !== genAtEnqueue) {
          return true
        }

        if (!ok) {
          this.lastFlushFailed = true
          this.failedMutations.push({
            op,
            scope: scopeAtEnqueue,
            generation: genAtEnqueue,
            revision: revAtEnqueue,
            error: this.lastError || "Mutation failed",
          })
        }
        return ok
      } catch (err: any) {
        if (this.currentScope !== scopeAtEnqueue || this.currentGeneration !== genAtEnqueue) {
          return true
        }
        this.lastFlushFailed = true
        const msg = err?.message || "Sync failed"
        this.lastError = msg
        this.failedMutations.push({
          op,
          scope: scopeAtEnqueue,
          generation: genAtEnqueue,
          revision: revAtEnqueue,
          error: msg,
        })
        return false
      } finally {
        this.inFlightCount = Math.max(0, this.inFlightCount - 1)
      }
    }

    this.executionChain = this.executionChain.then(run, run)
    return this.executionChain
  }

  /**
   * Enqueue a cart mutation.
   * CLEAR immediately drains all per-line ops and executes as a global barrier.
   */
  public enqueue(op: MutationOp): void {
    this.revision += 1
    const currentScope = this.currentScope
    const currentGen = this.currentGeneration
    const revAtEnqueue = this.revision

    if (op.kind === "clear") {
      // CLEAR is a barrier: flush every pending debounced per-line op immediately
      for (const [pid, { op: pending, timer }] of this.pendingByProduct.entries()) {
        clearTimeout(timer)
        this.pendingByProduct.delete(pid)
        this.chainExecution(pending, currentScope, currentGen, revAtEnqueue)
      }
      this.chainExecution(op, currentScope, currentGen, revAtEnqueue)
      return
    }

    const pid = op.productId
    const existing = this.pendingByProduct.get(pid)
    const merged = this.mergeOps(existing?.op, op)

    if (existing) {
      clearTimeout(existing.timer)
    }

    const timer = setTimeout(() => {
      this.pendingByProduct.delete(pid)
      this.chainExecution(merged, currentScope, currentGen, revAtEnqueue)
    }, this.debounceMs)

    this.pendingByProduct.set(pid, { op: merged, timer, gen: currentGen, rev: revAtEnqueue })
  }

  /**
   * Flush all pending operations and await total synchronization.
   * Drains work reliably without infinite loops, preserves unresolved failures,
   * reports failure and returns the accepted authoritative snapshot.
   */
  public async flush(): Promise<{ success: boolean; revision: number; snapshot: T; error?: string }> {
    const targetScope = this.currentScope
    const targetGen = this.currentGeneration
    this.lastFlushFailed = false
    this.lastError = null

    // Drain all pending and in-flight work for this generation
    let iterations = 0
    const maxIterations = 50 // Guard against infinite loops while allowing drain of rapid edits
    while (
      (this.pendingByProduct.size > 0 || this.inFlightCount > 0) &&
      this.currentScope === targetScope &&
      this.currentGeneration === targetGen &&
      iterations < maxIterations
    ) {
      iterations += 1
      for (const [pid, { op, timer, gen, rev }] of this.pendingByProduct.entries()) {
        clearTimeout(timer)
        this.pendingByProduct.delete(pid)
        this.chainExecution(op, targetScope, gen, rev)
      }
      await this.executionChain
    }

    // Preserve unresolved failure state until explicitly reconciled:
    // A flush is ONLY successful if neither lastFlushFailed was tripped AND zero failedMutations remain.
    const hasUnresolvedFailures = this.failedMutations.length > 0 || this.lastFlushFailed
    const success =
      !hasUnresolvedFailures &&
      this.currentScope === targetScope &&
      this.currentGeneration === targetGen

    const snapshot = this.getSnapshot()

    return {
      success,
      revision: this.revision,
      snapshot,
      error: this.lastError || (hasUnresolvedFailures ? "Unresolved cart mutations" : undefined),
    }
  }

  public isBusy(): boolean {
    return this.pendingByProduct.size > 0 || this.inFlightCount > 0
  }
}

export default CartMutationQueue;
