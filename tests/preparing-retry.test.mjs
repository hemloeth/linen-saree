import test from "node:test"
import assert from "node:assert/strict"
import { PreparingRetryManager } from "../lib/preparing-retry.ts"

test("TASK 5: Bounded retries and backoff delay progression", (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 3,
    backoffMs: [100, 200, 300],
  })

  // 1st retry
  const r1 = manager.scheduleRetry({
    attemptId: "order_123",
    onExecute: () => {},
    onExhausted: () => {},
  })
  assert.equal(r1.scheduled, true)
  assert.equal(r1.delay, 100)
  assert.equal(r1.count, 1)
  assert.equal(manager.currentRetryCount, 1)

  // 2nd retry
  const r2 = manager.scheduleRetry({
    attemptId: "order_123",
    onExecute: () => {},
    onExhausted: () => {},
  })
  assert.equal(r2.scheduled, true)
  assert.equal(r2.delay, 200)
  assert.equal(r2.count, 2)

  // 3rd retry
  const r3 = manager.scheduleRetry({
    attemptId: "order_123",
    onExecute: () => {},
    onExhausted: () => {},
  })
  assert.equal(r3.scheduled, true)
  assert.equal(r3.delay, 300)
  assert.equal(r3.count, 3)

  manager.cancel()
})

test("TASK 5: Retry limit exhaustion calls onExhausted without marking failed", (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 2,
    backoffMs: [50, 100],
  })

  let exhaustedCalled = false
  let exhaustedAttemptId = null

  manager.scheduleRetry({
    attemptId: "order_abc",
    onExecute: () => {},
    onExhausted: () => {},
  })
  manager.scheduleRetry({
    attemptId: "order_abc",
    onExecute: () => {},
    onExhausted: () => {},
  })

  // 3rd attempt exceeds maxRetries (2)
  const r3 = manager.scheduleRetry({
    attemptId: "order_abc",
    onExecute: () => {},
    onExhausted: (id) => {
      exhaustedCalled = true
      exhaustedAttemptId = id
    },
  })

  assert.equal(r3.scheduled, false)
  assert.equal(exhaustedCalled, true)
  assert.equal(exhaustedAttemptId, "order_abc")
  assert.equal(manager.isScheduled, false)
})

test("TASK 5: Timer cancellation stops delayed execution", async (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 5,
    backoffMs: [50],
  })

  let executed = false
  manager.scheduleRetry({
    attemptId: "order_cancel",
    onExecute: () => {
      executed = true
    },
    onExhausted: () => {},
  })

  assert.equal(manager.isScheduled, true)
  manager.cancel()
  assert.equal(manager.isScheduled, false)

  await new Promise((r) => setTimeout(r, 70))
  assert.equal(executed, false, "Cancelled timer must never execute")
})

test("TASK 5: Attempt change resets count and cancels obsolete timers", async (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 5,
    backoffMs: [50, 100],
  })

  let order1Executed = false
  manager.scheduleRetry({
    attemptId: "order_1",
    onExecute: () => {
      order1Executed = true
    },
    onExhausted: () => {},
  })
  assert.equal(manager.currentRetryCount, 1)

  // Switch to order_2
  let order2Executed = false
  manager.scheduleRetry({
    attemptId: "order_2",
    onExecute: () => {
      order2Executed = true
    },
    onExhausted: () => {},
  })

  // Retry count should have reset to 1 for the new attempt
  assert.equal(manager.currentRetryCount, 1)
  assert.equal(manager.currentAttemptId, "order_2")

  await new Promise((r) => setTimeout(r, 70))
  assert.equal(order1Executed, false, "Obsolete attempt must not execute")
  assert.equal(order2Executed, true, "New attempt must execute")
})

