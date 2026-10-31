import test from "node:test"
import assert from "node:assert/strict"
import { resolveCheckoutOutcome } from "../lib/checkout-outcomes.ts"

test("resolveCheckoutOutcome: paid + held is ALWAYS resolved to held (never success)", () => {
  const heldOrderResponse = {
    success: true,
    status: "paid",
    paymentStatus: "paid",
    outcome: "held",
    message: "Payment captured, but order is held for review",
    orderId: "ORD-HELD-1",
    fulfillmentHold: { active: true, reason: "Inventory discrepancy" },
  }

  const res = resolveCheckoutOutcome(heldOrderResponse)
  assert.equal(res.kind, "held")
  assert.equal(res.orderId, "ORD-HELD-1")
  assert.match(res.message, /held for review/)
})

test("resolveCheckoutOutcome: paid + held_for_review is ALWAYS resolved to held", () => {
  const heldForReview = {
    order: {
      orderId: "ORD-HFR-2",
      outcome: "held_for_review",
      paymentStatus: "paid",
      status: "processing",
    },
  }

  const res = resolveCheckoutOutcome(heldForReview)
  assert.equal(res.kind, "held")
  assert.equal(res.orderId, "ORD-HFR-2")
})

test("resolveCheckoutOutcome: paid_settled is resolved to success", () => {
  const settledResponse = {
    order: {
      orderId: "ORD-PAID-100",
      outcome: "paid_settled",
      paymentStatus: "paid",
      status: "confirmed",
    },
  }

  const res = resolveCheckoutOutcome(settledResponse)
  assert.equal(res.kind, "success")
  assert.equal(res.orderId, "ORD-PAID-100")
})

test("resolveCheckoutOutcome: accepted COD is resolved to success with isCod = true", () => {
  const codResponse = {
    order: {
      orderId: "ORD-COD-200",
      outcome: "order_placed_cod",
      paymentStatus: "pending",
      paymentMethod: "cod",
    },
  }

  const res = resolveCheckoutOutcome(codResponse)
  assert.equal(res.kind, "success")
  assert.equal(res.isCod, true)
})

test("resolveCheckoutOutcome: terminal and cancelled states resolve to terminal", () => {
  const termRes = resolveCheckoutOutcome({
    outcome: "rejected_terminal",
    message: "Expired order",
    orderId: "ORD-TERM-1",
  })
  assert.equal(termRes.kind, "terminal")
  assert.equal(termRes.orderId, "ORD-TERM-1")

  const cancelRes = resolveCheckoutOutcome({
    status: "cancelled",
    message: "Cancelled by admin",
    orderId: "ORD-CANCEL-1",
  })
  assert.equal(cancelRes.kind, "terminal")
})

test("resolveCheckoutOutcome: preparing, verification_pending, and pending_recovery resolve accurately", () => {
  const prep = resolveCheckoutOutcome({ outcome: "preparing", orderId: "ORD-PREP-1" })
  assert.equal(prep.kind, "preparing")

  const vp = resolveCheckoutOutcome({ outcome: "verification_pending", orderId: "ORD-VP-1" })
  assert.equal(vp.kind, "verification_pending")

  const pr = resolveCheckoutOutcome({ outcome: "pending_recovery", orderId: "ORD-PR-1" })
  assert.equal(pr.kind, "pending_recovery")
})

test("resolveCheckoutOutcome: unknown or malformed responses are never resolved to success", () => {
  const unk = resolveCheckoutOutcome({ foo: "bar" })
  assert.equal(unk.kind, "unknown")

  const nullRes = resolveCheckoutOutcome(null)
  assert.equal(nullRes.kind, "unknown")
})

test("resolveCheckoutOutcome: awaiting_payment requires razorpayOrderId, integer positive amount, and INR currency", () => {
  // Valid awaiting_payment
  const valid = resolveCheckoutOutcome({
    outcome: "awaiting_payment",
    orderId: "ORD-PAY-1",
    razorpayOrderId: "order_rzp_valid",
    amount: 150000,
    currency: "INR",
  })
  assert.equal(valid.kind, "awaiting_payment")
  assert.equal(valid.orderId, "ORD-PAY-1")
  assert.equal(valid.amount, 150000)

  // Invalid: missing razorpayOrderId -> unknown
  const missingGwId = resolveCheckoutOutcome({
    outcome: "awaiting_payment",
    orderId: "ORD-PAY-2",
    amount: 150000,
  })
  assert.equal(missingGwId.kind, "unknown")

  // Invalid: decimal amount (e.g. rupees instead of paise) -> unknown
  const decimalAmount = resolveCheckoutOutcome({
    outcome: "awaiting_payment",
    orderId: "ORD-PAY-3",
    razorpayOrderId: "order_rzp_3",
    amount: 1500.5,
  })
  assert.equal(decimalAmount.kind, "unknown")

  // Invalid: zero or negative amount -> unknown
  const zeroAmount = resolveCheckoutOutcome({
    outcome: "awaiting_payment",
    orderId: "ORD-PAY-4",
    razorpayOrderId: "order_rzp_4",
    amount: 0,
  })
  assert.equal(zeroAmount.kind, "unknown")

  // Invalid: unsupported currency -> unknown
  const badCurrency = resolveCheckoutOutcome({
    outcome: "awaiting_payment",
    orderId: "ORD-PAY-5",
    razorpayOrderId: "order_rzp_5",
    amount: 150000,
    currency: "USD",
  })
  assert.equal(badCurrency.kind, "unknown")
})

// ===========================================================================
// TASK 3: AUTHORITATIVE OUTCOME MAPPING & CONFLICTING STATUS CHECKS
// ===========================================================================

test("TASK 3: Unknown outcome + paid status NEVER resolves to success", () => {
  const resp = {
    orderId: "ORD-UNK-PAID-1",
    status: "paid",
    paymentStatus: "paid",
    outcome: "unrecognized_state",
  }
  const res = resolveCheckoutOutcome(resp)
  assert.notEqual(res.kind, "success", "Unknown outcome + paid status must never succeed")
  assert.equal(res.kind, "unknown")
})

test("TASK 3: Missing outcome + paid status NEVER resolves to success", () => {
  const resp = {
    orderId: "ORD-NO-OUTCOME-1",
    status: "paid",
    paymentStatus: "paid",
    outcome: "",
  }
  const res = resolveCheckoutOutcome(resp)
  assert.notEqual(res.kind, "success", "Missing outcome + paid status must never succeed")
  assert.equal(res.kind, "unknown")
})

test("TASK 3: Payable + paid status NEVER resolves to success (resolves to awaiting_payment)", () => {
  const resp = {
    orderId: "ORD-PAYABLE-PAID-1",
    status: "paid",
    paymentStatus: "paid",
    outcome: "payable",
    razorpayOrderId: "order_rzp_payable_1",
    amount: 120000,
    currency: "INR",
  }
  const res = resolveCheckoutOutcome(resp)
  assert.notEqual(res.kind, "success", "Payable with paid status must not be treated as success")
  assert.equal(res.kind, "awaiting_payment")
})
