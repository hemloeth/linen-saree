import test from "node:test"
import assert from "node:assert/strict"
import {
  loadRazorpayScript,
  resetScriptLoader,
  isRazorpayLoaded,
  openRazorpayModal,
  clearCheckoutLoadingStates,
} from "../lib/razorpay-modal.ts"
import { PreparingRetryManager } from "../lib/preparing-retry.ts"

/**
 * Fake Razorpay SDK that captures actual production options and callbacks
 */
class ProductionCapturingRazorpay {
  static createdInstances = []
  static constructorError = null

  constructor(options) {
    if (ProductionCapturingRazorpay.constructorError) {
      throw ProductionCapturingRazorpay.constructorError
    }
    this.options = options
    this.eventHandlers = {}
    this.isOpen = false
    this.isClosed = false
    this.closeThrows = false
    this.onThrows = false
    this.openThrows = false

    ProductionCapturingRazorpay.createdInstances.push(this)
  }

  on(event, handler) {
    if (this.onThrows) {
      throw new Error("SDK on() registration failure")
    }
    this.eventHandlers[event] = handler
  }

  open() {
    if (this.openThrows) {
      throw new Error("SDK open() window failure")
    }
    this.isOpen = true
  }

  close() {
    this.isClosed = true
    this.isOpen = false
    if (this.closeThrows) {
      throw new Error("SDK close() threw unexpectedly")
    }
    if (this.options?.modal?.ondismiss) {
      // Razorpay may synchronously invoke ondismiss when closed
      this.options.modal.ondismiss()
    }
  }

  // Trigger captured production callbacks
  triggerPaymentFailed(errorPayload = { error: { description: "Payment declined by issuing bank" } }) {
    if (this.eventHandlers["payment.failed"]) {
      this.eventHandlers["payment.failed"](errorPayload)
    }
  }

  async triggerSuccess(response = {
    razorpay_payment_id: "pay_test_123",
    razorpay_order_id: "order_rzp_123",
    razorpay_signature: "sig_test_123",
  }) {
    if (this.options?.handler) {
      return await this.options.handler(response)
    }
  }

  triggerDismiss() {
    if (this.options?.modal?.ondismiss) {
      this.options.modal.ondismiss()
    }
  }
}

/**
 * Minimal fake DOM environment for script loader tests
 */
function createFakeDOM() {
  const elements = new Map()
  const scriptListeners = new Map()

  const fakeDoc = {
    getElementById(id) {
      return elements.get(id) || null
    },
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(),
        id: "",
        src: "",
        async: false,
        parentNode: null,
        onload: null,
        onerror: null,
        addEventListener(event, listener) {
          if (!scriptListeners.has(this)) {
            scriptListeners.set(this, {})
          }
          scriptListeners.get(this)[event] = listener
        },
      }
      return el
    },
    body: {
      appendChild(child) {
        child.parentNode = fakeDoc.body
        if (child.id) {
          elements.set(child.id, child)
        }
        return child
      },
      removeChild(child) {
        child.parentNode = null
        if (child.id) {
          elements.delete(child.id)
        }
        return child
      },
    },
  }

  return {
    fakeDoc,
    elements,
    triggerScriptLoad(scriptId) {
      const el = elements.get(scriptId)
      if (el) {
        if (el.onload) el.onload()
        const listeners = scriptListeners.get(el)
        if (listeners?.load) listeners.load()
      }
    },
    triggerScriptError(scriptId) {
      const el = elements.get(scriptId)
      if (el) {
        if (el.onerror) el.onerror(new Error("Failed to fetch script"))
        const listeners = scriptListeners.get(el)
        if (listeners?.error) listeners.error(new Error("Failed to fetch script"))
      }
    },
  }
}

// =========================================================================
// TASK 1: Script Loading Failure Recovery & Loader Robustness
// =========================================================================

test("TASK 1: Script fails during initial checkout - loading clears, attempt remains recoverable, no orphaned lock", async () => {
  resetScriptLoader()
  const retryManager = new PreparingRetryManager()
  let loadingState = true
  let errorStateMsg = ""
  let attemptPhase = "placing"

  const parentOp = retryManager.startOperation("user_1", "att_init_1")
  assert.ok(parentOp)

  const modalPromise = openRazorpayModal({
    orderId: "order_task1_1",
    razorpayOrderId: "rzp_order_task1_1",
    amount: 50000,
    currency: "INR",
    parentOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => false, // Script fails to load
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      loadingState = false
      errorStateMsg = msg
      attemptPhase = "awaiting_payment"
    },
  })

  // Parent operation ends as in checkout/page.tsx
  retryManager.endOperation(parentOp)

  await modalPromise

  assert.equal(loadingState, false, "Loading state must be cleared after script load failure")
  assert.ok(errorStateMsg.includes("Resume Payment"), "Actionable recovery message must be shown")
  assert.equal(attemptPhase, "awaiting_payment", "Attempt must remain recoverable as awaiting_payment")
  assert.equal(retryManager.isModalActive, false, "No orphaned modal lock")
  assert.equal(retryManager.isOperationActive, false, "No orphaned operation lock")

  // Verify that subsequent manual resume is allowed immediately
  const resumeOp = retryManager.startOperation("user_1", "att_init_1")
  assert.ok(resumeOp, "Manual resume must be able to acquire operation lock")
  retryManager.endOperation(resumeOp)
})

test("TASK 1: Script fails during resume/recheck - controls become usable again", async () => {
  resetScriptLoader()
  const retryManager = new PreparingRetryManager()
  let isResumingPayment = true
  let errorReceived = ""

  const resumeOp = retryManager.startOperation("user_1", "order_pending_1")
  assert.ok(resumeOp)

  const modalPromise = openRazorpayModal({
    orderId: "order_pending_1",
    razorpayOrderId: "rzp_order_pending_1",
    amount: 35000,
    currency: "INR",
    parentOp: resumeOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => { throw new Error("Network timeout") },
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      isResumingPayment = false
      errorReceived = msg
    },
  })

  retryManager.endOperation(resumeOp)
  await modalPromise

  assert.equal(isResumingPayment, false, "Resume loading spinner must be cleared")
  assert.ok(errorReceived.length > 0)
  assert.equal(retryManager.isOperationActive, false)
  assert.equal(retryManager.isModalActive, false)
})