test("TASK 5: Manual action cancels automatic retry timer and prevents overlap", async (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 5,
    backoffMs: [50],
  })

  let autoExecuted = false
  manager.scheduleRetry({
    attemptId: "order_manual",
    onExecute: () => {
      autoExecuted = true
    },
    onExhausted: () => {},
  })

  assert.equal(manager.isScheduled, true)
  // User clicks manual "Resume Payment" or "Re-check"
  manager.handleManualAction()
  assert.equal(manager.isScheduled, false)

  await new Promise((r) => setTimeout(r, 70))
  assert.equal(autoExecuted, false, "Automatic execution must not overlap with manual action")
})

test("TASK 5: Terminal / Success reset clears timers and state completely", (t) => {
  const manager = new PreparingRetryManager({
    maxRetries: 5,
    backoffMs: [1000],
  })

  manager.scheduleRetry({
    attemptId: "order_settled",
    onExecute: () => {},
    onExhausted: () => {},
  })

  assert.equal(manager.isScheduled, true)
  assert.equal(manager.currentRetryCount, 1)

  manager.reset()

  assert.equal(manager.isScheduled, false)
  assert.equal(manager.currentRetryCount, 0)
  assert.equal(manager.currentAttemptId, null)
})

test("TASK 5: Late responses detected via isObsolete guard", (t) => {
  const manager = new PreparingRetryManager()
  manager.scheduleRetry({
    attemptId: "order_active",
    onExecute: () => {},
    onExhausted: () => {},
  })

  const currentGen = manager.currentGeneration

  assert.equal(manager.isObsolete("order_old", currentGen), true)
  assert.equal(manager.isObsolete("order_active", currentGen - 1), true)
  assert.equal(manager.isObsolete("order_active", currentGen), false)
})

test("TASK 2: Synchronous operation lock prevents overlapping manual and automatic requests", () => {
  const manager = new PreparingRetryManager()
  
  // Start operation 1 (e.g. initial checkout or verification)
  const op1 = manager.startOperation("user_1", "order_100")
  assert.ok(op1, "Operation 1 must be granted")
  assert.equal(manager.isOperationActive, true)

  // Concurrent attempt to start another operation while op1 is active
  const op2 = manager.startOperation("user_1", "order_100")
  assert.equal(op2, null, "Operation 2 must be rejected by synchronous lock while op1 is active")

  // Finish op1
  const ended = manager.endOperation(op1)
  assert.equal(ended, true)
  assert.equal(manager.isOperationActive, false)

  // Now a new operation can proceed
  const op3 = manager.startOperation("user_1", "order_100")
  assert.ok(op3, "Operation 3 must succeed after lock is released")
  manager.endOperation(op3)
})

test("TASK 2: Account change while verification is pending invalidates operation", () => {
  const manager = new PreparingRetryManager()
  const op = manager.startOperation("user_alice", "order_alice_1")
  assert.ok(op)

  // Account changes to user_bob while async verification is in flight
  manager.startOperation("user_bob", "order_bob_1")

  // Alice's op returns late and attempts validation
  assert.equal(manager.isOperationValid(op), false, "Alice's operation must be invalid under Bob's account")

  // Alice's finally block attempts to end operation
  const ended = manager.endOperation(op)
  assert.equal(ended, false, "Obsolete operation cannot release or alter Bob's state")
})

test("TASK 2: New attempt started before old response returns invalidates old attempt", () => {
  const manager = new PreparingRetryManager()
  const op1 = manager.startOperation("user_1", "order_old")
  assert.ok(op1)

  // User retries / initiates a new order attempt
  const op2 = manager.startOperation("user_1", "order_new")
  assert.ok(op2)
  assert.notEqual(op1.attemptId, op2.attemptId)

  // op1 completes late
  assert.equal(manager.isOperationValid(op1), false, "Old attempt op1 must be recognized as obsolete")
  assert.equal(manager.isOperationValid(op2), true, "New attempt op2 remains valid")

  // Late finally block from op1 cannot clear op2's active lock
  manager.endOperation(op1)
  assert.equal(manager.isOperationActive, true, "op2's lock must remain held")

  manager.endOperation(op2)
  assert.equal(manager.isOperationActive, false)
})

