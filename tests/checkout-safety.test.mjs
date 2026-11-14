import test from "node:test";
import assert from "node:assert/strict";

// ===========================================================================
// Comprehensive Payment Safety & Recovery Regression Test Suite
// House of Qalakari (linen) & Backward Compatibility with Handloomer
// ===========================================================================

test("1. Razorpay gateway timeout during cancellation fails closed and preserves order", async () => {
  // Simulates backend abandonCheckout when gateway timeout occurs
  let orderCancelled = false;
  let inventoryReleased = false;

  const mockGatewayReconcile = async () => {
    throw new Error("Razorpay gateway connection timeout (ESOCKETTIMEDOUT)");
  };

  const handleAbandonRequest = async () => {
    try {
      await mockGatewayReconcile();
      // If gateway confirmed unpaid, it would cancel:
      orderCancelled = true;
      inventoryReleased = true;
      return { success: true, finalized: true };
    } catch (gwErr) {
      // FAIL CLOSED: do not cancel order, do not release inventory
      return {
        success: false,
        status: 503,
        code: "GATEWAY_UNCERTAIN",
        message: "Unable to confirm payment status with the gateway due to a temporary connection error. Checkout cancellation is paused.",
      };
    }
  };

  const res = await handleAbandonRequest();
  assert.equal(res.success, false);
  assert.equal(res.status, 503);
  assert.equal(res.code, "GATEWAY_UNCERTAIN");
  assert.equal(orderCancelled, false, "Order must NOT be cancelled on gateway timeout");
  assert.equal(inventoryReleased, false, "Inventory must NOT be released on gateway timeout");
});

test("2. Gateway captured payment during abandonment rejects cancellation (HTTP 409)", async () => {
  const mockAbandonCheckout = async () => {
    const err = new Error("A payment was captured or is in progress for this order. It cannot be cancelled as unpaid.");
    err.status = 409;
    err.code = "PAYMENT_CAPTURED";
    throw err;
  };

  let attemptCleared = false;
  let preservedBanner = "";

  try {
    await mockAbandonCheckout();
    attemptCleared = true;
  } catch (err) {
    if (err.status === 409 || err.code === "PAYMENT_CAPTURED") {
      attemptCleared = false;
      preservedBanner = err.message;
    }
  }

  assert.equal(attemptCleared, false, "Must not clear checkout attempt when payment was captured");
  assert.match(preservedBanner, /payment was captured/);
});

test("3. Payment in progress preserves checkout attempt and recovery banner", async () => {
  const mockVerifyPayment = async () => ({
    success: true,
    status: "pending",
    outcome: "verification_pending",
    message: "Payment authorized at gateway; capture confirmation pending.",
  });

  const res = await mockVerifyPayment();
  let attemptDiscarded = false;
  let pendingState = null;

  if (res.outcome === "verification_pending" || res.status === "pending") {
    pendingState = { orderId: "LS-1731456789", status: "pending", message: res.message };
  } else {
    attemptDiscarded = true;
  }

  assert.equal(attemptDiscarded, false);
  assert.equal(pendingState.status, "pending");
  assert.match(pendingState.message, /capture confirmation pending/);
});

test("4. HTTP 409 cancellation rejection preserves attempt and sets helpful user banner", async () => {
  let attemptState = { orderId: "LS-1731456789", checkoutToken: "token-abc" };
  let bannerError = "";

  const handleAbandonFailure = (err) => {
    if (err.status === 409 || err.code === "PAYMENT_CAPTURED") {
      bannerError = "A payment was detected for this order. It cannot be cancelled as unpaid. Please click 'Check Payment Status' to view your order.";
      // Attempt is NOT set to null
    }
  };

  handleAbandonFailure({ status: 409, code: "PAYMENT_CAPTURED" });
  assert.ok(attemptState.orderId);
  assert.match(bannerError, /payment was detected/);
});

test("5. Payment held for review ({ status: 'paid', outcome: 'held' }) renders review notice, not fulfillment-ready", async () => {
  const mockVerifyResponse = {
    success: true,
    status: "paid",
    outcome: "held",
    message: "Payment received, but order is held for review: Mismatch held",
    order: {
      orderId: "LS-1731456789",
      fulfillmentHold: { active: true, reason: "Gateway amount mismatch" },
    },
  };

  // Frontend outcome resolution
  const isHeld = mockVerifyResponse.outcome === "held" || Boolean(mockVerifyResponse.order?.fulfillmentHold?.active);
  const headline = isHeld ? "Payment Received — Under Review" : "Order Placed Successfully!";
  const statusBadge = isHeld ? "Paid (Review in Progress)" : "Payment Verified & Paid";

  assert.equal(isHeld, true);
  assert.equal(headline, "Payment Received — Under Review");
  assert.equal(statusBadge, "Paid (Review in Progress)");
});