test("TASK 1: Concurrent callers share the same loading promise and unready script is not treated as ready", async () => {
  resetScriptLoader()
  const { fakeDoc, triggerScriptLoad } = createFakeDOM()
  const fakeWin = { document: fakeDoc, Razorpay: undefined }

  // 1st caller initiates load
  const p1 = loadRazorpayScript({ doc: fakeDoc, win: fakeWin, timeoutMs: 5000 })
  // 2nd caller immediately joins
  const p2 = loadRazorpayScript({ doc: fakeDoc, win: fakeWin, timeoutMs: 5000 })

  // Verify element exists in DOM but SDK is not yet ready
  const scriptEl = fakeDoc.getElementById("razorpay-script")
  assert.ok(scriptEl, "Script element must exist in DOM")
  assert.equal(isRazorpayLoaded(fakeWin), false, "SDK must not be ready before script executes")

  // Simulate script execution defining window.Razorpay
  fakeWin.Razorpay = function FakeRZP() {}
  triggerScriptLoad("razorpay-script")

  const [res1, res2] = await Promise.all([p1, p2])
  assert.equal(res1, true)
  assert.equal(res2, true)
  assert.equal(isRazorpayLoaded(fakeWin), true)
})

test("TASK 1: Failed load cleans up script tag and allows genuine subsequent retry", async () => {
  resetScriptLoader()
  const { fakeDoc, triggerScriptError, triggerScriptLoad } = createFakeDOM()
  const fakeWin = { document: fakeDoc, Razorpay: undefined }

  // First load attempt fails (e.g. offline/blocked)
  const p1 = loadRazorpayScript({ doc: fakeDoc, win: fakeWin, timeoutMs: 5000 })
  triggerScriptError("razorpay-script")
  const res1 = await p1

  assert.equal(res1, false, "First load attempt must report false on error")
  assert.equal(fakeDoc.getElementById("razorpay-script"), null, "Failed script element must be removed from DOM")

  // Second load attempt (retry) should create a fresh element and succeed
  const p2 = loadRazorpayScript({ doc: fakeDoc, win: fakeWin, timeoutMs: 5000 })
  const newScript = fakeDoc.getElementById("razorpay-script")
  assert.ok(newScript, "Retry must create a new script element")

  fakeWin.Razorpay = function FakeRZP() {}
  triggerScriptLoad("razorpay-script")

  const res2 = await p2
  assert.equal(res2, true, "Retry must successfully report true when SDK loads")
})

test("TASK 1: Script loader bounded timeout clears callers without getting stuck", async () => {
  resetScriptLoader()
  const { fakeDoc } = createFakeDOM()
  const fakeWin = { document: fakeDoc, Razorpay: undefined }

  const startTime = Date.now()
  // Call loader with a 50ms bounded timeout
  const result = await loadRazorpayScript({ doc: fakeDoc, win: fakeWin, timeoutMs: 50 })
  const elapsed = Date.now() - startTime

  assert.equal(result, false, "Timeout must return false")
  assert.ok(elapsed >= 45, "Must respect the timeout duration")
  assert.equal(fakeDoc.getElementById("razorpay-script"), null, "Timed out script must be removed from DOM")
})

test("TASK 1: Late script failure after account/attempt change does not mutate current checkout", async () => {
  resetScriptLoader()
  const retryManager = new PreparingRetryManager()
  let aliceErrorMsg = ""
  let bobErrorMsg = ""

  const opAlice = retryManager.startOperation("user_alice", "att_alice")
  assert.ok(opAlice)

  let finishAliceLoad = null
  const aliceModalPromise = openRazorpayModal({
    orderId: "order_alice",
    razorpayOrderId: "rzp_alice",
    amount: 10000,
    currency: "INR",
    parentOp: opAlice,
    scope: "user_alice",
    retryManager,
    loadScript: () => new Promise((resolve) => { finishAliceLoad = resolve }),
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => { aliceErrorMsg = msg },
  })

  retryManager.endOperation(opAlice)

  // User Alice logs out and Bob checks out
  retryManager.invalidateAll()
  const opBob = retryManager.startOperation("user_bob", "att_bob")
  assert.ok(opBob)
  assert.equal(retryManager.currentScope, "user_bob")

  // Alice's script load finally returns failure late
  finishAliceLoad(false)
  await aliceModalPromise

  assert.equal(aliceErrorMsg, "", "Alice's obsolete failure must not invoke onErrorState")
  assert.equal(bobErrorMsg, "")
  assert.equal(retryManager.isOperationValid(opBob), true, "Bob's active operation must remain valid and uncorrupted")

  retryManager.endOperation(opBob)
})

// =========================================================================
// TASK 2: Prevent SDK Exceptions from Hanging Promise or Locks
// =========================================================================

test("TASK 2: Injected failure in SDK constructor settles promise, clears loading, releases locks", async () => {
  const retryManager = new PreparingRetryManager()
  let loadingState = true
  let errorStateMsg = ""

  const op = retryManager.startOperation("user_1", "att_ex_1")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_ex_1",
    razorpayOrderId: "rzp_ex_1",
    amount: 15000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => {
      return class CrashingRZP {
        constructor() {
          throw new Error("Razorpay constructor internal crash")
        }
      }
    },
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      loadingState = false
      errorStateMsg = msg
    },
  })

  retryManager.endOperation(op)
  await modalPromise

  assert.equal(loadingState, false, "Loading state must be cleared")
  assert.ok(errorStateMsg.includes("Razorpay constructor internal crash"))
  assert.equal(retryManager.isModalActive, false, "No orphaned modal lock")
  assert.equal(retryManager.isOperationActive, false, "No orphaned operation lock")

  // Subsequent operation can run
  const retryOp = retryManager.startOperation("user_1", "att_ex_1")
  assert.ok(retryOp, "Subsequent attempt can acquire operation lock")
  retryManager.endOperation(retryOp)
})