test("TASK 2: Unmount invalidates active operations and cancels timers", () => {
  const manager = new PreparingRetryManager()
  const op = manager.startOperation("user_1", "order_unmount")
  manager.scheduleRetry({
    attemptId: "order_unmount",
    onExecute: () => {},
    onExhausted: () => {},
  })

  assert.equal(manager.isScheduled, true)
  assert.equal(manager.isOperationActive, true)

  // Unmount happens
  manager.invalidateAll()

  assert.equal(manager.isScheduled, false, "Retry timer must be cancelled on unmount")
  assert.equal(manager.isOperationValid(op), false, "In-flight op must be invalid after unmount")
})

test("TASK 2: Success deduplication prevents duplicate cart settlement or navigation", () => {
  const manager = new PreparingRetryManager()

  // First success call for order_123
  const firstSuccess = manager.deduplicateSuccess("order_123")
  assert.equal(firstSuccess, true, "First success must be permitted to execute side effects")

  // Duplicate / replayed success call for same order_123
  const secondSuccess = manager.deduplicateSuccess("order_123")
  assert.equal(secondSuccess, false, "Repeated success must be deduplicated")

  // Different order should succeed
  const otherOrderSuccess = manager.deduplicateSuccess("order_456")
  assert.equal(otherOrderSuccess, true, "New order must be permitted")
})

// --- Fake Razorpay SDK Harness for lifecycle tests ---
class FakeRazorpaySDK {
  constructor(options) {
    this.options = options
    this.isOpen = false
    this.closed = false
    this.listeners = {}
  }
  on(event, cb) {
    this.listeners[event] = cb
  }
  open() {
    this.isOpen = true
  }
  close() {
    this.closed = true
    this.isOpen = false
  }
  async triggerSuccess(res = { razorpay_payment_id: "pay_1", razorpay_order_id: "rzp_1", razorpay_signature: "sig_1" }) {
    if (this.options.handler) {
      return await this.options.handler(res)
    }
  }
  triggerDismiss() {
    if (this.options.modal?.ondismiss) {
      this.options.modal.ondismiss()
    }
  }
  triggerFailure(err = { description: "Card declined" }) {
    if (this.listeners["payment.failed"]) {
      this.listeners["payment.failed"]({ error: err })
    }
  }
}

test("TASK 1: Resume -> modal -> verification lock handoff executes exactly once", async () => {
  const manager = new PreparingRetryManager()
  let settled = false
  const settle = () => { settled = true }

  // 1. Resume starts: acquires operation lock under attempt
  const resumeOp = manager.startOperation("user_1", "att_1")
  assert.ok(resumeOp, "Resume operation must acquire lock")
  assert.equal(manager.isOperationActive, true)

  // Associate backend order ID once learned
  manager.associateOrderId("order_100")

  // 2. Payable outcome transitions lock to modal session
  const modalSession = manager.startModalSession(resumeOp, "order_100", settle)
  assert.ok(modalSession, "Modal session must be established from parent op")
  assert.equal(manager.isModalActive, true)

  // Parent operation finally runs: does NOT unset modal lock or state
  const parentEnded = manager.endOperation(resumeOp)
  assert.equal(parentEnded, false, "Parent finally cannot release modal's lock")
  assert.equal(manager.isModalActive, true)

  // Competing manual action cannot open a competing modal
  const competingOp = manager.startOperation("user_1", "att_1")
  assert.equal(competingOp, null, "Competing operation must be blocked while modal is active")

  // 3. Fake Razorpay SDK opens and triggers payment success callback
  let verificationExecuted = 0
  let outcomeApplied = false

  const fakeSdk = new FakeRazorpaySDK({
    handler: async (resp) => {
      assert.equal(manager.isModalSessionValid(modalSession), true)
      const verifyOp = manager.startVerificationFromModal(modalSession)
      assert.ok(verifyOp, "Verification operation must be granted from modal")
      verificationExecuted++

      // Verification sends request and applies outcome
      outcomeApplied = true
      manager.endOperation(verifyOp)
      modalSession.settle()
    }
  })
  manager.registerActiveModalInstance(modalSession, fakeSdk)
  fakeSdk.open()

  // First success callback
  await fakeSdk.triggerSuccess()
  assert.equal(verificationExecuted, 1, "Verification must execute exactly once")
  assert.equal(outcomeApplied, true, "Backend outcome must be applied")
  assert.equal(settled, true, "Modal promise must settle")
  assert.equal(manager.isOperationActive, false, "Operation lock must be released after verification")
  assert.equal(manager.isModalActive, false, "Modal must be inactive")

  // Duplicate callback test: duplicate callback returns null and does not execute verification again
  const duplicateVerifyOp = manager.startVerificationFromModal(modalSession)
  assert.equal(duplicateVerifyOp, null, "Duplicate callback must be dropped")
  assert.equal(verificationExecuted, 1, "Verification must NOT be executed a second time")
})

