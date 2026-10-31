import "./setup-test-dom.mjs";
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import React from "react";
import { render, renderHook, act, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, {
    jsx: true,
    alias: {
        "@": path.resolve("."),
    },
});

// Load the exact same API module instance as the components
const api = jiti("../lib/api.ts");
const {
    isAdminEndpoint,
    buildDedupeKey,
    withAdminAuth,
    setAdminToken,
    clearAdminToken,
    getAdminToken,
    subscribeAdminSession,
    getAdminSessionListenerCount,
    apiGet,
} = api;

const AdminOrdersPage = jiti("../app/admin/(dashboard)/orders/page.tsx").default;
const { AdminOrdersView } = jiti("../app/admin/(dashboard)/orders/orders-view.tsx");
const { useAdminOrders } = jiti("../app/admin/(dashboard)/orders/use-admin-orders.ts");

// Helper component that binds the production AdminOrdersView to the real useAdminOrders hook
function TestOrdersHarness(props) {
    const ctrl = useAdminOrders({ debounceMs: 0, autoFetch: true, ...props });
    return React.createElement(AdminOrdersView, { controller: ctrl });
}

describe("Admin Orders Request Isolation & Error States Test Suite", () => {
    let originalFetch;

    beforeEach(() => {
        globalThis.document.body.innerHTML = "";
        globalThis.window.localStorage.clear();
        clearAdminToken();
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        cleanup();
        globalThis.fetch = originalFetch;
        globalThis.window.localStorage.clear();
        clearAdminToken();
        globalThis.document.body.innerHTML = "";
    });

    // =========================================================================
    // SECTION 1: API CLIENT SPECIFICATIONS & DEDUPLICATION (Tasks 1 & Scenarios 13, 14)
    // =========================================================================
    describe("API Client Specifications & Deduplication", () => {
        test("1. Orders GET (/api/order/admin/all) carries the admin bearer token", () => {
            setAdminToken("admin_token_alpha");
            const headers = withAdminAuth("/api/order/admin/all?page=1&limit=20", {}, "GET");
            assert.equal(headers.Authorization, "Bearer admin_token_alpha");
        });

        test("2. Customer requests do not inherit the admin bearer token", () => {
            setAdminToken("admin_token_alpha");
            const customerEndpoints = [
                "/api/order/create",
                "/api/order/my-orders",
                "/api/order/672000000000000000000001/cancel",
                "/api/cart",
                "/api/user/profile",
            ];
            for (const ep of customerEndpoints) {
                const headers = withAdminAuth(ep, {}, "GET");
                assert.equal(headers.Authorization, undefined, `Endpoint ${ep} must not inherit admin token`);
            }
        });

        test("3. Admin session changes do not share in-flight results (Scenario 13)", async () => {
            const fetchCalls = [];
            let resolveFirstFetch;
            let resolveSecondFetch;

            globalThis.fetch = async (url, options) => {
                const headers = options?.headers || {};
                const authHeader = headers["Authorization"] || headers["authorization"];
                fetchCalls.push({ url, authHeader });

                if (fetchCalls.length === 1) {
                    return new Promise((resolve) => {
                        resolveFirstFetch = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({ success: true, tokenUsed: "token_A", orders: [{ _id: "1", orderId: "ORD-A" }] }),
                        });
                    });
                } else {
                    return new Promise((resolve) => {
                        resolveSecondFetch = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({ success: true, tokenUsed: "token_B", orders: [{ _id: "2", orderId: "ORD-B" }] }),
                        });
                    });
                }
            };

            setAdminToken("token_A");
            const promiseA = apiGet("/api/order/admin/all?page=1&limit=20");

            setAdminToken("token_B");
            const promiseB = apiGet("/api/order/admin/all?page=1&limit=20");

            resolveFirstFetch();
            resolveSecondFetch();

            const [resA, resB] = await Promise.all([promiseA, promiseB]);

            assert.equal(fetchCalls.length, 2, "Must execute two separate network calls, no deduplication merge");
            assert.equal(fetchCalls[0].authHeader, "Bearer token_A", "First call must carry Token A");
            assert.equal(fetchCalls[1].authHeader, "Bearer token_B", "Second call must carry Token B");
            assert.equal(resA.tokenUsed, "token_A");
            assert.equal(resB.tokenUsed, "token_B");
        });

        test("4. Public GET deduplication remains intact for concurrent identical reads (Scenario 14)", async () => {
            let networkCallCount = 0;
            let resolveNetwork;

            globalThis.fetch = async () => {
                networkCallCount++;
                return new Promise((resolve) => {
                    resolveNetwork = () => resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({ success: true, products: [{ _id: "p1", name: "Saree" }] }),
                    });
                });
            };

            const p1 = apiGet("/api/product?category=linen&limit=20");
            const p2 = apiGet("/api/product?category=linen&limit=20");

            resolveNetwork();
            const [res1, res2] = await Promise.all([p1, p2]);

            assert.equal(networkCallCount, 1, "Concurrent public reads must be coalesced");
            assert.deepEqual(res1, res2);
        });

        test("5. buildDedupeKey returns null for any admin GET request with query params", () => {
            assert.equal(buildDedupeKey("/api/order/admin/all?page=1&limit=20&search=test"), null);
            assert.equal(buildDedupeKey("/api/order/admin/123"), null);
            assert.equal(buildDedupeKey("/api/admin/dashboard"), null);
            assert.equal(buildDedupeKey("/api/coupon?active=true"), null);

            assert.notEqual(buildDedupeKey("/api/product?limit=20"), null);
            assert.notEqual(buildDedupeKey("/api/order/my-orders"), null);
        });
    });

    // =========================================================================
    // SECTION 2: TASK 1 - SEARCH/FILTER PRESERVATION ON SESSION CHANGE
    // =========================================================================
    describe("Task 1 - Search & Filter Preservation on Session Change", () => {
        test("1. Set search='linen', status='delivered', then replace token -> outgoing request carries both filters, page=1, and new token", async () => {
            setAdminToken("token_alpha");
            const outgoingRequests = [];

            globalThis.fetch = async (url, options) => {
                const headers = options?.headers || {};
                const auth = headers["Authorization"] || headers["authorization"];
                outgoingRequests.push({ url, auth });
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({
                        success: true,
                        orders: [{ _id: "1", orderId: "ORD-LINEN-DELIVERED" }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            // Update search and status filters
            act(() => {
                result.current.setSearchTerm("linen");
                result.current.setStatusFilter("delivered");
                result.current.setCurrentPage(3); // page was previously advanced
            });

            // Admin token is replaced
            await act(async () => {
                setAdminToken("token_beta");
            });

            // Verify the session-triggered refetch occurred
            assert.ok(outgoingRequests.length >= 1, "Refetch must fire on token replacement");
            const latestRequest = outgoingRequests[outgoingRequests.length - 1];

            assert.equal(latestRequest.auth, "Bearer token_beta", "Request must carry the new bearer token");
            assert.match(latestRequest.url, /search=linen/, "Must carry selected search filter 'linen'");
            assert.match(latestRequest.url, /status=delivered/, "Must carry selected status filter 'delivered'");
            assert.match(latestRequest.url, /page=1/, "Must reset pagination to page 1");
            assert.equal(result.current.currentPage, 1);
        });

        test("2. Resolve an old-session response afterward; it must not change the list", async () => {
            setAdminToken("token_A");
            let resolveRequestA;
            let resolveRequestB;
            let callIndex = 0;

            globalThis.fetch = async () => {
                callIndex++;
                if (callIndex === 1) {
                    return new Promise((resolve) => {
                        resolveRequestA = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({ success: true, orders: [{ _id: "a1", orderId: "ORD-STALE-A" }] }),
                        });
                    });
                } else {
                    return new Promise((resolve) => {
                        resolveRequestB = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({ success: true, orders: [{ _id: "b1", orderId: "ORD-FRESH-B" }] }),
                        });
                    });
                }
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            // Initial fetch starts for Token A
            let promiseA;
            act(() => {
                promiseA = result.current.fetchOrders(1, "cotton", "placed");
            });

            // Token changes to B
            await act(async () => {
                setAdminToken("token_B");
            });

            // Resolve fresh B first
            resolveRequestB();
            await act(async () => {});

            assert.equal(result.current.orders[0].orderId, "ORD-FRESH-B");

            // Now late old request A resolves
            resolveRequestA();
            await act(async () => {
                try { await promiseA; } catch {}
            });

            // Must NOT overwrite or alter Token B's orders
            assert.equal(result.current.orders.length, 1);
            assert.equal(result.current.orders[0].orderId, "ORD-FRESH-B");
        });

        test("3. Cross-tab session-change event preserves search/status selection", async () => {
            setAdminToken("token_tab1");
            const requestedUrls = [];

            globalThis.fetch = async (url, options) => {
                const headers = options?.headers || {};
                requestedUrls.push({ url, auth: headers["Authorization"] || headers["authorization"] });
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({
                        success: true,
                        orders: [{ _id: "c1", orderId: "ORD-CROSS-TAB" }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            act(() => {
                result.current.setSearchTerm("chanderi");
                result.current.setStatusFilter("shipped");
            });

            // Cross-tab storage change event
            globalThis.window.localStorage.setItem("auth_admin_token", "token_tab2");
            await act(async () => {
                globalThis.window.dispatchEvent(
                    new globalThis.window.StorageEvent("storage", {
                        key: "auth_admin_token",
                        newValue: "token_tab2",
                    })
                );
            });

            assert.ok(requestedUrls.length >= 1);
            const latest = requestedUrls[requestedUrls.length - 1];
            assert.equal(latest.auth, "Bearer token_tab2");
            assert.match(latest.url, /search=chanderi/);
            assert.match(latest.url, /status=shipped/);
            assert.match(latest.url, /page=1/);
        });

        test("4. Change the filter again while the session-triggered request is pending -> only newest selection updates the visible list", async () => {
            setAdminToken("token_X");
            let resolveSessionRequest;
            let resolveNewFilterRequest;
            let callIndex = 0;

            globalThis.fetch = async (url) => {
                callIndex++;
                if (callIndex === 1) {
                    return new Promise((resolve) => {
                        resolveSessionRequest = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({
                                success: true,
                                orders: [{ _id: "s1", orderId: "ORD-SESSION-SELECTION" }],
                                pagination: { page: 1, totalPages: 1, totalCount: 1 },
                            }),
                        });
                    });
                } else {
                    return new Promise((resolve) => {
                        resolveNewFilterRequest = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({
                                success: true,
                                orders: [{ _id: "f1", orderId: "ORD-NEWEST-SELECTION" }],
                                pagination: { page: 1, totalPages: 1, totalCount: 1 },
                            }),
                        });
                    });
                }
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            // Trigger session change (which fires request 1)
            await act(async () => {
                setAdminToken("token_Y");
            });

            // While session request is in flight, user changes filter to "shipped"
            act(() => {
                result.current.fetchOrders(1, "", "shipped");
            });

            // Resolve the newer filter request first
            resolveNewFilterRequest();
            await act(async () => {});
            assert.equal(result.current.orders[0].orderId, "ORD-NEWEST-SELECTION");

            // Resolve the older session request late
            resolveSessionRequest();
            await act(async () => {});

            // The newer selection must remain!
            assert.equal(result.current.orders.length, 1);
            assert.equal(result.current.orders[0].orderId, "ORD-NEWEST-SELECTION");
        });

        test("5. Logout does not refetch protected orders", async () => {
            setAdminToken("token_logged_in");
            let fetchCallCount = 0;

            globalThis.fetch = async () => {
                fetchCallCount++;
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: true, orders: [] }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            act(() => {
                result.current.setOrders([{ _id: "1", orderId: "ORD-SENSITIVE" }]);
                result.current.setSearchTerm("linen");
                result.current.setStatusFilter("delivered");
            });

            const countBefore = fetchCallCount;

            // Admin logs out
            await act(async () => {
                clearAdminToken();
            });

            assert.equal(fetchCallCount, countBefore, "Logout must not initiate any refetch");
            assert.equal(result.current.orders.length, 0);
            assert.equal(result.current.fetchErrorStatus, 401);
            assert.match(result.current.fetchError, /sign in again/i);
        });

        test("6. Unmount unsubscribes listeners", () => {
            const initialListeners = getAdminSessionListenerCount();
            const { unmount } = renderHook(() => useAdminOrders({ autoFetch: false }));

            assert.equal(getAdminSessionListenerCount(), initialListeners + 1);
            unmount();
            assert.equal(getAdminSessionListenerCount(), initialListeners, "Unmount must unsubscribe listener");
        });

        test("7. Open order details, then return 401 on refresh -> details close, rows disappear, loading reset, sign-in appears", async () => {
            setAdminToken("expired_token");
            let attempt = 0;
            globalThis.fetch = async () => {
                attempt++;
                if (attempt === 1) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "1", orderId: "ORD-1", status: "placed", items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    };
                }
                return {
                    ok: false,
                    status: 401,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: false, message: "Token expired or invalid" }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            await act(async () => {
                await result.current.fetchOrders(1, "", "");
            });
            assert.equal(result.current.orders.length, 1);

            act(() => {
                result.current.setViewOrder(result.current.orders[0]);
                result.current.setPreviewItem(result.current.orders[0].items[0] || { name: "Test Saree", quantity: 1, price: 1000 });
            });
            assert.notEqual(result.current.viewOrder, null);

            await act(async () => {
                await result.current.fetchOrders(1, "", "");
            });

            assert.equal(result.current.viewOrder, null);
            assert.equal(result.current.previewItem, null);
            assert.equal(result.current.orders.length, 0);
            assert.equal(result.current.loading, false);
            assert.equal(result.current.fetchErrorStatus, 401);
            assert.match(result.current.fetchError, /sign in again/i);
        });

        test("8. Open order details, then return 403 on refresh -> details close, rows disappear, loading reset, access-denied appears", async () => {
            setAdminToken("restricted_token");
            let attempt = 0;
            globalThis.fetch = async () => {
                attempt++;
                if (attempt === 1) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "1", orderId: "ORD-1", status: "placed", items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    };
                }
                return {
                    ok: false,
                    status: 403,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: false, message: "Forbidden" }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            await act(async () => {
                await result.current.fetchOrders(1, "", "");
            });
            assert.equal(result.current.orders.length, 1);

            act(() => {
                result.current.setViewOrder(result.current.orders[0]);
            });

            await act(async () => {
                await result.current.fetchOrders(1, "", "");
            });

            assert.equal(result.current.viewOrder, null);
            assert.equal(result.current.orders.length, 0);
            assert.equal(result.current.loading, false);
            assert.equal(result.current.fetchErrorStatus, 403);
            assert.match(result.current.fetchError, /access denied/i);
        });

        test("9. For each order-action dialog, return 401/403 from its request -> dialog and protected values clear", async () => {
            setAdminToken("test_token");
            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            // Test Hold Dialog on 401
            act(() => {
                result.current.setHoldOrder({ _id: "hold_1", orderId: "ORD-HOLD", fulfillmentHold: { reason: "Suspicious" } });
                result.current.setHoldNotes("Secret admin internal review");
            });
            globalThis.fetch = async () => ({
                ok: false,
                status: 401,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Unauthorized" }),
            });
            await act(async () => {
                await result.current.handleResolveHoldSubmit("clear_hold");
            });
            assert.equal(result.current.holdOrder, null);
            assert.equal(result.current.holdNotes, "");
            assert.equal(result.current.actionLoading, false);
            assert.equal(result.current.fetchErrorStatus, 401);

            // Test COD Reconcile Dialog on 403
            act(() => {
                result.current.setCodOrder({ _id: "cod_1", orderId: "ORD-COD" });
                result.current.setCodUtr("UTR987654321");
                result.current.setCodAmount("4500");
                result.current.setCodDiscrepancyReason("Shortfall noted");
            });
            globalThis.fetch = async () => ({
                ok: false,
                status: 403,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Forbidden" }),
            });
            await act(async () => {
                await result.current.handleCodReconcileSubmit();
            });
            assert.equal(result.current.codOrder, null);
            assert.equal(result.current.codUtr, "");
            assert.equal(result.current.codAmount, "");
            assert.equal(result.current.codDiscrepancyReason, "");
            assert.equal(result.current.actionLoading, false);
            assert.equal(result.current.fetchErrorStatus, 403);

            // Test Return Confirm Dialog on 401
            act(() => {
                result.current.setReturnOrder({ _id: "ret_1", orderId: "ORD-RET" });
                result.current.setReturnNotes("Inspection damaged item");
            });
            globalThis.fetch = async () => ({
                ok: false,
                status: 401,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Unauthorized" }),
            });
            await act(async () => {
                await result.current.handleConfirmReturnSubmit();
            });
            assert.equal(result.current.returnOrder, null);
            assert.equal(result.current.returnNotes, "");
            assert.equal(result.current.actionLoading, false);
            assert.equal(result.current.fetchErrorStatus, 401);
        });

        test("10. Late SKU search response cannot reopen modal or restore data after auth cleanup", async () => {
            setAdminToken("admin_token");
            let resolveSku;
            globalThis.fetch = async (url) => {
                if (url.includes("/api/product/by-sku")) {
                    return new Promise((resolve) => {
                        resolveSku = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({
                                success: true,
                                product: { name: "Silk Saree SKU", sku: "SKU-999", price: 5000, stock: 10 },
                            }),
                        });
                    });
                }
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: true, orders: [] }),
                };
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            act(() => {
                result.current.setSkuQuery("SKU-999");
            });

            let skuPromise;
            act(() => {
                skuPromise = result.current.handleSkuSearch({ key: "Enter" });
            });
            assert.equal(result.current.isSearchingSku, true);

            act(() => {
                result.current.clearProtectedOrderState(401);
            });

            assert.equal(result.current.isSearchingSku, false);
            assert.equal(result.current.showSkuModal, false);
            assert.equal(result.current.searchedProduct, null);

            resolveSku();
            await act(async () => {
                await skuPromise;
            });

            assert.equal(result.current.showSkuModal, false, "Stale SKU response must not reopen modal after session invalidated");
            assert.equal(result.current.searchedProduct, null);
            assert.equal(result.current.isSearchingSku, false);
        });

        test("11. Late action response cannot refetch or restore cleared state after session invalidation", async () => {
            setAdminToken("admin_token");
            let resolveHold;
            let ordersFetchCount = 0;

            globalThis.fetch = async (url) => {
                if (url.includes("/resolve-hold")) {
                    return new Promise((resolve) => {
                        resolveHold = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({ success: true, message: "Hold resolved" }),
                        });
                    });
                }
                if (url.includes("/api/order/admin/all")) {
                    ordersFetchCount++;
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({ success: true, orders: [{ _id: "1", orderId: "ORD-1" }] }),
                    };
                }
            };

            const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

            act(() => {
                result.current.setHoldOrder({ _id: "hold_1", orderId: "ORD-HOLD", fulfillmentHold: { reason: "Need review" } });
                result.current.setHoldNotes("Inspection note");
            });

            let holdPromise;
            act(() => {
                holdPromise = result.current.handleResolveHoldSubmit("clear_hold");
            });
            assert.equal(result.current.actionLoading, true);

            act(() => {
                result.current.clearProtectedOrderState(401);
            });
            assert.equal(result.current.actionLoading, false);

            const fetchCountBefore = ordersFetchCount;

            resolveHold();
            await act(async () => {
                await holdPromise;
            });

            assert.equal(ordersFetchCount, fetchCountBefore, "Late action must not trigger follow-up fetchOrders on invalidated session");
            assert.equal(result.current.holdOrder, null);
            assert.equal(result.current.actionLoading, false);
        });
    });

    // =========================================================================
    // SECTION 3: TASK 2 - ACTUAL VISIBLE ORDERS UI TESTS
    // =========================================================================
    describe("Task 2 - Actual Visible Orders UI Tests", () => {
        test("UI 1. Successful response renders identifiable order rows", async () => {
            setAdminToken("valid_admin_token");
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [
                        {
                            _id: "ord_101",
                            orderId: "LS-9901",
                            createdAt: new Date().toISOString(),
                            status: "confirmed",
                            pricing: { total: 4999 },
                            payment: { method: "razorpay", status: "paid" },
                            shippingAddress: { firstName: "Aarav", lastName: "Sharma" },
                            items: [{ name: "Handloom Tussar Silk Saree", quantity: 1, price: 4999 }],
                        },
                    ],
                    pagination: { page: 1, totalPages: 1, totalCount: 1 },
                }),
            });

            const { findByText, getByText, getAllByText } = render(React.createElement(TestOrdersHarness));

            const orderCell = await findByText("LS-9901");
            assert.ok(orderCell);

            const customerName = getByText("Aarav Sharma");
            assert.ok(customerName);

            const totals = getAllByText(/₹4,999/);
            assert.ok(totals.length >= 1);

            const statusBadges = getAllByText("Confirmed");
            assert.ok(statusBadges.length >= 1);
        });

        test("UI 2. Failed initial request shows an error and Retry", async () => {
            setAdminToken("valid_admin_token");
            globalThis.fetch = async () => ({
                ok: false,
                status: 400,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Database connection failed" }),
            });

            const { findByRole, getAllByRole } = render(React.createElement(TestOrdersHarness));

            const alert = await findByRole("alert");
            assert.match(alert.textContent, /Database connection failed/i);

            const retryButtons = getAllByRole("button", { name: /retry/i });
            assert.ok(retryButtons.length >= 1, "Visible Retry button must be present");
        });

        test("UI 3. Clicking Retry loads rows and clears the error", async () => {
            setAdminToken("valid_admin_token");
            let attempt = 0;
            globalThis.fetch = async () => {
                attempt++;
                if (attempt === 1) {
                    return {
                        ok: false,
                        status: 400,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({ success: false, message: "Temporary failure" }),
                    };
                }
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({
                        success: true,
                        orders: [{ _id: "1", orderId: "ORD-RETRY-SUCCESS", pricing: { total: 3200 }, status: "placed", items: [] }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                };
            };

            const { findByRole, getAllByRole, findByText, queryByRole } = render(React.createElement(TestOrdersHarness));

            const alert = await findByRole("alert");
            assert.match(alert.textContent, /Temporary failure/i);

            const retryButton = getAllByRole("button", { name: /retry/i })[0];
            await act(async () => {
                fireEvent.click(retryButton);
            });

            const orderEl = await findByText("ORD-RETRY-SUCCESS");
            assert.ok(orderEl);
            assert.equal(queryByRole("alert"), null, "Alert banner must be cleared after successful retry");
        });

        test("UI 4. Failed refresh keeps old rows with a visible outdated-data warning", async () => {
            setAdminToken("valid_admin_token");
            let attempt = 0;
            globalThis.fetch = async () => {
                attempt++;
                if (attempt === 1) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "1", orderId: "ORD-PRESERVED", pricing: { total: 1500 }, status: "delivered", items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    };
                }
                return {
                    ok: false,
                    status: 400, // 4xx fails immediately without retry delays
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: false, message: "Refresh sync failed" }),
                };
            };

            const { findByText, getByPlaceholderText, getByText } = render(React.createElement(TestOrdersHarness));

            const orderRow = await findByText("ORD-PRESERVED");
            assert.ok(orderRow);

            // Change search to trigger a refresh
            const searchInput = getByPlaceholderText("Search orders...");
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: "ORD-REFRESH" } });
            });

            // Outdated results badge and preserved row must be visible
            const outdatedBadge = await findByText("Outdated Results");
            assert.ok(outdatedBadge);
            assert.ok(getByText("ORD-PRESERVED"));
        });

        test("UI 5. Successful empty response shows the empty state", async () => {
            setAdminToken("valid_admin_token");
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: true, orders: [], pagination: { page: 1, totalPages: 1, totalCount: 0 } }),
            });

            const { findByText, queryByRole } = render(React.createElement(TestOrdersHarness));

            const emptyState = await findByText("No orders yet");
            assert.ok(emptyState);
            assert.equal(queryByRole("alert"), null);
        });

        test("UI 6. Render both Sign In error states and verify the links target /admin", async () => {
            setAdminToken("expired_token");
            globalThis.fetch = async () => ({
                ok: false,
                status: 401,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Session expired" }),
            });

            const { findByRole, getAllByRole } = render(React.createElement(TestOrdersHarness));

            await findByRole("alert");

            const links = getAllByRole("link", { name: /sign in/i });
            assert.equal(links.length, 2, "Must render exactly 2 Sign In links in 401 state");

            for (const link of links) {
                assert.equal(link.getAttribute("href"), "/admin", "Sign In links must target /admin");
                assert.notEqual(link.getAttribute("href"), "/admin/login", "Must not target /admin/login");
            }
        });

        test("UI 7. Open order details using the actual UI, then trigger 401/403: details close, rows disappear, and loading ends", async () => {
            setAdminToken("valid_admin_token");
            let attempt = 0;
            globalThis.fetch = async () => {
                attempt++;
                if (attempt === 1) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{
                                _id: "ord_view_1",
                                orderId: "ORD-DETAIL-MODAL",
                                status: "placed",
                                pricing: { total: 2000 },
                                items: [{ name: "Cotton Saree", quantity: 1, price: 2000 }],
                            }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    };
                }
                return {
                    ok: false,
                    status: 401,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: false, message: "Unauthorized" }),
                };
            };

            const { findByText, getByRole, getByPlaceholderText, queryAllByText, queryByText } = render(
                React.createElement(TestOrdersHarness)
            );

            // Wait for order to load
            await findByText("ORD-DETAIL-MODAL");

            // Open dropdown menu via actual trigger
            const trigger = getByRole("button", { name: /open menu/i });
            fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });

            // Click View Details
            const viewItem = await findByText("View Details");
            await act(async () => {
                fireEvent.click(viewItem);
            });

            // Order ID is now present in both table cell and modal h2
            const matchingElements = queryAllByText("ORD-DETAIL-MODAL");
            assert.equal(matchingElements.length, 2, "Must be visible in table and in modal");

            // Trigger 401 via search refresh
            const searchInput = getByPlaceholderText("Search orders...");
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: "invalidating-query" } });
            });

            // Modal and rows must disappear
            await waitFor(() => {
                assert.equal(queryByText("ORD-DETAIL-MODAL"), null);
            });

            // Sign-in alert guidance must appear
            const alert = getByRole("alert");
            assert.match(alert.textContent, /sign in again/i);
        });

        test("UI 8. Open an order-action dialog, then change/logout the session: dialog closes and sensitive form values clear", async () => {
            setAdminToken("valid_admin_token");
            globalThis.fetch = async () => ({
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [
                        {
                            _id: "hold_1",
                            orderId: "ORD-HOLD-ACTION",
                            status: "hold",
                            fulfillmentHold: { active: true, reason: "Manual hold" },
                            items: [],
                            pricing: { total: 1000 },
                        },
                    ],
                    pagination: { page: 1, totalPages: 1, totalCount: 1 },
                }),
            });

            const { findByText, getByRole, getByPlaceholderText, queryByText } = render(
                React.createElement(TestOrdersHarness)
            );

            await findByText("ORD-HOLD-ACTION");

            // Open dropdown menu and click Resolve Hold
            const trigger = getByRole("button", { name: /open menu/i });
            fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });

            const resolveItem = await findByText("Resolve Hold");
            await act(async () => {
                fireEvent.click(resolveItem);
            });

            // Action dialog is open; enter sensitive form values
            const textarea = await findByText(/Resolve Fulfillment Hold/i);
            assert.ok(textarea);

            const notesInput = getByPlaceholderText(/Resolution notes/i);
            fireEvent.change(notesInput, { target: { value: "Confidential fraud review note" } });
            assert.equal(notesInput.value, "Confidential fraud review note");

            // Invalidate session via logout
            await act(async () => {
                clearAdminToken();
            });

            // Dialog, order, and sensitive values are cleared immediately
            assert.equal(queryByText("Resolve Fulfillment Hold"), null);
            assert.equal(queryByText("ORD-HOLD-ACTION"), null);
            assert.equal(queryByText("Confidential fraud review note"), null);

            const alert = getByRole("alert");
            assert.match(alert.textContent, /sign in again/i);
        });

        test("UI 9. Change search/status through actual controls, then replace the token: outgoing request and rendered results match the selected filters", async () => {
            setAdminToken("token_alpha");
            const outgoingUrls = [];

            globalThis.fetch = async (url, options) => {
                const headers = options?.headers || {};
                outgoingUrls.push({ url, auth: headers["Authorization"] || headers["authorization"] });
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({
                        success: true,
                        orders: [{ _id: "f1", orderId: "ORD-LINEN-SHIPPED", status: "shipped", pricing: { total: 2500 }, items: [] }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                };
            };

            const { findByText, findByPlaceholderText, getByRole } = render(
                React.createElement(TestOrdersHarness)
            );

            // Wait for initial render to finish
            const searchInput = await findByPlaceholderText("Search orders...");

            // Change search filter through actual input
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: "linen" } });
            });

            // Change status filter through actual select
            const statusSelect = getByRole("combobox");
            await act(async () => {
                fireEvent.change(statusSelect, { target: { value: "shipped" } });
            });

            // Now replace the token
            await act(async () => {
                setAdminToken("token_beta");
            });

            // Verify the outgoing request carried the selected filters
            const lastCall = outgoingUrls[outgoingUrls.length - 1];
            assert.equal(lastCall.auth, "Bearer token_beta");
            assert.match(lastCall.url, /search=linen/);
            assert.match(lastCall.url, /status=shipped/);
            assert.match(lastCall.url, /page=1/);

            // And rendered table displays the filtered order
            const row = await findByText("ORD-LINEN-SHIPPED");
            assert.ok(row);
        });

        test("UI 10. Resolve requests out of order: stale rows must never replace the latest results", async () => {
            setAdminToken("valid_admin_token");
            let resolveSlowPlaced;
            let resolveFastDelivered;
            let callIndex = 0;

            globalThis.fetch = async (url) => {
                callIndex++;
                if (callIndex === 1) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "init", orderId: "ORD-INIT", status: "placed", pricing: { total: 1000 }, items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    };
                }
                if (url.includes("status=placed")) {
                    return new Promise((resolve) => {
                        resolveSlowPlaced = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({
                                success: true,
                                orders: [{ _id: "slow", orderId: "ORD-SLOW-PLACED", status: "placed", pricing: { total: 1000 }, items: [] }],
                                pagination: { page: 1, totalPages: 1, totalCount: 1 },
                            }),
                        });
                    });
                } else {
                    return new Promise((resolve) => {
                        resolveFastDelivered = () => resolve({
                            ok: true,
                            status: 200,
                            headers: new Headers({ "content-type": "application/json" }),
                            json: async () => ({
                                success: true,
                                orders: [{ _id: "fast", orderId: "ORD-FAST-DELIVERED", status: "delivered", pricing: { total: 2000 }, items: [] }],
                                pagination: { page: 1, totalPages: 1, totalCount: 1 },
                            }),
                        });
                    });
                }
            };

            const { findByText, getByRole, getByText, queryByText } = render(
                React.createElement(TestOrdersHarness)
            );

            // Initial row renders
            await findByText("ORD-INIT");

            const selectEl = getByRole("combobox");

            // Trigger request 1 (placed) and let timer fire
            await act(async () => {
                fireEvent.change(selectEl, { target: { value: "placed" } });
                await new Promise((r) => setTimeout(r, 10));
            });

            // Trigger request 2 (delivered) and let timer fire
            await act(async () => {
                fireEvent.change(selectEl, { target: { value: "delivered" } });
                await new Promise((r) => setTimeout(r, 10));
            });

            // Resolve fast delivered first
            resolveFastDelivered();
            const deliveredRow = await findByText("ORD-FAST-DELIVERED");
            assert.ok(deliveredRow);

            // Resolve slow placed late
            resolveSlowPlaced();
            await act(async () => {});

            // Delivered must remain, placed must never overwrite it
            assert.ok(getByText("ORD-FAST-DELIVERED"));
            assert.equal(queryByText("ORD-SLOW-PLACED"), null);
        });
    });
});