test("TASK 2: Injected failure in SDK .on() settles promise and closes partial instance", async () => {
  const retryManager = new PreparingRetryManager()
  let loadingState = true
  let errorStateMsg = ""
  let instanceClosed = false

  const op = retryManager.startOperation("user_1", "att_ex_2")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_ex_2",
    razorpayOrderId: "rzp_ex_2",
    amount: 25000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => {
      return class CrashingOnRZP {
        constructor() {}
        on() {
          throw new Error("Failed to register SDK event listener")
        }
        close() {
          instanceClosed = true
        }
      }
    },
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      loadingState = false
      errorStateMsg = msg
    },
  })

  retryManager.endOperation(op)
  await modalPromise

  assert.equal(loadingState, false)
  assert.ok(errorStateMsg.includes("Failed to register SDK event listener"))
  assert.equal(instanceClosed, true, "Partially created instance must be closed")
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)
})

test("TASK 2: Injected failure in SDK .open() settles promise and closes partial instance", async () => {
  const retryManager = new PreparingRetryManager()
  let loadingState = true
  let errorStateMsg = ""
  let instanceClosed = false

  const op = retryManager.startOperation("user_1", "att_ex_3")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_ex_3",
    razorpayOrderId: "rzp_ex_3",
    amount: 30000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => {
      return class CrashingOpenRZP {
        constructor() {}
        on() {}
        open() {
          throw new Error("Failed to open Razorpay iframe window")
        }
        close() {
          instanceClosed = true
        }
      }
    },
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      loadingState = false
      errorStateMsg = msg
    },
  })

  retryManager.endOperation(op)
  await modalPromise

  assert.equal(loadingState, false)
  assert.ok(errorStateMsg.includes("Failed to open Razorpay iframe window"))
  assert.equal(instanceClosed, true, "SDK instance must be closed")
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)
})

test("TASK 2: Injected failure in SDK .close() does not prevent remaining cleanup", async () => {
  const retryManager = new PreparingRetryManager()
  let loadingState = true
  let errorStateMsg = ""

  const op = retryManager.startOperation("user_1", "att_ex_4")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_ex_4",
    razorpayOrderId: "rzp_ex_4",
    amount: 40000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => {
      return class BrokenCloseRZP {
        constructor() {}
        on() {}
        open() {
          throw new Error("SDK open failure")
        }
        close() {
          throw new Error("SDK close threw critical error")
        }
      }
    },
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: (msg) => {
      loadingState = false
      errorStateMsg = msg
    },
  })

  retryManager.endOperation(op)
  await modalPromise

  assert.equal(loadingState, false)
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)
})

// =========================================================================
// TASK 3: Consistent payment.failed & Modal Lifecycle Verification
// =========================================================================

test("TASK 3: payment.failed while modal remains open preserves active modal session and captures failure", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let failureReceived = null
  let dismissed = false

  const op = retryManager.startOperation("user_1", "att_t3_1")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_t3_1",
    razorpayOrderId: "rzp_t3_1",
    amount: 50000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async () => {},
    onDismiss: () => { dismissed = true },
    onFailure: (err) => { failureReceived = err },
    onErrorState: () => {},
  })

  retryManager.endOperation(op)
  await Promise.resolve()
  await Promise.resolve()

  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]
  assert.ok(rzpInstance, "SDK instance must be created")
  assert.equal(rzpInstance.isOpen, true, "SDK modal must be open")
  assert.equal(retryManager.isModalActive, true, "Modal session must be active")

  // Simulate payment.failed inside the open Razorpay modal
  rzpInstance.triggerPaymentFailed({ error: { description: "Insufficient balance on credit card" } })

  assert.ok(failureReceived, "Production onFailure callback must be triggered")
  assert.equal(failureReceived.error.description, "Insufficient balance on credit card")
  assert.equal(retryManager.isModalActive, true, "Modal session must REMAIN ACTIVE for user retry in the visible modal")
  assert.equal(dismissed, false, "Modal must not be marked dismissed while still open")

  // Competing modal or operation cannot steal lock while modal is visible
  const competingOp = retryManager.startOperation("user_1", "att_t3_1")
  assert.equal(competingOp, null, "Competing action must be blocked while modal session is active")

  // Finally user dismisses modal by clicking 'X'
  rzpInstance.triggerDismiss()
  await modalPromise

  assert.equal(dismissed, true, "Dismissal callback must fire")
  assert.equal(retryManager.isModalActive, false, "Modal session must end on dismissal")
})

test("TASK 3: Failure followed by success from the same instance triggers verification lock and settles", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let verifiedOrderId = null
  let failureCount = 0

  const op = retryManager.startOperation("user_1", "att_t3_2")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_t3_2",
    razorpayOrderId: "rzp_t3_2",
    amount: 75000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async (resp, verifyOp) => {
      assert.ok(retryManager.isOperationValid(verifyOp), "Verification must hold valid operation lock")
      verifiedOrderId = resp.razorpay_order_id
      retryManager.endOperation(verifyOp)
    },
    onDismiss: () => {},
    onFailure: () => { failureCount++ },
    onErrorState: () => {},
  })

  retryManager.endOperation(op)
  await Promise.resolve()
  await Promise.resolve()

  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]

  // 1. First attempt in modal fails
  rzpInstance.triggerPaymentFailed()
  assert.equal(failureCount, 1)
  assert.equal(retryManager.isModalActive, true, "Modal stays active after failure")

  // 2. User chooses different payment method in same modal and succeeds
  await rzpInstance.triggerSuccess({
    razorpay_payment_id: "pay_success_1",
    razorpay_order_id: "order_t3_2",
    razorpay_signature: "sig_success_1",
  })

  await modalPromise

  assert.equal(verifiedOrderId, "order_t3_2", "Verification must run with captured payment details")
  assert.equal(retryManager.isModalActive, false, "Modal session handed off to verification")
  assert.equal(retryManager.isOperationActive, false, "All locks released after verification concludes")
})

