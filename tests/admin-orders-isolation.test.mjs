import { test, describe, before, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { JSDOM } from "jsdom";

// Setup standard DOM environment for React Testing Library before importing React
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
});
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;

import { renderHook, act, cleanup } from "@testing-library/react";
import { isAdminEndpoint, buildDedupeKey, withAdminAuth, setAdminToken, clearAdminToken, apiGet } from "../lib/api.ts";

/**
 * Load the production useAdminOrders hook from source by resolving import aliases.
 */
async function loadProductionHook() {
    const hookPath = path.resolve("./app/admin/(dashboard)/orders/use-admin-orders.ts");
    let code = fs.readFileSync(hookPath, "utf8");
    code = code.replace(/from\s+["']@\/lib\/api["']/g, 'from "../lib/api.ts"');
    const transpiled = ts.transpileModule(code, {
        compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
        }
    }).outputText;
    const tempFile = path.resolve("./tests/.test-hook-transpiled.mjs");
    fs.writeFileSync(tempFile, transpiled, "utf8");
    try {
        const fileUrl = new URL(`file:///${tempFile.replace(/\\/g, "/")}`).href;
        const mod = await import(fileUrl);
        return mod;
    } finally {
        try { fs.unlinkSync(tempFile); } catch {}
    }
}

describe("Admin Orders Request Isolation & Error States Test Suite (React Testing Library)", () => {
    let originalFetch;
    let store;
    let useAdminOrders;

    before(async () => {
        const hookModule = await loadProductionHook();
        useAdminOrders = hookModule.useAdminOrders;
    });

    beforeEach(() => {
        globalThis.window.localStorage.clear();
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        cleanup();
        globalThis.fetch = originalFetch;
        globalThis.window.localStorage.clear();
    });

    // -------------------------------------------------------------
    // API CLIENT SPECIFICATIONS & DEDUPLICATION (Scenarios 13, 14)
    // -------------------------------------------------------------

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

    // -------------------------------------------------------------
    // SCENARIO 6: SIGN-IN LINKS TARGET ACTUAL ROUTE (/admin)
    // -------------------------------------------------------------

    test("6. Both Sign In links in orders view target the actual admin login route (/admin)", () => {
        const viewSource = fs.readFileSync(path.resolve("./app/admin/(dashboard)/orders/orders-view.tsx"), "utf8");
        assert.equal(viewSource.includes('href="/admin/login"'), false, "Must not contain /admin/login link");

        const matches = viewSource.match(/href="\/admin"/g);
        assert.ok(matches && matches.length >= 2, "Must contain at least 2 links to /admin");
    });

    // -------------------------------------------------------------
    // COMPONENT & HOOK LIFECYCLE TESTS VIA REACT TESTING LIBRARY
    // -------------------------------------------------------------

    test("Scenario 1: Valid admin session loads and renders orders", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async () => ({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
                success: true,
                orders: [{ _id: "ord_1", orderId: "LS-1001", status: "processing", pricing: { total: 2500 }, items: [] }],
                pagination: { page: 1, totalPages: 1, totalCount: 1 },
            }),
        });

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));
        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.orders.length, 1);
        assert.equal(result.current.orders[0].orderId, "LS-1001");
        assert.equal(result.current.loading, false);
        assert.equal(result.current.fetchError, null);
        assert.equal(result.current.isOutdated, false);
    });

    test("Scenario 2: Initial load failure displays an error and Retry", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async () => ({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Database unreachable" }),
        });

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));
        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.orders.length, 0);
        assert.equal(result.current.fetchError, "Database unreachable");
        assert.equal(result.current.loading, false);
        assert.equal(result.current.isOutdated, false);
    });

    test("Scenario 3: Refresh failure preserves rows and visibly marks them outdated", async () => {
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
                        orders: [{ _id: "ord_1", orderId: "LS-1001", status: "processing", pricing: { total: 2500 }, items: [] }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                };
            }
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Bad Gateway" }),
            };
        };

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));
        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });
        assert.equal(result.current.orders.length, 1);

        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.orders.length, 1);
        assert.equal(result.current.orders[0].orderId, "LS-1001");
        assert.equal(result.current.fetchError, "Bad Gateway");
        assert.equal(result.current.isOutdated, true);
    });

    test("Scenario 4: Successful retry clears the error and updates the list", async () => {
        setAdminToken("valid_admin_token");
        let shouldFail = true;
        globalThis.fetch = async () => {
            if (shouldFail) {
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({ success: false, message: "Server temporary failure" }),
                };
            }
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [{ _id: "ord_recovered", orderId: "LS-RECOVERED", status: "delivered", pricing: { total: 3000 }, items: [] }],
                    pagination: { page: 1, totalPages: 1, totalCount: 1 },
                }),
            };
        };

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));
        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });
        assert.equal(result.current.fetchError, "Server temporary failure");

        shouldFail = false;
        await act(async () => {
            await result.current.handleRetry();
        });

        assert.equal(result.current.fetchError, null);
        assert.equal(result.current.orders.length, 1);
        assert.equal(result.current.orders[0].orderId, "LS-RECOVERED");
        assert.equal(result.current.isOutdated, false);
    });

    test("Scenario 5: Successful empty response displays the empty state", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async () => ({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
                success: true,
                orders: [],
                pagination: { page: 1, totalPages: 0, totalCount: 0 },
            }),
        });

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));
        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.orders.length, 0);
        assert.equal(result.current.fetchError, null);
        assert.equal(result.current.loading, false);
    });

    test("Scenario 7: Open order details, then return 401 on refresh -> details close, rows disappear, loading reset, sign-in appears", async () => {
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
                        orders: [{ _id: "ord_secret", orderId: "LS-CONFIDENTIAL", status: "processing", pricing: { total: 9999 }, items: [] }],
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

        act(() => {
            result.current.setViewOrder(result.current.orders[0]);
            result.current.setPreviewItem({ name: "Silk Saree", quantity: 1, price: 9999 });
        });
        assert.ok(result.current.viewOrder);
        assert.ok(result.current.previewItem);

        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.viewOrder, null, "viewOrder modal must be closed on 401");
        assert.equal(result.current.previewItem, null, "previewItem must be cleared on 401");
        assert.equal(result.current.orders.length, 0, "orders must be cleared on 401");
        assert.equal(result.current.loading, false, "loading must be explicitly reset to false on 401");
        assert.equal(result.current.displayedQuery, null);
        assert.equal(result.current.fetchErrorStatus, 401);
        assert.match(result.current.fetchError, /Admin session was not recognized/);
    });

    test("Scenario 8: Open order details, then return 403 on refresh -> details close, rows disappear, loading reset, access-denied appears", async () => {
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
                        orders: [{ _id: "ord_secret_2", orderId: "LS-CONFIDENTIAL-2", status: "processing", pricing: { total: 5000 }, items: [] }],
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

        act(() => {
            result.current.setViewOrder(result.current.orders[0]);
        });
        assert.ok(result.current.viewOrder);

        await act(async () => {
            await result.current.fetchOrders(1, "", "");
        });

        assert.equal(result.current.viewOrder, null, "viewOrder modal must be closed on 403");
        assert.equal(result.current.orders.length, 0, "orders must be cleared on 403");
        assert.equal(result.current.loading, false, "loading must be reset to false on 403");
        assert.equal(result.current.fetchErrorStatus, 403);
        assert.match(result.current.fetchError, /Access denied/);
    });

    test("Scenario 9: For each order-action dialog, return 401/403 from its request -> dialog and protected values clear", async () => {
        setAdminToken("test_token");
        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

        act(() => {
            result.current.setOrders([
                { _id: "ord_hold", orderId: "LS-HOLD", status: "processing", pricing: { total: 1000 }, items: [] }
            ]);
        });

        // 9a: Hold dialog with 401
        globalThis.fetch = async () => ({
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Unauthorized hold action" }),
        });

        act(() => {
            result.current.setHoldOrder(result.current.orders[0]);
            result.current.setHoldNotes("Sensitive internal notes for hold");
        });

        await act(async () => {
            await result.current.handleResolveHoldSubmit("clear_hold");
        });

        assert.equal(result.current.holdOrder, null, "Hold dialog must close on 401");
        assert.equal(result.current.holdNotes, "", "Hold notes must reset on 401");
        assert.equal(result.current.actionLoading, false, "actionLoading must be reset to false");
        assert.equal(result.current.orders.length, 0, "Orders must clear on 401");
        assert.equal(result.current.fetchErrorStatus, 401);

        // 9b: COD dialog with 403
        act(() => {
            result.current.setOrders([
                { _id: "ord_cod", orderId: "LS-COD", status: "delivered", pricing: { total: 2000 }, items: [] }
            ]);
        });
        globalThis.fetch = async () => ({
            ok: false,
            status: 403,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Forbidden COD action" }),
        });

        act(() => {
            result.current.setCodOrder(result.current.orders[0]);
            result.current.setCodUtr("UTR-BANK-123456");
            result.current.setCodAmount("2000");
            result.current.setCodDiscrepancyReason("Suspected fraud discrepancy");
        });

        await act(async () => {
            await result.current.handleCodReconcileSubmit();
        });

        assert.equal(result.current.codOrder, null, "COD dialog must close on 403");
        assert.equal(result.current.codUtr, "", "COD UTR must reset on 403");
        assert.equal(result.current.actionLoading, false);
        assert.equal(result.current.orders.length, 0);
        assert.equal(result.current.fetchErrorStatus, 403);

        // 9c: Return dialog with 401
        act(() => {
            result.current.setOrders([
                { _id: "ord_ret", orderId: "LS-RET", status: "delivered", pricing: { total: 3000 }, items: [] }
            ]);
        });
        globalThis.fetch = async () => ({
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Unauthorized return action" }),
        });

        act(() => {
            result.current.setReturnOrder(result.current.orders[0]);
            result.current.setReturnNotes("Warehouse inspection comments");
        });

        await act(async () => {
            await result.current.handleConfirmReturnSubmit();
        });

        assert.equal(result.current.returnOrder, null, "Return dialog must close on 401");
        assert.equal(result.current.returnNotes, "", "Return notes must reset on 401");
        assert.equal(result.current.actionLoading, false);
        assert.equal(result.current.orders.length, 0);
        assert.equal(result.current.fetchErrorStatus, 401);
    });

    test("Scenario 10: Resolve an older search/filter request after a newer one -> only the newer result remains", async () => {
        setAdminToken("valid_admin_token");
        let resolveReqA;
        let resolveReqB;
        let callIndex = 0;

        globalThis.fetch = async () => {
            callIndex++;
            if (callIndex === 1) {
                return new Promise((resolve) => {
                    resolveReqA = () => resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "ord_slow", orderId: "ORD-SLOW-A", status: "processing", pricing: { total: 100 }, items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    });
                });
            } else {
                return new Promise((resolve) => {
                    resolveReqB = () => resolve({
                        ok: true,
                        status: 200,
                        headers: new Headers({ "content-type": "application/json" }),
                        json: async () => ({
                            success: true,
                            orders: [{ _id: "ord_fast", orderId: "ORD-FAST-B", status: "delivered", pricing: { total: 200 }, items: [] }],
                            pagination: { page: 1, totalPages: 1, totalCount: 1 },
                        }),
                    });
                });
            }
        };

        const { result } = renderHook(() => useAdminOrders({ autoFetch: false }));

        let pA, pB;
        act(() => {
            pA = result.current.fetchOrders(1, "slow", "processing");
            pB = result.current.fetchOrders(1, "fast", "delivered");
        });

        // Intent B completes first
        resolveReqB();
        await act(async () => {
            await pB;
        });
        assert.equal(result.current.orders[0].orderId, "ORD-FAST-B");

        // Intent A completes last
        resolveReqA();
        await act(async () => {
            await pA;
        });

        // Intent A must NOT overwrite Intent B
        assert.equal(result.current.orders[0].orderId, "ORD-FAST-B", "Obsolete Request A must not overwrite newer Request B");
        assert.equal(result.current.displayedQuery.status, "delivered");
    });

    test("Scenario 11: Change filters while request is pending, including during debounce -> obsolete results must not overwrite latest selection", async () => {
        setAdminToken("valid_admin_token");
        const fetchCalls = [];

        globalThis.fetch = async (url) => {
            fetchCalls.push(url);
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [{ _id: "ord_latest", orderId: "ORD-LATEST", status: "shipped", pricing: { total: 500 }, items: [] }],
                    pagination: { page: 1, totalPages: 1, totalCount: 1 },
                }),
            };
        };

        const { result } = renderHook(() => useAdminOrders({ debounceMs: 50, autoFetch: true }));

        act(() => {
            result.current.setStatusFilter("processing");
        });
        await new Promise((r) => setTimeout(r, 10));

        act(() => {
            result.current.setStatusFilter("cancelled");
        });
        await new Promise((r) => setTimeout(r, 10));

        act(() => {
            result.current.setStatusFilter("shipped");
        });

        // Wait for debounce timer to complete
        await act(async () => {
            await new Promise((r) => setTimeout(r, 100));
        });

        assert.ok(fetchCalls.length >= 1);
        const lastCall = fetchCalls[fetchCalls.length - 1];
        assert.ok(lastCall.includes("status=shipped"), "Latest status filter must be requested");
        assert.equal(result.current.orders[0].orderId, "ORD-LATEST");
    });

    test("Scenario 12: Unmount while request is pending -> no subsequent UI update", async () => {
        setAdminToken("valid_admin_token");
        let resolveReq;

        globalThis.fetch = async () => {
            return new Promise((resolve) => {
                resolveReq = () => resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers({ "content-type": "application/json" }),
                    json: async () => ({
                        success: true,
                        orders: [{ _id: "ord_unmounted", orderId: "ORD-AFTER-UNMOUNT", status: "placed", pricing: { total: 100 }, items: [] }],
                        pagination: { page: 1, totalPages: 1, totalCount: 1 },
                    }),
                });
            });
        };

        const { result, unmount } = renderHook(() => useAdminOrders({ autoFetch: false }));
        let fetchPromise;
        act(() => {
            fetchPromise = result.current.fetchOrders(1, "", "");
        });

        unmount();

        resolveReq();
        await act(async () => {
            await fetchPromise;
        });

        assert.equal(result.current.orders.length, 0, "No state update after unmount");
    });

    // -------------------------------------------------------------
    // TASK 3 REGRESSION TESTS: ASYNC CALLBACKS WITH INVALIDATED SESSIONS
    // -------------------------------------------------------------

    test("Scenario 15: Late SKU search response cannot reopen modal or restore data after auth cleanup", async () => {
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

        // Trigger SKU search (async request in flight)
        let skuPromise;
        act(() => {
            skuPromise = result.current.handleSkuSearch({ key: "Enter" });
        });
        assert.equal(result.current.isSearchingSku, true);

        // Before SKU search finishes, session is invalidated by 401 authorization failure
        act(() => {
            result.current.clearProtectedOrderState(401);
        });

        assert.equal(result.current.isSearchingSku, false, "Loading state must be reset immediately on 401");
        assert.equal(result.current.showSkuModal, false);
        assert.equal(result.current.searchedProduct, null);

        // Late SKU search resolves now
        resolveSku();
        await act(async () => {
            await skuPromise;
        });

        // Modal MUST stay closed and protected state MUST NOT be restored
        assert.equal(result.current.showSkuModal, false, "Stale SKU response must not reopen modal after session invalidated");
        assert.equal(result.current.searchedProduct, null);
        assert.equal(result.current.isSearchingSku, false);
    });

    test("Scenario 16: Late action response cannot refetch or restore cleared state after session invalidation", async () => {
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

        // Start hold action
        let holdPromise;
        act(() => {
            holdPromise = result.current.handleResolveHoldSubmit("clear_hold");
        });
        assert.equal(result.current.actionLoading, true);

        // Session invalidated while action is in flight
        act(() => {
            result.current.clearProtectedOrderState(401);
        });
        assert.equal(result.current.actionLoading, false, "actionLoading must be reset on 401");

        const fetchCountBefore = ordersFetchCount;

        // Resolve late hold response
        resolveHold();
        await act(async () => {
            await holdPromise;
        });

        // Stale action must NOT trigger follow-up orders fetch and must not resurrect holdOrder
        assert.equal(ordersFetchCount, fetchCountBefore, "Late action must not trigger follow-up fetchOrders on invalidated session");
        assert.equal(result.current.holdOrder, null);
        assert.equal(result.current.actionLoading, false);
    });
});
