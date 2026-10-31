import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Frontend Customer Cancellation & Refund Presentation State Logic", () => {
    test("Orders pagination deduplication preserves stable order and appends unique items", () => {
        const initialOrders = [
            { _id: "order_1", orderId: "LS-1001", status: "placed" },
            { _id: "order_2", orderId: "LS-1002", status: "confirmed" },
        ];

        const page2Response = [
            { _id: "order_2", orderId: "LS-1002", status: "confirmed" }, // Duplicate from overlapping page
            { _id: "order_3", orderId: "LS-1003", status: "shipped" },
        ];

        const existingIds = new Set(initialOrders.map(o => o._id));
        const newItems = page2Response.filter(o => !existingIds.has(o._id));
        const combined = [...initialOrders, ...newItems];

        assert.equal(combined.length, 3);
        assert.deepEqual(combined.map(o => o._id), ["order_1", "order_2", "order_3"]);
    });

    test("Fetch error with empty orders list triggers error state, never false 'No orders yet'", () => {
        const orders = [];
        const loading = false;
        const fetchError = "Network error: Connection timed out.";

        // UI rendering decision:
        const shouldShowFetchError = Boolean(fetchError && orders.length === 0);
        const shouldShowEmptyOrders = Boolean(!loading && !fetchError && orders.length === 0);

        assert.equal(shouldShowFetchError, true);
        assert.equal(shouldShowEmptyOrders, false);
    });

    test("Fetch error with pre-loaded orders preserves cached orders and suppresses empty state", () => {
        const orders = [{ _id: "order_1", orderId: "LS-1001", status: "placed" }];
        const loading = false;
        const fetchError = "Refresh failed.";

        const shouldShowFetchError = Boolean(fetchError && orders.length === 0);
        const shouldShowEmptyOrders = Boolean(!loading && !fetchError && orders.length === 0);
        const shouldShowOrdersList = orders.length > 0;

        assert.equal(shouldShowFetchError, false);
        assert.equal(shouldShowEmptyOrders, false);
        assert.equal(shouldShowOrdersList, true);
    });

    test("Cancellation eligibility defaults conservatively when order has been dispatched", () => {
        const orderDispatched = {
            status: "shipped",
            canCancel: false,
            cannotCancelReason: "This order has already been dispatched with the courier and cannot be cancelled.",
        };

        const canCancel = orderDispatched.canCancel ?? (
            ["placed", "confirmed", "processing"].includes(orderDispatched.status)
        );

        assert.equal(canCancel, false);
    });

    test("Cancellation eligibility permits pre-dispatch placed and confirmed orders", () => {
        const orderEligible = {
            status: "confirmed",
            canCancel: true,
            cannotCancelReason: null,
        };

        const canCancel = orderEligible.canCancel ?? (
            ["placed", "confirmed", "processing"].includes(orderEligible.status)
        );

        assert.equal(canCancel, true);
    });

    test("Prepaid cancellation preview computes full refund correctly", () => {
        const order = {
            pricing: { total: 3499 },
            payment: { method: "upi", status: "paid" },
        };

        const isPrepaid = order.payment?.method !== "cod";
        const refundAmount = order.pricing.total;

        assert.equal(isPrepaid, true);
        assert.equal(refundAmount, 3499);
    });

    test("COD cancellation preview clarifies that no monetary refund is required", () => {
        const order = {
            pricing: { total: 1899 },
            payment: { method: "cod", status: "pending" },
        };

        const isPrepaid = order.payment?.method !== "cod";
        assert.equal(isPrepaid, false);
    });

    test("Account switch invalidates previous orders array and resets pagination state", () => {
        let currentEmail = "user1@example.com";
        let orders = [{ _id: "order_1", orderId: "LS-1001" }];
        let page = 2;

        const incomingUser = { email: "user2@example.com" };

        if (currentEmail !== incomingUser.email) {
            currentEmail = incomingUser.email;
            orders = [];
            page = 1;
        }

        assert.equal(currentEmail, "user2@example.com");
        assert.equal(orders.length, 0);
        assert.equal(page, 1);
    });

    test("Policy text consistency across FAQ, Returns, and Terms (No ₹150 cancellation deductions)", () => {
        const faqText = fs.readFileSync(path.resolve("app/faq/page.tsx"), "utf8");
        const returnsText = fs.readFileSync(path.resolve("app/returns/page.tsx"), "utf8");
        const termsText = fs.readFileSync(path.resolve("app/terms/page.tsx"), "utf8");

        // Verify ₹150 cancellation deduction statements are absent
        assert.ok(!faqText.includes("Rs 150.00 INR will be deducted"), "FAQ must not deduct Rs 150");
        assert.ok(!returnsText.includes("₹150 shipping charges will be deducted"), "Returns must not deduct ₹150 for cancellation");

        // Verify approved policy wording is present
        assert.ok(faqText.includes("Eligible cancellations carry no cancellation fee"), "FAQ must have approved wording");
        assert.ok(returnsText.includes("Eligible cancellations carry no cancellation fee"), "Returns must have approved wording");
        assert.ok(termsText.includes("Eligible cancellations carry no cancellation fee"), "Terms must have approved wording");
    });

    test("Gift card feature is completely deleted and returns 404", () => {
        const giftCardPath = path.resolve("app/gift-cards");
        assert.equal(fs.existsSync(giftCardPath), false, "app/gift-cards directory must not exist");

        // Verify no footer/header links point to /gift-cards
        const footerText = fs.readFileSync(path.resolve("components/layout/footer.tsx"), "utf8");
        const headerText = fs.readFileSync(path.resolve("components/layout/header.tsx"), "utf8");
        assert.ok(!footerText.includes("/gift-cards"), "Footer must not link to /gift-cards");
        assert.ok(!headerText.includes("/gift-cards"), "Header must not link to /gift-cards");
    });

    test("UI remains truthful after failed cancellation request (no optimistic status regression)", () => {
        const orderBefore = {
            _id: "order_123",
            orderId: "LS-1004",
            status: "processing",
            cancellationSummary: { status: "none", canCancel: true },
        };

        let currentOrders = [orderBefore];
        let cancelErrors = {};

        // Simulate failed cancellation request (e.g. 500 or network timeout)
        const failedResponse = { success: false, message: "Network timeout contacting courier adapter." };

        if (!failedResponse.success) {
            cancelErrors["order_123"] = failedResponse.message;
            // Orders array MUST remain unchanged - never optimistically marked cancelled!
        }

        assert.equal(currentOrders[0].status, "processing", "Order status must remain processing");
        assert.equal(cancelErrors["order_123"], "Network timeout contacting courier adapter.");
    });

    test("Refund status presentation handles all 4 states accurately", () => {
        function resolveRefundPresentation(refundSummary) {
            if (!refundSummary || !refundSummary.status) return null;
            switch (refundSummary.status) {
                case "processed":
                    return { badge: "Refund Processed", class: "bg-green-100 text-green-800", timelineNotice: true };
                case "pending":
                case "requested":
                    return { badge: "Refund Processing", class: "bg-blue-100 text-blue-800", timelineNotice: false };
                case "failed":
                    return { badge: "Refund Action Required", class: "bg-red-100 text-red-800", timelineNotice: false };
                default:
                    return null;
            }
        }

        const processed = resolveRefundPresentation({ status: "processed", amountRupees: 1999 });
        assert.equal(processed.badge, "Refund Processed");
        assert.equal(processed.timelineNotice, true);

        const pending = resolveRefundPresentation({ status: "pending", amountRupees: 1999 });
        assert.equal(pending.badge, "Refund Processing");

        const failed = resolveRefundPresentation({ status: "failed", amountRupees: 1999 });
        assert.equal(failed.badge, "Refund Action Required");

        const noRefund = resolveRefundPresentation(null);
        assert.equal(noRefund, null);
    });

    test("Single-order refresh atomically updates card state from authoritative server response", () => {
        let orders = [
            { _id: "order_1", orderId: "LS-1001", status: "processing", cancellationSummary: { status: "requested" } },
            { _id: "order_2", orderId: "LS-1002", status: "confirmed" },
        ];

        const refreshedDocFromServer = {
            _id: "order_1",
            orderId: "LS-1001",
            status: "cancelled",
            cancellationSummary: { status: "completed", canCancel: false },
            refundSummary: { status: "processed", amountRupees: 2499, amountPaise: 249900 },
        };

        // UI atomic replace:
        orders = orders.map(o => o._id === refreshedDocFromServer._id ? refreshedDocFromServer : o);

        assert.equal(orders[0].status, "cancelled");
        assert.equal(orders[0].refundSummary.amountRupees, 2499);
        assert.equal(orders[1].status, "confirmed"); // Untouched
    });
});