test("TASK 3: Repeated failure callbacks are handled safely without deadlock or crashing", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let failures = []

  const op = retryManager.startOperation("user_1", "att_t3_3")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_t3_3",
    razorpayOrderId: "rzp_t3_3",
    amount: 60000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: (err) => { failures.push(err) },
    onErrorState: () => {},
  })

  retryManager.endOperation(op)
  await Promise.resolve()
  await Promise.resolve()
  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]

  // Multiple failed attempts within the open Razorpay modal
  rzpInstance.triggerPaymentFailed({ error: { description: "Card 1 declined" } })
  rzpInstance.triggerPaymentFailed({ error: { description: "Card 2 limit exceeded" } })
  rzpInstance.triggerPaymentFailed({ error: { description: "UPI pin expired" } })

  assert.equal(failures.length, 3)
  assert.equal(retryManager.isModalActive, true, "Modal session remains active across repeated failures")

  rzpInstance.triggerDismiss()
  await modalPromise

  assert.equal(retryManager.isModalActive, false)
})

test("TASK 3: Programmatic close() synchronously triggering ondismiss does not corrupt state", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let dismissCallCount = 0

  const op = retryManager.startOperation("user_1", "att_t3_4")
  assert.ok(op)

  const modalPromise = openRazorpayModal({
    orderId: "order_t3_4",
    razorpayOrderId: "rzp_t3_4",
    amount: 45000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async () => {},
    onDismiss: () => { dismissCallCount++ },
    onFailure: () => {},
    onErrorState: () => {},
  })

  retryManager.endOperation(op)
  await Promise.resolve()
  await Promise.resolve()
  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]
  assert.ok(rzpInstance)

  // System retires modal (e.g. account switch or cleanup), which closes the SDK instance
  // The SDK close() synchronously fires modal.ondismiss
  retryManager.retireModal()
  await modalPromise

  // Because the session was invalidated before close(), onDismiss must not run for the retired session
  assert.equal(dismissCallCount, 0, "Obsolete session ondismiss must be suppressed")
  assert.equal(retryManager.isModalActive, false)
})

test("TASK 3: Account change during failure handling ignores late callbacks and protects new checkout", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let aliceVerified = false
  let aliceDismissed = false

  const opAlice = retryManager.startOperation("user_alice", "att_alice_t3")
  assert.ok(opAlice)

  const alicePromise = openRazorpayModal({
    orderId: "order_alice_t3",
    razorpayOrderId: "rzp_alice_t3",
    amount: 99000,
    currency: "INR",
    parentOp: opAlice,
    scope: "user_alice",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async () => { aliceVerified = true },
    onDismiss: () => { aliceDismissed = true },
    onFailure: () => {},
    onErrorState: () => {},
  })

  retryManager.endOperation(opAlice)
  await Promise.resolve()
  await Promise.resolve()
  const aliceSDK = ProductionCapturingRazorpay.createdInstances[0]

  // Alice's modal receives a payment failure
  aliceSDK.triggerPaymentFailed({ error: { description: "Bank down" } })

  // Alice logs out and Bob checks out
  retryManager.invalidateAll()
  const opBob = retryManager.startOperation("user_bob", "att_bob_t3")
  assert.ok(opBob)
  assert.equal(retryManager.currentScope, "user_bob")

  // Alice's old modal tries to fire late success and dismiss callbacks
  await aliceSDK.triggerSuccess()
  aliceSDK.triggerDismiss()
  await alicePromise

  assert.equal(aliceVerified, false, "Late success from Alice's modal must NOT trigger verification")
  assert.equal(aliceDismissed, false, "Late dismissal from Alice's modal must NOT affect Bob's session")
  assert.equal(retryManager.currentScope, "user_bob")
  assert.equal(retryManager.isOperationValid(opBob), true, "Bob's active operation must remain valid")

  retryManager.endOperation(opBob)
})

// =========================================================================
// TASK 1: Recheck Loading State After Modal Handoff
// =========================================================================

test("TASK 1: Recheck -> payable -> script failure clears isCheckingPending, controls become usable", async () => {
  const retryManager = new PreparingRetryManager()
  let isCheckingPending = false
  let isPlacingOrder = false
  let isResumingPayment = false
  let attemptPhase = "pending_recovery"

  const clearCheckoutLoadingStates = (identity) => {
    if (identity) {
      if ("modalId" in identity && !retryManager.isModalSessionValid(identity)) return
      if ("operationId" in identity && !retryManager.isOperationValid(identity)) return
    }
    isPlacingOrder = false
    isResumingPayment = false
    isCheckingPending = false
  }

  // Recheck begins
  const recheckOp = retryManager.startOperation("user_1", "att_recheck_1")
  assert.ok(recheckOp)
  isCheckingPending = true

  // Backend returns payable -> openRazorpayModal called with recheckOp as parentOp
  const modalPromise = openRazorpayModal({
    orderId: "order_recheck_1",
    razorpayOrderId: "rzp_recheck_1",
    amount: 50000,
    currency: "INR",
    parentOp: recheckOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => false, // Script failure
    onVerify: async () => {},
    onDismiss: () => {
      clearCheckoutLoadingStates()
      attemptPhase = "awaiting_payment"
    },
    onFailure: () => {
      clearCheckoutLoadingStates()
    },
    onErrorState: () => {
      clearCheckoutLoadingStates()
      attemptPhase = "awaiting_payment"
    },
  })

  // Recheck's finally runs: parent operation was handed off, so endOperation returns false
  const recheckReleased = retryManager.endOperation(recheckOp)
  assert.equal(recheckReleased, false, "Parent op lock was handed off to modal")

  await modalPromise

  assert.equal(isCheckingPending, false, "isCheckingPending MUST be cleared on script failure")
  assert.equal(isPlacingOrder, false)
  assert.equal(isResumingPayment, false)
  assert.equal(attemptPhase, "awaiting_payment", "Attempt must remain recoverable")
  assert.equal(retryManager.isModalActive, false, "No orphaned modal lock")
  assert.equal(retryManager.isOperationActive, false, "No orphaned operation lock")

  // Controls are usable: subsequent resume can acquire operation lock immediately
  const manualOp = retryManager.startOperation("user_1", "att_recheck_1")
  assert.ok(manualOp, "Recovery controls must be usable")
  retryManager.endOperation(manualOp)
})

