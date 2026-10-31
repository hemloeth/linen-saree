/**
 * Preparing Retry Manager & Checkout Lifecycle Coordinator
 *
 * Implements bounded retries with exponential backoff for orders in the
 * "preparing" gateway initialization state, and coordinates checkout
 * operation identities across the entire lifecycle:
 *   placing -> preparing/recovery -> payment modal -> verification -> final outcome.
 *
 * Guarantees:
 * 1. Bounded retry count (default max 5).
 * 2. Backoff delay progression (1.5s -> 2s -> 3s -> 4s -> 5s).
 * 3. Synchronous mutual exclusion preventing manual actions and automatic retry overlap,
 *    without aborting active requests on rejected overlapping clicks.
 * 4. Explicit lock handoff: request operation -> modal session -> verification operation.
 * 5. Stable attempt identity: receiving or associating a backend order ID does not
 *    accidentally replace attempt ownership or orphan locks.
 * 6. Modal session lifecycle: guards script loading, success, dismissal, and failure callbacks;
 *    retires cleanly on unmount, account switch, or attempt replacement without hanging promises.
 * 7. Order-scoped deduplication of success side effects and verification callbacks.
 * 8. Exhaustion preserves recovery state (never marks order failed).
 */

export interface CheckoutOperationIdentity {
  scope: string
  attemptId: string
  generation: number
  operationId: number
}

export interface ModalSession {
  modalId: number
  scope: string
  attemptId: string
  orderId: string
  generation: number
  settled: boolean
  retired: boolean
  verificationStarted: boolean
  settle: () => void
}

export interface PreparingRetryOptions {
  maxRetries?: number
  backoffMs?: number[]
}

export class PreparingRetryManager {
  private timer: any = null
  private retryCount: number = 0
  private attemptId: string | null = null
  private currentOrderId: string | null = null
  private scope: string | null = null
  private generation: number = 0
  private operationSeq: number = 0
  private activeOperationId: number | null = null
  private activeAbortController: AbortController | null = null
  private settledOrders = new Set<string>()
  private modalSeq: number = 0
  private activeModalSession: ModalSession | null = null
  private activeModalInstance: any = null

  readonly maxRetries: number
  readonly backoffMs: number[]

  constructor(options?: PreparingRetryOptions) {
    this.maxRetries = options?.maxRetries ?? 5
    this.backoffMs = options?.backoffMs ?? [1500, 2000, 3000, 4000, 5000]
  }

  get currentRetryCount(): number {
    return this.retryCount
  }

  get currentAttemptId(): string | null {
    return this.attemptId
  }

  get associatedOrderId(): string | null {
    return this.currentOrderId
  }

  get currentScope(): string | null {
    return this.scope
  }

  get currentGeneration(): number {
    return this.generation
  }

  get isScheduled(): boolean {
    return this.timer !== null
  }

  get isOperationActive(): boolean {
    return this.activeOperationId !== null
  }

  get isModalActive(): boolean {
    return this.activeModalSession !== null && !this.activeModalSession.retired
  }

  get activeModal(): ModalSession | null {
    return this.activeModalSession
  }

  /**
   * Associate a backend order ID with the active checkout attempt without
   * bumping generation, resetting retry count, or invalidating the active operation.
   */
  associateOrderId(orderId: string): void {
    if (!orderId) return
    this.currentOrderId = orderId
  }