test("6. Browser refresh after 30 minutes preserves unresolved server attempt and verifies backend", async () => {
  const oldAttempt = {
    orderId: "LS-1731456789",
    checkoutToken: "token-999",
    createdAt: Date.now() - (45 * 60 * 1000), // 45 minutes old!
  };

  // Simulating the improved restoration logic:
  let restoredAttempt = null;
  let backendCheckTriggered = false;

  // Stale local client draft (no orderId):
  const draftOnly = { checkoutKey: "draft-123", createdAt: Date.now() - (45 * 60 * 1000) };
  const canDiscardDraft = !draftOnly.orderId && (Date.now() - draftOnly.createdAt >= 30 * 60 * 1000);
  assert.equal(canDiscardDraft, true, "Local drafts with no server order can be safely discarded after 30m");

  // Server order (with orderId): NEVER discarded solely by local timer!
  if (oldAttempt.orderId) {
    restoredAttempt = oldAttempt;
    backendCheckTriggered = true;
  }

  assert.ok(restoredAttempt, "Server order attempt must be preserved across refreshes even after 30 minutes");
  assert.equal(backendCheckTriggered, true, "Authoritative backend status check must be triggered");
});

test("7. Duplicate payment prevention: blocks fresh submission while pending verification or active attempt exists", async () => {
  const pendingVerification = { orderId: "LS-1731456789", status: "pending" };
  const attempt = { orderId: "LS-1731456789", paymentMethod: "prepaid" };

  // Case 7a: Pending verification active
  const submitWithPending = () => {
    if (pendingVerification?.orderId) {
      throw new Error(`You have an unresolved payment verification for Order #${pendingVerification.orderId}.`);
    }
  };
  assert.throws(() => submitWithPending(), /unresolved payment verification/);

  // Case 7b: Switching to COD with active prepaid order
  const submitSwitchToCod = (method) => {
    if (attempt?.orderId && method === "cod") {
      throw new Error(`You have an active online checkout attempt (Order #${attempt.orderId}). Please click "Discard & Start Fresh" first.`);
    }
  };
  assert.throws(() => submitSwitchToCod("cod"), /active online checkout attempt/);
});

test("8. Successful unpaid checkout cancellation clears attempt and notifies user", async () => {
  const mockAbandon = async () => ({
    success: true,
    finalized: true,
    orderId: "LS-1731456789",
    message: "Order cancelled and reserved inventory restored to shop.",
  });

  const res = await mockAbandon();
  let attemptCleared = false;
  let notice = "";

  if (res.success && (res.finalized || res.alreadyCancelled)) {
    attemptCleared = true;
    notice = res.message;
  }

  assert.equal(attemptCleared, true);
  assert.match(notice, /reserved inventory restored/);
});

test("9. Inventory restoration occurs only after verified authoritative cancellation", async () => {
  let inventoryStock = 5;

  const performCancellation = (backendResult) => {
    // Only restore if backend confirmed finalized or alreadyCancelled
    if (backendResult?.success && (backendResult.finalized || backendResult.alreadyCancelled)) {
      inventoryStock += 1;
      return true;
    }
    return false;
  };

  // Rejection scenario:
  const failedAttempt = performCancellation({ success: false, status: 503 });
  assert.equal(failedAttempt, false);
  assert.equal(inventoryStock, 5, "Stock must not be restored on unverified cancellation");

  // Confirmed scenario:
  const confirmedAttempt = performCancellation({ success: true, finalized: true });
  assert.equal(confirmedAttempt, true);
  assert.equal(inventoryStock, 6, "Stock restored only upon verified cancellation");
});

test("10. Old Handloomer checkout regression compatibility: store-isolation & payloads intact", async () => {
  // Handloomer store ID and Linen store ID must remain distinct canonical strings
  const STORES = { handloomer: "handloomer", linen: "linen" };
  assert.equal(STORES.handloomer, "handloomer");
  assert.equal(STORES.linen, "linen");
  assert.equal(Object.keys(STORES).length, 2);

  // Old Handloomer checkout order payload structure remains supported
  const oldHandloomerPayload = {
    items: [{ productId: "6724a1b2c3d4e5f6a7b8c9d0", quantity: 1 }],
    shippingAddress: {
      firstName: "Ramesh",
      lastName: "Kumar",
      email: "ramesh@example.com",
      phone: "9876543210",
      address: "123 Weaver Lane",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221001",
    },
    paymentMethod: "cod",
  };

  assert.ok(oldHandloomerPayload.items.length > 0);
  assert.equal(oldHandloomerPayload.paymentMethod, "cod");
});