test("TASK 1: Recheck -> payable -> SDK exception clears isCheckingPending, controls become usable", async () => {
  const retryManager = new PreparingRetryManager()
  let isCheckingPending = false
  let isPlacingOrder = false
  let isResumingPayment = false

  const clearCheckoutLoadingStates = () => {
    isPlacingOrder = false
    isResumingPayment = false
    isCheckingPending = false
  }

  const recheckOp = retryManager.startOperation("user_1", "att_recheck_2")
  assert.ok(recheckOp)
  isCheckingPending = true

  const modalPromise = openRazorpayModal({
    orderId: "order_recheck_2",
    razorpayOrderId: "rzp_recheck_2",
    amount: 40000,
    currency: "INR",
    parentOp: recheckOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => {
      return class FailingSdk {
        constructor() {
          throw new Error("SDK constructor threw")
        }
      }
    },
    onVerify: async () => {},
    onDismiss: () => clearCheckoutLoadingStates(),
    onFailure: () => clearCheckoutLoadingStates(),
    onErrorState: () => clearCheckoutLoadingStates(),
  })

  retryManager.endOperation(recheckOp)
  await modalPromise

  assert.equal(isCheckingPending, false, "isCheckingPending MUST be cleared on SDK exception")
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)

  const manualOp = retryManager.startOperation("user_1", "att_recheck_2")
  assert.ok(manualOp, "Manual retry must be able to start")
  retryManager.endOperation(manualOp)
})

test("TASK 1: Recheck -> payable -> user dismissal clears isCheckingPending, controls become usable", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let isCheckingPending = false
  let isPlacingOrder = false
  let isResumingPayment = false

  const clearCheckoutLoadingStates = () => {
    isPlacingOrder = false
    isResumingPayment = false
    isCheckingPending = false
  }

  const recheckOp = retryManager.startOperation("user_1", "att_recheck_3")
  assert.ok(recheckOp)
  isCheckingPending = true

  const modalPromise = openRazorpayModal({
    orderId: "order_recheck_3",
    razorpayOrderId: "rzp_recheck_3",
    amount: 60000,
    currency: "INR",
    parentOp: recheckOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async () => {},
    onDismiss: () => clearCheckoutLoadingStates(),
    onFailure: () => clearCheckoutLoadingStates(),
    onErrorState: () => clearCheckoutLoadingStates(),
  })

  retryManager.endOperation(recheckOp)
  await Promise.resolve()
  await Promise.resolve()
  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]
  assert.ok(rzpInstance)

  // While modal is open, isCheckingPending is still true or handled, and modal session is active
  assert.equal(retryManager.isModalActive, true)

  // User dismisses modal
  rzpInstance.triggerDismiss()
  await modalPromise

  assert.equal(isCheckingPending, false, "isCheckingPending MUST be cleared on modal dismissal")
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)
})

test("TASK 1: Recheck -> modal -> verification error clears isCheckingPending", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let isCheckingPending = false
  let isPlacingOrder = false
  let isResumingPayment = false

  const clearCheckoutLoadingStates = () => {
    isPlacingOrder = false
    isResumingPayment = false
    isCheckingPending = false
  }

  const recheckOp = retryManager.startOperation("user_1", "att_recheck_4")
  assert.ok(recheckOp)
  isCheckingPending = true

  const modalPromise = openRazorpayModal({
    orderId: "order_recheck_4",
    razorpayOrderId: "rzp_recheck_4",
    amount: 55000,
    currency: "INR",
    parentOp: recheckOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async (resp, verifyOp) => {
      try {
        // Backend verification fails with 500
        throw new Error("500 Server Error during verification")
      } catch (err) {
        // Handled in catch
      } finally {
        if (retryManager.endOperation(verifyOp)) {
          clearCheckoutLoadingStates()
        }
      }
    },
    onDismiss: () => clearCheckoutLoadingStates(),
    onFailure: () => clearCheckoutLoadingStates(),
    onErrorState: () => clearCheckoutLoadingStates(),
  })

  retryManager.endOperation(recheckOp)
  await Promise.resolve()
  await Promise.resolve()
  const rzpInstance = ProductionCapturingRazorpay.createdInstances[0]

  // Payment triggers verification which throws
  await rzpInstance.triggerSuccess()
  await modalPromise

  assert.equal(isCheckingPending, false, "isCheckingPending MUST be cleared on verification error")
  assert.equal(retryManager.isModalActive, false)
  assert.equal(retryManager.isOperationActive, false)
})