  /**
   * Cancel any pending retry timer and optionally abort in-flight network request.
   */
  cancel(abortRequest: boolean = false): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (abortRequest && this.activeAbortController) {
      try {
        this.activeAbortController.abort()
      } catch {}
      this.activeAbortController = null
    }
  }

  /**
   * Retire the active payment modal instance and settle its waiting promise.
   */
  retireModal(): void {
    if (this.activeModalSession) {
      const session = this.activeModalSession
      session.retired = true
      this.activeModalSession = null
      if (this.activeModalInstance) {
        try {
          this.activeModalInstance.close?.()
        } catch {}
        this.activeModalInstance = null
      }
      if (!session.settled) {
        session.settled = true
        try {
          session.settle()
        } catch {}
      }
    }
  }

  /**
   * Invalidate all in-flight operations, cancel timers, and retire modals.
   * Called on unmount, account switch, or attempt replacement.
   */
  invalidateAll(): void {
    this.retireModal()
    this.cancel(true)
    this.activeOperationId = null
    this.generation++
  }

  /**
   * Reset retry count and cancel active timer/operation/modal.
   * Called on terminal transition or fresh attempt initialization.
   */
  reset(): void {
    this.retireModal()
    this.cancel(true)
    this.activeOperationId = null
    this.retryCount = 0
    this.attemptId = null
    this.currentOrderId = null
    this.generation++
  }

  /**
   * Called when a manual user action starts (e.g. user clicks Re-check or Resume Payment).
   * Prevents automatic timer from colliding with manual execution.
   */
  handleManualAction(): void {
    this.cancel(false)
    this.activeOperationId = null
    this.generation++
  }

  /**
   * Checks whether a response belongs to an obsolete attempt or superseded generation.
   */
  isObsolete(attemptId: string, generation?: number): boolean {
    if (this.attemptId && this.attemptId !== attemptId && this.currentOrderId !== attemptId) return true
    if (generation !== undefined && generation !== this.generation) return true
    return false
  }

  /**
   * Synchronously starts a checkout operation under an identity: scope + attemptId.
   * Enforces mutual exclusion: returns null if an operation or modal is already active.
   * A rejected overlapping action does NOT abort the valid active operation.
   */
  startOperation(scope: string, attemptId: string): CheckoutOperationIdentity | null {
    // 1. Account scope change: invalidates previous account's operations and modals
    if (this.scope && this.scope !== scope) {
      this.invalidateAll()
      this.retryCount = 0
      this.attemptId = null
      this.currentOrderId = null
    }
    this.scope = scope

    // Check whether the requested attemptId belongs to the current attempt (or its known order alias)
    const isSameAttempt =
      this.attemptId === null ||
      this.attemptId === attemptId ||
      this.currentOrderId === attemptId

    if (isSameAttempt) {
      // 2. For the current attempt / alias: synchronous mutual exclusion
      // If an operation or modal is already active for this attempt, reject overlapping actions
      // without mutating attempt identity, bumping generation, or aborting in-flight requests.
      if (this.isOperationActive || this.isModalActive) {
        return null
      }

      if (this.attemptId === null) {
        this.attemptId = attemptId
      }
      // If this.attemptId already exists and attemptId is an alias (e.g. currentOrderId),
      // preserve this.attemptId as the stable primary attempt key without overwriting it.
    } else {
      // 3. Genuine attempt replacement: starting a genuinely different attempt supersedes the old attempt
      this.retireModal()
      this.cancel(true)
      this.activeOperationId = null
      this.currentOrderId = null
      this.retryCount = 0
      this.generation++
      this.attemptId = attemptId
    }

    // Cancel pending retry timer now that a live request is starting
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.activeOperationId = ++this.operationSeq
    this.activeAbortController = new AbortController()

    return {
      scope,
      attemptId,
      generation: this.generation,
      operationId: this.activeOperationId,
    }
  }

  /**
   * Validates whether a captured operation identity is still valid (not superseded).
   */
  isOperationValid(op: CheckoutOperationIdentity | null): boolean {
    if (!op) return false
    if (this.scope && op.scope !== this.scope) return false
    if (op.generation !== this.generation) return false
    if (op.operationId !== this.activeOperationId) return false
    if (this.attemptId && op.attemptId !== this.attemptId && op.attemptId !== this.currentOrderId) return false
    return true
  }

  /**
   * Unlocks the operation if the finishing identity is still active.
   * Returns true if successfully released; false if operation was already superseded or handed off.
   */
  endOperation(op: CheckoutOperationIdentity | null): boolean {
    if (!op) return false
    if (this.isOperationValid(op)) {
      this.activeOperationId = null
      this.activeAbortController = null
      return true
    }
    return false
  }

  /**
   * Transitions lock ownership from the active request operation to a ModalSession.
   * Releases parent operation lock so its finally block will not unset modal state,
   * while holding modal session mutual exclusion to block duplicate clicks.
   */
  startModalSession(parentOp: CheckoutOperationIdentity, orderId: string, settle: () => void): ModalSession | null {
    if (!this.isOperationValid(parentOp)) return null
    if (parentOp.scope !== this.scope) return null

    this.retireModal()
    if (orderId) {
      this.currentOrderId = orderId
    }

    // Release activeOperationId so parentOp finally block exits safely without resetting modal
    this.activeOperationId = null
    this.activeAbortController = null

    const session: ModalSession = {
      modalId: ++this.modalSeq,
      scope: this.scope!,
      attemptId: this.attemptId || parentOp.attemptId,
      orderId,
      generation: this.generation,
      settled: false,
      retired: false,
      verificationStarted: false,
      settle,
    }

    this.activeModalSession = session
    return session
  }

  /**
   * Registers the active Razorpay SDK instance for modal dismissal / retirement.
   */
  registerActiveModalInstance(session: ModalSession, instance: any): void {
    if (this.isModalSessionValid(session)) {
      this.activeModalInstance = instance
    }
  }

  /**
   * Validates whether a modal session is still active and belongs to current lifecycle.
   */
  isModalSessionValid(session: ModalSession | null): boolean {
    if (!session || session.retired) return false
    if (this.activeModalSession?.modalId !== session.modalId) return false
    if (this.scope !== session.scope) return false
    if (this.generation !== session.generation) return false
    return true
  }

  /**
   * Atomically transitions ownership from an active modal session to a verification operation.
   * Deduplicates duplicate callbacks: returns null if verification has already been started.
   */
  startVerificationFromModal(session: ModalSession): CheckoutOperationIdentity | null {
    if (!this.isModalSessionValid(session)) return null
    if (session.verificationStarted) return null // deduplicate duplicate callbacks

    session.verificationStarted = true

    // Release modal session lock and acquire verification operation lock
    this.activeModalSession = null
    this.activeModalInstance = null

    this.activeOperationId = ++this.operationSeq
    this.activeAbortController = new AbortController()

    return {
      scope: session.scope,
      attemptId: session.attemptId,
      generation: this.generation,
      operationId: this.activeOperationId,
    }
  }

  /**
   * Concludes a modal session upon dismissal or failure without starting verification.
   */
  endModalSession(session: ModalSession): void {
    if (this.isModalSessionValid(session)) {
      this.activeModalSession = null
      this.activeModalInstance = null
    }
    if (!session.settled) {
      session.settled = true
      try {
        session.settle()
      } catch {}
    }
  }

  /**
   * Gets the active AbortSignal for the current operation.
   */
  getSignal(): AbortSignal | undefined {
    return this.activeAbortController?.signal
  }

  /**
   * Deduplicates success finalization side effects per order.
   * Returns true if first time marking settled; false if already settled.
   */
  deduplicateSuccess(orderId: string): boolean {
    if (!orderId) return true
    if (this.settledOrders.has(orderId)) {
      return false
    }
    this.settledOrders.add(orderId)
    return true
  }

  /**
   * Schedules a retry if below maxRetries.
   * Associates orderId with the active attempt without invalidating the active operation.
   * If retry limit is reached, invokes onExhausted and returns false.
   */
  scheduleRetry({
    attemptId,
    onExecute,
    onExhausted,
  }: {
    attemptId: string
    onExecute: (attemptId: string) => void
    onExhausted: (attemptId: string) => void
  }): { scheduled: boolean; delay?: number; count?: number } {
    const isSameAttempt = this.attemptId === attemptId || this.currentOrderId === attemptId

    if (!isSameAttempt) {
      if (this.attemptId === null) {
        this.attemptId = attemptId
        this.retryCount = 0
        this.generation++
      } else {
        // Different attempt: reset count and cancel obsolete timers
        this.cancel(false)
        this.attemptId = attemptId
        this.currentOrderId = null
        this.retryCount = 0
        this.generation++
      }
    }

    if (this.retryCount >= this.maxRetries) {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      onExhausted(attemptId)
      return { scheduled: false }
    }

    const currentAttemptGen = this.generation
    const currentAttemptScope = this.scope
    const currentAttemptId = this.attemptId
    const currentOrderId = this.currentOrderId
    const delay = this.backoffMs[this.retryCount] ?? this.backoffMs[this.backoffMs.length - 1]
    this.retryCount += 1
    const count = this.retryCount

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.timer = setTimeout(() => {
      this.timer = null
      // Check that attempt, scope, and generation didn't change while waiting
      if (
        this.generation === currentAttemptGen &&
        (!currentAttemptScope || this.scope === currentAttemptScope) &&
        (this.attemptId === currentAttemptId || this.currentOrderId === currentOrderId || this.attemptId === attemptId)
      ) {
        onExecute(attemptId)
      }
    }, delay)

    return { scheduled: true, delay, count }
  }
}