test("TASK 1: Modal dismissal cleans up state and leaves usable recovery controls without stuck lock", () => {
  const manager = new PreparingRetryManager()
  let settled = false
  const settle = () => { settled = true }

  const op = manager.startOperation("user_1", "att_dismiss")
  const modalSession = manager.startModalSession(op, "order_dismiss", settle)
  assert.equal(manager.isModalActive, true)

  // User dismisses modal
  manager.endModalSession(modalSession)
  assert.equal(settled, true, "Modal promise must settle on dismiss")
  assert.equal(manager.isModalActive, false, "Modal must be inactive")
  assert.equal(manager.isOperationActive, false, "No lock should remain held")

  // User can now resume payment without deadlock
  const resumeOp = manager.startOperation("user_1", "att_dismiss")
  assert.ok(resumeOp, "User must be able to start a new resume operation after dismissal")
  manager.endOperation(resumeOp)
})

test("TASK 2: Initial checkout learns order ID, returns preparing, and releases lock cleanly for retry", async () => {
  const manager = new PreparingRetryManager({
    maxRetries: 3,
    backoffMs: [20, 40, 60],
  })

  // 1. Initial checkout starts under stable attempt identity
  const op = manager.startOperation("user_1", "att_order_create")
  assert.ok(op)
  assert.equal(manager.isOperationActive, true)

  // 2. Order ID is learned from backend response
  manager.associateOrderId("order_learned_999")

  // 3. Response is preparing -> scheduleRetry
  let retryExecuted = false
  const scheduleResult = manager.scheduleRetry({
    attemptId: "order_learned_999",
    onExecute: (attemptId) => {
      // Automatic retry starts: must be able to acquire lock
      const retryOp = manager.startOperation("user_1", attemptId)
      assert.ok(retryOp, "Scheduled retry must acquire lock cleanly")
      retryExecuted = true
      manager.endOperation(retryOp)
    },
    onExhausted: () => {},
  })
  assert.equal(scheduleResult.scheduled, true)

  // 4. op's finally block runs: MUST release lock because generation was NOT bumped
  const ended = manager.endOperation(op)
  assert.equal(ended, true, "Original operation finally must successfully release the lock")
  assert.equal(manager.isOperationActive, false, "Lock must be released while timer waits")

  // 5. Timer elapses and executes retry
  await new Promise((r) => setTimeout(r, 35))
  assert.equal(retryExecuted, true, "Scheduled retry must have executed recovery request")
})