test("TASK 1: Account change before recheck cleanup executes does not modify new user loading states", async () => {
  const retryManager = new PreparingRetryManager()
  let aliceCheckingPending = false
  let bobCheckingPending = true

  const clearAliceStates = (identity) => {
    if (identity && "modalId" in identity && !retryManager.isModalSessionValid(identity)) return
    aliceCheckingPending = false
  }

  const opAlice = retryManager.startOperation("user_alice", "att_alice_recheck")
  assert.ok(opAlice)
  aliceCheckingPending = true

  let finishScript = null
  const alicePromise = openRazorpayModal({
    orderId: "order_alice_recheck",
    razorpayOrderId: "rzp_alice_recheck",
    amount: 30000,
    currency: "INR",
    parentOp: opAlice,
    scope: "user_alice",
    retryManager,
    loadScript: () => new Promise((resolve) => { finishScript = resolve }),
    onVerify: async () => {},
    onDismiss: () => clearAliceStates(),
    onFailure: () => clearAliceStates(),
    onErrorState: () => clearAliceStates(),
  })

  retryManager.endOperation(opAlice)

  // Bob logs in and starts a check
  retryManager.invalidateAll()
  const opBob = retryManager.startOperation("user_bob", "att_bob_recheck")
  assert.ok(opBob)
  bobCheckingPending = true

  // Alice's script load completes with failure late
  finishScript(false)
  await alicePromise

  assert.equal(retryManager.currentScope, "user_bob")
  assert.equal(bobCheckingPending, true, "Bob's active checking state must remain untouched")
  retryManager.endOperation(opBob)
})

// =========================================================================
// TASK 2: Verification -> Payable Ownership Transfer & Side-Effect-Free Rejection
// =========================================================================

test("TASK 2: Modal success -> verification returns payable transfers ownership cleanly to next modal", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let secondModalOpened = false
  let verifiedSuccess = false

  const initialOp = retryManager.startOperation("user_1", "att_v2_1")
  assert.ok(initialOp)

  // Modal 1 opens
  const modal1Promise = openRazorpayModal({
    orderId: "order_v2_1",
    razorpayOrderId: "rzp_v2_1",
    amount: 70000,
    currency: "INR",
    parentOp: initialOp,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async (resp, verifyOp) => {
      // Verification response returns payable outcome (e.g. gateway requires new session/attempt)
      // applyResolvedOutcome passes verifyOp as parentOp to reopen modal 2
      const modal2Promise = openRazorpayModal({
        orderId: "order_v2_1",
        razorpayOrderId: "rzp_v2_1_new",
        amount: 70000,
        currency: "INR",
        parentOp: verifyOp, // Ownership transferred from verifyOp to modal 2!
        scope: "user_1",
        retryManager,
        loadScript: async () => true,
        getRazorpayConstructor: () => ProductionCapturingRazorpay,
        onVerify: async (resp2, verifyOp2) => {
          verifiedSuccess = true
          retryManager.endOperation(verifyOp2)
        },
        onDismiss: () => {},
        onFailure: () => {},
        onErrorState: () => {},
      })

      // When verifyOp's finally block runs:
      // Because ownership was transferred to modal 2, endOperation(verifyOp) returns false!
      const verifyEnded = retryManager.endOperation(verifyOp)
      assert.equal(verifyEnded, false, "verifyOp finally must NOT release lock because it was handed off to modal 2")

      secondModalOpened = true
      await modal2Promise
    },
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: () => {},
  })

  retryManager.endOperation(initialOp)
  await Promise.resolve()
  await Promise.resolve()

  const sdk1 = ProductionCapturingRazorpay.createdInstances[0]
  assert.ok(sdk1)

  // Modal 1 succeeds -> kicks off verification which opens modal 2
  const verifyPromise = sdk1.triggerSuccess()
  await Promise.resolve()
  await Promise.resolve()

  assert.equal(secondModalOpened, true, "Second modal must open cleanly without rejection")
  assert.equal(ProductionCapturingRazorpay.createdInstances.length, 2, "Second SDK instance must be created")
  assert.equal(retryManager.isModalActive, true, "Modal 2 session must be active")

  const sdk2 = ProductionCapturingRazorpay.createdInstances[1]
  assert.equal(sdk2.isOpen, true, "Second modal must be open")

  // Modal 2 completes payment
  await sdk2.triggerSuccess()
  await verifyPromise
  await modal1Promise

  assert.equal(verifiedSuccess, true, "Second modal verification must succeed")
  assert.equal(retryManager.isModalActive, false, "All locks released")
  assert.equal(retryManager.isOperationActive, false, "All locks released")
})

test("TASK 2: Rejected acquisition using associated order ID is side-effect-free", async () => {
  const manager = new PreparingRetryManager()

  // Start real operation under initial attempt ID
  const activeOp = manager.startOperation("user_1", "att_primary_key")
  assert.ok(activeOp)
  assert.equal(manager.currentAttemptId, "att_primary_key")

  const initialGeneration = manager.currentGeneration
  const signal = manager.getSignal()
  assert.ok(signal)
  assert.equal(signal.aborted, false)

  // Learn backend order ID and associate it as alias
  manager.associateOrderId("order_backend_id")
  assert.equal(manager.currentOrderId, "order_backend_id")
  assert.equal(manager.currentAttemptId, "att_primary_key", "Primary attempt key must NOT be overwritten")

  // User/system calls startOperation with the associated order ID while activeOp is in-flight
  const rejectedOp = manager.startOperation("user_1", "order_backend_id")
  assert.equal(rejectedOp, null, "Overlapping operation must be rejected")

  // Assert rejected call was completely side-effect-free:
  assert.equal(signal.aborted, false, "In-flight request must NOT be aborted")
  assert.equal(manager.currentGeneration, initialGeneration, "Generation must NOT be incremented")
  assert.equal(manager.currentAttemptId, "att_primary_key", "Attempt ID must remain stable primary key")
  assert.equal(manager.currentOrderId, "order_backend_id", "Order ID alias must be preserved")
  assert.equal(manager.isOperationValid(activeOp), true, "Original active operation must remain valid")

  // Original operation can complete and release cleanly
  const released = manager.endOperation(activeOp)
  assert.equal(released, true, "Original operation must release cleanly")
  assert.equal(manager.isOperationActive, false)
})

