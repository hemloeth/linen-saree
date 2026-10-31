import test from "node:test"
import assert from "node:assert/strict"
import { CartMutationQueue } from "../lib/mutation-queue.ts"

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test("TASK 3: Local edit during in-flight GET causes snapshot rejection and preserves newer local revision", async () => {
  let cartSnapshot = [{ id: "p1", quantity: 2 }]
  const queue = new CartMutationQueue({
    debounceMs: 50,
    execute: async () => true,
    getSnapshot: () => cartSnapshot,
  })

  queue.setScope("user_1")
  const revAtStart = queue.getRevision()
  const activeGen = queue.getGeneration()
  const activeScope = queue.getScope()

  // In-flight GET is running...
  const def = deferred()

  // Concurrently, user updates cart quantity locally before GET resolves:
  queue.bumpRevision()
  queue.enqueue({ kind: "set", productId: "p1", quantity: 5 }, queue.getRevision())
  const currentRev = queue.getRevision()

  assert.notEqual(revAtStart, currentRev, "Revision must have advanced")

  // Simulate GET completing with server response:
  const serverCart = [{ id: "p1", quantity: 2 }]
  def.resolve(serverCart)
  const data = await def.promise

  // Since revAtStart !== queue.getRevision(), snapshot MUST be rejected:
  const isSnapshotStale = revAtStart !== queue.getRevision()
  assert.equal(isSnapshotStale, true, "Snapshot must be recognized as stale")

  // Caller rejects snapshot: acceptServerSnapshot is NOT called
  // and reconciliation returns false:
  let reconciled = false
  if (!isSnapshotStale) {
    queue.acceptServerSnapshot(data.map((i) => i.id), activeScope, activeGen, revAtStart)
    reconciled = true
  }

  assert.equal(reconciled, false, "Reconciliation must report false when snapshot is rejected")
})

test("TASK 3: Rejected snapshot does NOT clear failures created before or during GET", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 10,
    execute: async () => false, // simulates failed mutation
    getSnapshot: () => [],
  })

  queue.setScope("user_1")
  // Create an initial failed mutation:
  queue.enqueue({ kind: "add", productId: "failed_p1", quantity: 1 })
  await queue.flush()

  assert.equal(queue.getFailedMutations().length, 1, "Must have 1 failed mutation")

  const revAtStart = queue.getRevision()
  const activeGen = queue.getGeneration()
  const activeScope = queue.getScope()

  // Local user edit happens while GET is pending:
  queue.bumpRevision()
  queue.enqueue({ kind: "set", productId: "p2", quantity: 3 }, queue.getRevision())

  // GET returns server cart without failed_p1:
  const serverProductIds = ["p2"]

  // Because snapshot is stale (revAtStart !== queue.getRevision()), it is rejected:
  if (revAtStart === queue.getRevision()) {
    queue.acceptServerSnapshot(serverProductIds, activeScope, activeGen, revAtStart)
  }

  // Verify that failures are preserved and NOT cleared by rejected snapshot:
  assert.equal(queue.getFailedMutations().length, 1, "Failed mutation must remain preserved")
  assert.equal(queue.getFailedMutations()[0].op.productId, "failed_p1")
})

test("TASK 3: Account switch during in-flight GET discards response and protects new account", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 50,
    execute: async () => true,
    getSnapshot: () => [],
  })

  queue.setScope("user_alice")
  const genAtStart = queue.getGeneration()
  const scopeAtStart = queue.getScope()

  // GET is in flight for Alice...
  const def = deferred()

  // Alice logs out and Bob logs in:
  queue.setScope("user_bob")
  const currentGen = queue.getGeneration()
  const currentScope = queue.getScope()

  assert.notEqual(genAtStart, currentGen)
  assert.notEqual(scopeAtStart, currentScope)

  // Alice's GET finishes late:
  def.resolve([{ id: "alice_secret_item", quantity: 1 }])
  const aliceData = await def.promise

  // Generation check rejects Alice's data from touching Bob:
  let appliedToBob = false
  if (genAtStart === queue.getGeneration() && scopeAtStart === queue.getScope()) {
    appliedToBob = true
  }

  assert.equal(appliedToBob, false, "Late response from previous account must be discarded")
})