test("TASK 2: Multiple preparing responses reach retry limit without deadlock and permit manual retry after exhaustion", async () => {
  const manager = new PreparingRetryManager({
    maxRetries: 2,
    backoffMs: [10, 20],
  })

  let exhaustedCalled = false
  const onExhausted = () => { exhaustedCalled = true }

  // Initial attempt learns orderId
  const op1 = manager.startOperation("user_1", "att_prep")
  manager.associateOrderId("order_prep_1")
  manager.scheduleRetry({ attemptId: "order_prep_1", onExecute: () => {}, onExhausted })
  manager.endOperation(op1)

  // Retry 1
  const op2 = manager.startOperation("user_1", "order_prep_1")
  manager.scheduleRetry({ attemptId: "order_prep_1", onExecute: () => {}, onExhausted })
  manager.endOperation(op2)

  // Retry 2 reaches limit
  const op3 = manager.startOperation("user_1", "order_prep_1")
  const r3 = manager.scheduleRetry({ attemptId: "order_prep_1", onExecute: () => {}, onExhausted })
  manager.endOperation(op3)

  assert.equal(r3.scheduled, false)
  assert.equal(exhaustedCalled, true, "onExhausted must be called on limit")
  assert.equal(manager.isOperationActive, false, "No lock must be held")

  // Manual retry works after exhaustion
  manager.handleManualAction()
  const manualOp = manager.startOperation("user_1", "order_prep_1")
  assert.ok(manualOp, "Manual retry must be able to start after exhaustion")
  manager.endOperation(manualOp)
})

test("TASK 2: Rejected overlapping action does NOT abort active operation", () => {
  const manager = new PreparingRetryManager()

  // Start real active operation
  const activeOp = manager.startOperation("user_1", "att_1")
  assert.ok(activeOp)
  const signal = manager.getSignal()
  assert.ok(signal)
  assert.equal(signal.aborted, false)

  // User double-clicks / clicks overlapping action
  const overlappingOp = manager.startOperation("user_1", "att_1")
  assert.equal(overlappingOp, null, "Overlapping action must be rejected")

  // Active operation must NOT have been aborted by the rejected click
  assert.equal(signal.aborted, false, "Active request must NOT be aborted by a rejected overlapping action")

  manager.endOperation(activeOp)
})

test("TASK 3: Account change or unmount during script load prevents modal from opening", async () => {
  const manager = new PreparingRetryManager()
  let settled = false
  const settle = () => { settled = true }

  const op = manager.startOperation("user_alice", "att_alice")
  const modalSession = manager.startModalSession(op, "order_alice", settle)

  // User logs out and switches to Bob while script is loading
  manager.invalidateAll()
  manager.startOperation("user_bob", "att_bob")

  // Script load finishes late:
  const isValid = manager.isModalSessionValid(modalSession)
  assert.equal(isValid, false, "Modal session must be invalid after account switch")
  assert.equal(settled, true, "Retired modal session must have settled its promise")
})

test("TASK 3: Retired modal ignores late callbacks and does not mutate new checkout", async () => {
  const manager = new PreparingRetryManager()
  let settled = false
  const settle = () => { settled = true }

  const opAlice = manager.startOperation("user_alice", "att_alice")
  const modalAlice = manager.startModalSession(opAlice, "order_alice", settle)
  assert.ok(modalAlice)

  const fakeSdk = new FakeRazorpaySDK({
    handler: async (resp) => {
      // Old success callback tries to start verification
      return manager.startVerificationFromModal(modalAlice)
    }
  })
  manager.registerActiveModalInstance(modalAlice, fakeSdk)

  // Bob logs in
  manager.invalidateAll()
  const opBob = manager.startOperation("user_bob", "att_bob")
  assert.ok(opBob)

  // Alice's modal fires late success callback
  const lateVerifyOp = await fakeSdk.triggerSuccess()
  assert.equal(lateVerifyOp, null, "Old success callback must NOT start verification")
  assert.equal(manager.currentScope, "user_bob", "Scope must remain Bob")
  assert.equal(manager.isOperationValid(opBob), true, "Bob's active operation must remain valid and uncorrupted")

  manager.endOperation(opBob)
})