test("TASK 2: Obsolete parent operation is NOT revived by falling back to fresh acquisition", async () => {
  const retryManager = new PreparingRetryManager()
  let modalSessionCreated = false

  const op = retryManager.startOperation("user_1", "att_v2_3")
  assert.ok(op)

  // Invalidate manager (e.g. timeout or generation change)
  retryManager.handleManualAction()
  assert.equal(retryManager.isOperationValid(op), false, "Parent op is now invalid")

  // openRazorpayModal called with obsolete parentOp
  const modalPromise = openRazorpayModal({
    orderId: "order_v2_3",
    razorpayOrderId: "rzp_v2_3",
    amount: 45000,
    currency: "INR",
    parentOp: op, // Obsolete!
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    onVerify: async () => {},
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: () => {},
  })

  await modalPromise

  assert.equal(retryManager.isModalActive, false, "Obsolete parent op must NOT start a modal session")
  assert.equal(retryManager.isOperationActive, false, "No lock must be held")
})

test("TASK 2: Account change during verification invalidates old transition and protects new checkout", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let aliceModal2Opened = false

  const opAlice = retryManager.startOperation("user_alice", "att_alice_v2")
  assert.ok(opAlice)

  let finishAliceVerify = null
  const aliceModalPromise = openRazorpayModal({
    orderId: "order_alice_v2",
    razorpayOrderId: "rzp_alice_v2",
    amount: 80000,
    currency: "INR",
    parentOp: opAlice,
    scope: "user_alice",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async (resp, verifyOp) => {
      await new Promise((resolve) => { finishAliceVerify = resolve })
      // Alice tries to open modal 2 after verification returns payable
      if (!retryManager.isOperationValid(verifyOp)) return
      aliceModal2Opened = true
    },
    onDismiss: () => {},
    onFailure: () => {},
    onErrorState: () => {},
  })

  retryManager.endOperation(opAlice)
  await Promise.resolve()
  await Promise.resolve()

  const aliceSDK = ProductionCapturingRazorpay.createdInstances[0]
  aliceSDK.triggerSuccess() // Starts verification in background

  // Alice logs out and Bob logs in
  retryManager.invalidateAll()
  const opBob = retryManager.startOperation("user_bob", "att_bob_v2")
  assert.ok(opBob)
  assert.equal(retryManager.currentScope, "user_bob")

  // Alice's verification finishes late
  finishAliceVerify()
  await aliceModalPromise

  assert.equal(aliceModal2Opened, false, "Alice's obsolete verification must not open a second modal")
  assert.equal(retryManager.currentScope, "user_bob")
  assert.equal(retryManager.isOperationValid(opBob), true, "Bob's active operation must remain valid")

  retryManager.endOperation(opBob)
})

// =========================================================================
// REGRESSION: Loading-Cleanup After endOperation(verifyOp)
// =========================================================================

test("REGRESSION: Active verification completes - endOperation releases and loading flags become false", async () => {
  const retryManager = new PreparingRetryManager()
  let isPlacingOrder = true
  let isResumingPayment = true
  let isCheckingPending = true

  const setters = {
    setIsPlacingOrder: (v) => { isPlacingOrder = v },
    setIsResumingPayment: (v) => { isResumingPayment = v },
    setIsCheckingPending: (v) => { isCheckingPending = v },
  }

  const op = retryManager.startOperation("user_1", "att_clean_1")
  assert.ok(op)

  let settled = false
  const modalSession = retryManager.startModalSession(op, "order_clean_1", () => { settled = true })
  assert.ok(modalSession)

  // Payment triggers verification lock
  const verifyOp = retryManager.startVerificationFromModal(modalSession)
  assert.ok(verifyOp)
  assert.equal(retryManager.isOperationActive, true)

  // Verification completes: execute production page.tsx onVerify finally logic
  if (retryManager.endOperation(verifyOp)) {
    clearCheckoutLoadingStates("user_1", retryManager, setters, verifyOp)
  }

  // Assertions:
  assert.equal(retryManager.isOperationActive, false, "Operation must be released")
  assert.equal(isPlacingOrder, false, "isPlacingOrder must be cleared")
  assert.equal(isResumingPayment, false, "isResumingPayment must be cleared")
  assert.equal(isCheckingPending, false, "isCheckingPending must be cleared")
})

test("REGRESSION: Verification returns handled error - finally clears loading and recovery controls remain usable", async () => {
  ProductionCapturingRazorpay.createdInstances = []
  const retryManager = new PreparingRetryManager()
  let isPlacingOrder = false
  let isResumingPayment = false
  let isCheckingPending = false
  let toastErrorShown = false

  const setters = {
    setIsPlacingOrder: (v) => { isPlacingOrder = v },
    setIsResumingPayment: (v) => { isResumingPayment = v },
    setIsCheckingPending: (v) => { isCheckingPending = v },
  }

  const op = retryManager.startOperation("user_1", "att_clean_2")
  assert.ok(op)
  isPlacingOrder = true

  const modalPromise = openRazorpayModal({
    orderId: "order_clean_2",
    razorpayOrderId: "rzp_clean_2",
    amount: 50000,
    currency: "INR",
    parentOp: op,
    scope: "user_1",
    retryManager,
    loadScript: async () => true,
    getRazorpayConstructor: () => ProductionCapturingRazorpay,
    onVerify: async (resp, verifyOp) => {
      try {
        isPlacingOrder = true
        // Verification endpoint returns handled 400 Bad Request or business error
        throw new Error("Invalid payment signature")
      } catch (err) {
        toastErrorShown = true
      } finally {
        if (retryManager.endOperation(verifyOp)) {
          clearCheckoutLoadingStates("user_1", retryManager, setters, verifyOp)
        }
      }
    },
    onDismiss: () => clearCheckoutLoadingStates("user_1", retryManager, setters),
    onFailure: () => clearCheckoutLoadingStates("user_1", retryManager, setters),
    onErrorState: () => clearCheckoutLoadingStates("user_1", retryManager, setters),
  })

  retryManager.endOperation(op)
  await Promise.resolve()
  await Promise.resolve()

  const rzp = ProductionCapturingRazorpay.createdInstances[0]
  assert.ok(rzp)

  // User submits payment in modal -> triggers verification failure
  await rzp.triggerSuccess()
  await modalPromise

  assert.equal(toastErrorShown, true, "Handled error toast must be shown")
  assert.equal(retryManager.isOperationActive, false, "Lock must not remain orphaned")
  assert.equal(isPlacingOrder, false, "Placing spinner must be cleared")
  assert.equal(isResumingPayment, false)
  assert.equal(isCheckingPending, false)

  // Recovery controls remain usable: manual resume can start immediately
  const manualOp = retryManager.startOperation("user_1", "att_clean_2")
  assert.ok(manualOp, "Manual resume must acquire operation lock")
  retryManager.endOperation(manualOp)
})