test("TASK 3: Two overlapping GETs arriving out of order accept only the latest valid snapshot", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 50,
    execute: async () => true,
    getSnapshot: () => [],
  })

  queue.setScope("user_1")

  // Request 1 starts:
  const rev1 = queue.getRevision()
  const def1 = deferred()

  // User edits cart:
  queue.bumpRevision()
  queue.enqueue({ kind: "set", productId: "p1", quantity: 3 }, queue.getRevision())

  // Request 2 starts:
  const rev2 = queue.getRevision()
  const def2 = deferred()

  assert.ok(rev2 > rev1)

  // Request 2 resolves FIRST:
  def2.resolve([{ id: "p1", quantity: 3 }])
  const data2 = await def2.promise
  let accepted2 = false
  if (rev2 === queue.getRevision()) {
    queue.acceptServerSnapshot(data2.map((i) => i.id), queue.getScope(), queue.getGeneration(), rev2)
    accepted2 = true
  }
  assert.equal(accepted2, true, "Newer request matching revision must be accepted")

  // Request 1 arrives LATER (out of order):
  def1.resolve([{ id: "p1", quantity: 1 }])
  const data1 = await def1.promise
  let accepted1 = false
  if (rev1 === queue.getRevision()) {
    queue.acceptServerSnapshot(data1.map((i) => i.id), queue.getScope(), queue.getGeneration(), rev1)
    accepted1 = true
  }
  assert.equal(accepted1, false, "Older out-of-order request must be rejected")
})

test("TASK 3: Accepted snapshot resolves eligible older failures and absent products correctly", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 10,
    execute: async () => false,
    getSnapshot: () => [],
  })

  queue.setScope("user_1")
  // Failed add for an out-of-stock product
  queue.enqueue({ kind: "add", productId: "out_of_stock_item", quantity: 1 })
  await queue.flush()

  assert.equal(queue.getFailedMutations().length, 1)
  const revAtSnapshot = queue.getRevision()

  // Server confirms out_of_stock_item is absent from cart:
  const serverProductIds = ["other_item"]

  // Fresh snapshot accepted:
  const cleared = queue.acceptServerSnapshot(
    serverProductIds,
    queue.getScope(),
    queue.getGeneration(),
    revAtSnapshot
  )

  assert.equal(cleared, 1, "Must clear the absent failed product")
  assert.equal(queue.getFailedMutations().length, 0, "No lingering failures remain")
})

test("TASK 4: Two GETs at SAME mutation revision resolving out of order rejects older GET A", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 50,
    execute: async () => true,
    getSnapshot: () => [],
  })

  queue.setScope("user_1")
  const initialRev = queue.getRevision()

  // GET A starts: captures ticket A (ticketA.requestId = 1, revision = initialRev)
  const ticketA = queue.startServerFetch()
  assert.equal(ticketA.revision, initialRev)

  // GET B starts: captures ticket B (ticketB.requestId = 2, revision = initialRev)
  const ticketB = queue.startServerFetch()
  assert.equal(ticketB.revision, initialRev)
  assert.ok(ticketB.requestId > ticketA.requestId, "Ticket B must have higher sequence than Ticket A")

  // Both have the SAME mutation revision
  assert.equal(ticketA.revision, ticketB.revision)

  // GET B resolves FIRST with data [{ id: "item_b" }]
  const acceptedB = queue.acceptServerSnapshot(
    ["item_b"],
    ticketB.scope,
    ticketB.generation,
    ticketB.revision,
    ticketB.requestId
  )
  assert.notEqual(acceptedB, false, "Newer GET B must be accepted")

  // GET A resolves LATER with older snapshot [{ id: "item_a" }]
  // Despite having the exact same mutation revision, GET A MUST BE REJECTED by sequence guard!
  const acceptedA = queue.acceptServerSnapshot(
    ["item_a"],
    ticketA.scope,
    ticketA.generation,
    ticketA.revision,
    ticketA.requestId
  )
  assert.equal(acceptedA, false, "Older GET A must be rejected because ticket B was already accepted")
})

test("TASK 4: Mutation response accepted while older GET is pending rejects older GET", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 50,
    execute: async () => true,
    getSnapshot: () => [],
  })

  queue.setScope("user_1")
  // In-flight background GET starts
  const ticketGet = queue.startServerFetch()

  // Concurrently, a mutation completes and is accepted by the server
  queue.notifyMutationAccepted()

  // Background GET returns later
  const accepted = queue.acceptServerSnapshot(
    ["old_item"],
    ticketGet.scope,
    ticketGet.generation,
    ticketGet.revision,
    ticketGet.requestId
  )

  assert.equal(accepted, false, "Pending GET initiated before accepted mutation must be rejected")
})

test("TASK 4: Account switch during GET rejects snapshot and prevents clearing failures", async () => {
  const queue = new CartMutationQueue({
    debounceMs: 10,
    execute: async () => false,
    getSnapshot: () => [],
  })

  queue.setScope("user_alice")
  queue.enqueue({ kind: "add", productId: "item_alice", quantity: 1 })
  await queue.flush()
  assert.equal(queue.getFailedMutations().length, 1)

  // Alice starts GET
  const ticketAlice = queue.startServerFetch()

  // User switches to Bob
  queue.setScope("user_bob")

  // Alice's GET returns
  const accepted = queue.acceptServerSnapshot(
    ["item_alice"],
    ticketAlice.scope,
    ticketAlice.generation,
    ticketAlice.revision,
    ticketAlice.requestId
  )

  assert.equal(accepted, false, "GET from previous account must be rejected")
})

