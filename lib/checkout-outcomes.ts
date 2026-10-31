/**
 * CHECKOUT OUTCOME CONTRACT & AUTHORITATIVE RESOLVER (spec §2 & §5)
 *
 * Normalizes all backend response shapes across initial checkout, retry/replay,
 * payment verification, reload recovery, resume, and recheck into a single
 * discriminated union.
 *
 * Guarantees:
 *  - Explicit held, terminal, preparing, verification_pending, and payable outcomes
 *    can NEVER be overridden by paymentStatus or status.
 *  - Only explicitly recognized successful outcomes trigger ordinary success finalization.
 *  - Unknown, missing, or malformed outcomes are never treated as success.
 *  - Validates required fields before allowing awaiting_payment (Razorpay modal launch).
 *  - Preserves order reference and recovery capability tokens on unresolved/held outcomes.
 */

export type NormalizedCheckoutOutcome =
  | { kind: "success"; orderId: string; token?: string; dbId?: string; isCod?: boolean; message?: string }
  | { kind: "held"; orderId: string; token?: string; dbId?: string; message: string; reason?: string }
  | { kind: "terminal"; orderId?: string; message: string; code?: string }
  | { kind: "preparing"; orderId?: string; message: string; retryAfterMs?: number }
  | { kind: "verification_pending"; orderId?: string; message: string }
  | { kind: "pending_recovery"; orderId?: string; token?: string; dbId?: string; message?: string }
  | {
      kind: "awaiting_payment"
      orderId: string
      token?: string
      dbId?: string
      razorpayOrderId: string
      amount: number
      currency: string
      key?: string
    }
  | { kind: "unknown"; orderId?: string; message: string; raw: any }

export function resolveCheckoutOutcome(
  resp: any,
  fallbackContext: { orderId?: string; token?: string; dbId?: string } = {}
): NormalizedCheckoutOutcome {
  if (!resp || typeof resp !== "object") {
    return {
      kind: "unknown",
      orderId: fallbackContext.orderId,
      message: "No response received from checkout service.",
      raw: resp,
    }
  }

  // Extract order object if nested (e.g. data.order from /api/order)
  const o = resp.order || resp
  const orderId = String(o.orderId || resp.orderId || fallbackContext.orderId || "").trim()
  const token = o.checkoutToken || resp.checkoutToken || fallbackContext.token
  const dbId = o._id || resp._id || fallbackContext.dbId

  const outcomeRaw = String(o.outcome || resp.outcome || "").toLowerCase().trim()
  const statusRaw = String(o.status || resp.status || "").toLowerCase().trim()
  const paymentStatusRaw = String(o.paymentStatus || resp.paymentStatus || "").toLowerCase().trim()
  const isHeldActive = Boolean(o.fulfillmentHold?.active || resp.fulfillmentHold?.active)

  // 1. HIGHEST PRIORITY: Held / Manual Review
  // Explicit held outcome or active fulfillment hold must NEVER be overridden by payment status!
  if (
    outcomeRaw === "held" ||
    outcomeRaw === "held_for_review" ||
    outcomeRaw === "held_for_manual_review" ||
    isHeldActive
  ) {
    const reason = o.fulfillmentHold?.reason || resp.fulfillmentHold?.reason || resp.message || "Order is held for manual review."
    return {
      kind: "held",
      orderId,
      token,
      dbId,
      message: resp.message || "Your order is being reviewed by the store — we will follow up shortly.",
      reason,
    }
  }

  // 2. Terminal Rejection / Cancellation / Expiration
  if (
    outcomeRaw === "rejected_terminal" ||
    outcomeRaw === "terminal" ||
    outcomeRaw === "failed" ||
    statusRaw === "cancelled" ||
    statusRaw === "failed" ||
    paymentStatusRaw === "failed"
  ) {
    return {
      kind: "terminal",
      orderId,
      message: resp.message || "This order has expired or can no longer be processed.",
    }
  }

  // 3. Preparing Gateway Order (initialization in progress)
  if (outcomeRaw === "preparing") {
    return {
      kind: "preparing",
      orderId,
      message: resp.message || "Payment gateway initialization in progress. Please wait a moment.",
      retryAfterMs: 2000,
    }
  }

  // 4. Verification Pending (in flight or ambiguous external status)
  if (outcomeRaw === "verification_pending") {
    return {
      kind: "verification_pending",
      orderId,
      message: resp.message || "Payment status is pending gateway confirmation. Please retry shortly.",
    }
  }

  // 5. Explicit Success (Settled Paid or Accepted COD)
  // Strict allowlist: ONLY explicit, recognized success outcomes are allowed.
  // Broad fallback matching (status === "paid" alone) is strictly removed to prevent
  // unhandled outcomes from triggering success finalization.
  const isExplicitPaid = outcomeRaw === "paid_settled" || outcomeRaw === "paid"
  const isExplicitCodSuccess =
    outcomeRaw === "order_placed_cod" ||
    (outcomeRaw === "" &&
      (o.paymentMethod === "cod" || resp.paymentMethod === "cod") &&
      (statusRaw === "placed" || statusRaw === "confirmed"))

  if (isExplicitPaid || isExplicitCodSuccess) {
    const isCod = Boolean(
      outcomeRaw === "order_placed_cod" ||
      o.paymentMethod === "cod" ||
      resp.paymentMethod === "cod"
    )
    return {
      kind: "success",
      orderId,
      token,
      dbId,
      isCod,
      message: resp.message || "Order confirmed successfully.",
    }
  }

  // 6. Awaiting Payment / Payable (Strictly validated before allowing Razorpay modal launch)
  if (outcomeRaw === "awaiting_payment" || outcomeRaw === "payable") {
    const razorpayOrderId = String(o.razorpayOrderId || resp.razorpayOrderId || "").trim()
    const rawAmount = o.amount !== undefined ? o.amount : resp.amount
    const numAmount = Number(rawAmount)
    const currency = String(o.currency || resp.currency || "INR").trim().toUpperCase()

    // Required field validation: non-empty order ID, gateway ID, positive whole paise amount, INR currency
    const isValidOrderId = Boolean(orderId)
    const isValidGatewayOrder = Boolean(razorpayOrderId)
    const isValidAmount = Number.isInteger(numAmount) && numAmount > 0
    const isSupportedCurrency = currency === "INR"

    if (isValidOrderId && isValidGatewayOrder && isValidAmount && isSupportedCurrency) {
      return {
        kind: "awaiting_payment",
        orderId,
        token,
        dbId,
        razorpayOrderId,
        amount: numAmount,
        currency,
        key: o.key || resp.key,
      }
    }

    // Malformed payment parameters: NEVER launch Razorpay with bad params and NEVER treat as success
    return {
      kind: "unknown",
      orderId,
      message: resp.message || "Payment parameters from gateway are incomplete or invalid.",
      raw: resp,
    }
  }

  // 7. Pending Recovery (Prepaid order awaiting linking or capability recovery)
  if (outcomeRaw === "pending_recovery") {
    return {
      kind: "pending_recovery",
      orderId,
      token,
      dbId,
      message: resp.message,
    }
  }

  // 8. Unknown / Ambiguous Response (Preserves recovery, never succeeds)
  return {
    kind: "unknown",
    orderId,
    message: resp.message || "Payment gateway returned an unknown status.",
    raw: resp,
  }
}