test("REGRESSION: Old verification finishes after newer operation starts - old finally cannot clear newer loading or release its lock", async () => {
  const retryManager = new PreparingRetryManager()
  let isPlacingOrder = true
  let isResumingPayment = true
  let isCheckingPending = true

  const setters = {
    setIsPlacingOrder: (v) => { isPlacingOrder = v },
    setIsResumingPayment: (v) => { isResumingPayment = v },
    setIsCheckingPending: (v) => { isCheckingPending = v },
  }

  // 1. Old operation starts
  const opOld = retryManager.startOperation("user_1", "att_old")
  assert.ok(opOld)

  const modalOld = retryManager.startModalSession(opOld, "order_old", () => {})
  const verifyOpOld = retryManager.startVerificationFromModal(modalOld)
  assert.ok(verifyOpOld)

  // 2. Newer operation starts (supersedes old attempt)
  const opNew = retryManager.startOperation("user_1", "att_new")
  assert.ok(opNew)
  assert.equal(retryManager.isOperationValid(opNew), true)
  isPlacingOrder = true
  isResumingPayment = true

  // 3. Old verifyOp finishes late and runs its finally block:
  const oldReleased = retryManager.endOperation(verifyOpOld)
  assert.equal(oldReleased, false, "Obsolete verifyOp must NOT be released by endOperation")

  // Even if clearCheckoutLoadingStates is invoked with obsolete verifyOp:
  const cleared = clearCheckoutLoadingStates("user_1", retryManager, setters, verifyOpOld)
  assert.equal(cleared, false, "Obsolete verifyOp must NOT clear loading states")

  // Newer operation's lock and loading states must remain completely intact
  assert.equal(retryManager.isOperationValid(opNew), true, "Newer operation must remain active and valid")
  assert.equal(isPlacingOrder, true, "Newer loading state must be preserved")
  assert.equal(isResumingPayment, true, "Newer loading state must be preserved")

  retryManager.endOperation(opNew)
})

test("REGRESSION: Verification hands ownership to payable modal - old finally does not clear modal loading or interfere with ownership", async () => {
  const retryManager = new PreparingRetryManager()
  let isPlacingOrder = true
  let isResumingPayment = false
  let isCheckingPending = false

  const setters = {
    setIsPlacingOrder: (v) => { isPlacingOrder = v },
    setIsResumingPayment: (v) => { isResumingPayment = v },
    setIsCheckingPending: (v) => { isCheckingPending = v },
  }

  const op1 = retryManager.startOperation("user_1", "att_handoff")
  const modal1 = retryManager.startModalSession(op1, "order_handoff", () => {})
  const verifyOp = retryManager.startVerificationFromModal(modal1)
  assert.ok(verifyOp)

  // Verification outcome is payable -> hands lock to modal 2!
  const modal2 = retryManager.startModalSession(verifyOp, "order_handoff", () => {})
  assert.ok(modal2)
  assert.equal(retryManager.isModalActive, true, "Modal 2 must hold active modal session")

  // verifyOp's finally block executes:
  const verifyReleased = retryManager.endOperation(verifyOp)
  assert.equal(verifyReleased, false, "verifyOp finally must NOT release lock because ownership was handed off to modal 2")

  if (verifyReleased) {
    clearCheckoutLoadingStates("user_1", retryManager, setters, verifyOp)
  }

  // Modal 2 is still active and loading state was not prematurely unset
  assert.equal(retryManager.isModalActive, true, "Modal 2 session must remain active")
  assert.equal(retryManager.isOperationActive, false, "Operation lock was handed off to modal 2")

  // Finally when modal 2 is dismissed:
  retryManager.endModalSession(modal2)
  clearCheckoutLoadingStates("user_1", retryManager, setters, modal2)

  assert.equal(retryManager.isModalActive, false)
  assert.equal(isPlacingOrder, false)
})

test("REGRESSION: Cleanup runs twice - idempotent with no duplicate effects or state corruption", async () => {
  const retryManager = new PreparingRetryManager()
  let clearCount = 0
  let isPlacingOrder = true

  const setters = {
    setIsPlacingOrder: (v) => { isPlacingOrder = v; clearCount++ },
    setIsResumingPayment: () => {},
    setIsCheckingPending: () => {},
  }

  const op = retryManager.startOperation("user_1", "att_idempotent")
  assert.ok(op)

  // First release:
  const firstEnd = retryManager.endOperation(op)
  assert.equal(firstEnd, true)
  clearCheckoutLoadingStates("user_1", retryManager, setters, op)

  assert.equal(isPlacingOrder, false)
  assert.equal(clearCount, 1)

  // Second release attempt:
  const secondEnd = retryManager.endOperation(op)
  assert.equal(secondEnd, false, "Second endOperation must return false")

  // Idempotent:
  clearCheckoutLoadingStates("user_1", retryManager, setters, op)
  assert.equal(isPlacingOrder, false)
})


