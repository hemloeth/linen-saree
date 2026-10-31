import { test, describe, before, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import React from "react";
import { isAdminEndpoint, buildDedupeKey, withAdminAuth, setAdminToken, clearAdminToken, apiGet, apiPost, apiPut } from "../lib/api.ts";

/**
 * Load the real production useAdminOrders hook from source by resolving its import aliases.
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

/**
 * Lightweight Hook Runner that mounts the real React hook, tracks state and effects,
 * executes debounce timers, and simulates unmounting.
 */
function createHookHarness(hookFn, initialOptions = {}) {
    let hookIndex = 0;
    const hookCells = [];
    const effects = [];
    let result;

    const dispatcher = {
        useState(initialValue) {
            const idx = hookIndex++;
            if (hookCells.length <= idx) {
                const val = typeof initialValue === "function" ? initialValue() : initialValue;
                hookCells.push({ type: "state", value: val });
            }
            const cell = hookCells[idx];
            const setState = (nextVal) => {
                const newVal = typeof nextVal === "function" ? nextVal(cell.value) : nextVal;
                cell.value = newVal;
                render();
            };
            return [cell.value, setState];
        },
        useRef(initialValue) {
            const idx = hookIndex++;
            if (hookCells.length <= idx) {
                hookCells.push({ type: "ref", value: { current: initialValue } });
            }
            return hookCells[idx].value;
        },
        useEffect(effect, deps) {
            const idx = hookIndex++;
            if (hookCells.length <= idx) {
                hookCells.push({ type: "effect", deps: undefined, cleanup: undefined });
            }
            const cell = hookCells[idx];
            effects.push({ cell, effect, deps });
        },
        useCallback(fn, deps) {
            return fn;
        },
        useMemo(fn, deps) {
            return fn();
        }
    };

    function render() {
        hookIndex = 0;
        const prevDispatcher = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H;
        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = dispatcher;
        try {
            result = hookFn(initialOptions);
        } finally {
            React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = prevDispatcher;
        }

        // Run effects whose dependencies changed
        while (effects.length > 0) {
            const { cell, effect, deps } = effects.shift();
            let hasChanged = true;
            if (cell.deps && deps && cell.deps.length === deps.length) {
                hasChanged = cell.deps.some((d, i) => !Object.is(d, deps[i]));
            }
            if (hasChanged) {
                if (typeof cell.cleanup === "function") {
                    cell.cleanup();
                }
                cell.deps = deps;
                cell.cleanup = effect();
            }
        }
    }

    render();

    return {
        get current() { return result; },
        rerender: () => render(),
        unmount: () => {
            for (const cell of hookCells) {
                if (cell.type === "effect" && typeof cell.cleanup === "function") {
                    cell.cleanup();
                    cell.cleanup = undefined;
                }
            }
        }
    };
}

describe("Admin Orders Request Isolation & Error States Test Suite", () => {
    let originalFetch;
    let store;
    let useAdminOrders;

    before(async () => {
        store = new Map();
        if (typeof globalThis.window === "undefined") {
            globalThis.window = {
                localStorage: {
                    getItem: (key) => store.get(key) || null,
                    setItem: (key, val) => store.set(key, String(val)),
                    removeItem: (key) => store.delete(key),
                    clear: () => store.clear(),
                },
                location: { hostname: "localhost" },
            };
        }
        const hookModule = await loadProductionHook();
        useAdminOrders = hookModule.useAdminOrders;
    });

    beforeEach(() => {
        store.clear();
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        store.clear();
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

        // Start admin orders request with Token A
        setAdminToken("token_A");
        const promiseA = apiGet("/api/order/admin/all?page=1&limit=20");

        // Before A finishes, change admin token to Token B and request the exact same URL
        setAdminToken("token_B");
        const promiseB = apiGet("/api/order/admin/all?page=1&limit=20");

        // Complete both network responses
        resolveFirstFetch();
        resolveSecondFetch();

        const [resA, resB] = await Promise.all([promiseA, promiseB]);

        // Verify two separate network fetches occurred
        assert.equal(fetchCalls.length, 2, "Must execute two separate network calls, no deduplication merge");
        assert.equal(fetchCalls[0].authHeader, "Bearer token_A", "First call must carry Token A");
        assert.equal(fetchCalls[1].authHeader, "Bearer token_B", "Second call must carry Token B");

        // Verify each receives its own response
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
    // SCENARIO 6: TASK 1 — SIGN-IN LINKS IN THE ACTUAL ORDERS PAGE
    // -------------------------------------------------------------

    test("6. Both Sign In links in orders page target the actual admin login route (/admin)", () => {
        const pageSource = fs.readFileSync(path.resolve("./app/admin/(dashboard)/orders/page.tsx"), "utf8");
        // Verify no obsolete /admin/login link remains
        assert.equal(pageSource.includes('href="/admin/login"'), false, "Must not contain /admin/login link");

        // Verify both links point to /admin
        const matches = pageSource.match(/href="\/admin"/g);
        assert.ok(matches && matches.length >= 2, "Must contain at least 2 links to /admin");
    });

    // -------------------------------------------------------------
    // SCENARIOS 1 to 5: REAL HOOK LIFECYCLE & ERROR PRESENTATION
    // -------------------------------------------------------------

    test("Scenario 1: Valid admin session loads and renders orders", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async (url) => {
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [
                        { _id: "ord_1", orderId: "LS-1001", status: "processing", pricing: { total: 2500 }, items: [] }
                    ],
                    pagination: { page: 1, totalPages: 1, totalCount: 1 },
                }),
            };
        };

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");

        assert.equal(harness.current.orders.length, 1);
        assert.equal(harness.current.orders[0].orderId, "LS-1001");
        assert.equal(harness.current.loading, false);
        assert.equal(harness.current.fetchError, null);
        assert.equal(harness.current.isOutdated, false);
    });

    test("Scenario 2: Initial load failure displays an error and Retry", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async () => {
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({ success: false, message: "Database unreachable" }),
            };
        };

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");

        assert.equal(harness.current.orders.length, 0);
        assert.equal(harness.current.fetchError, "Database unreachable");
        assert.equal(harness.current.loading, false);
        assert.equal(harness.current.isOutdated, false); // initial failure has no rows, so isOutdated is false
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");
        assert.equal(harness.current.orders.length, 1);

        // Subsequent refresh fails
        await harness.current.fetchOrders(1, "", "");

        // Rows preserved, error message surfaced, and marked outdated
        assert.equal(harness.current.orders.length, 1);
        assert.equal(harness.current.orders[0].orderId, "LS-1001");
        assert.equal(harness.current.fetchError, "Bad Gateway");
        assert.equal(harness.current.isOutdated, true);
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");
        assert.equal(harness.current.fetchError, "Server temporary failure");

        // Admin triggers retry after service recovers
        shouldFail = false;
        await harness.current.handleRetry();

        assert.equal(harness.current.fetchError, null);
        assert.equal(harness.current.orders.length, 1);
        assert.equal(harness.current.orders[0].orderId, "LS-RECOVERED");
        assert.equal(harness.current.isOutdated, false);
    });

    test("Scenario 5: Successful empty response displays the empty state", async () => {
        setAdminToken("valid_admin_token");
        globalThis.fetch = async () => {
            return {
                ok: true,
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
                json: async () => ({
                    success: true,
                    orders: [],
                    pagination: { page: 1, totalPages: 0, totalCount: 0 },
                }),
            };
        };

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");

        assert.equal(harness.current.orders.length, 0);
        assert.equal(harness.current.fetchError, null);
        assert.equal(harness.current.loading, false);
    });

    // -------------------------------------------------------------
    // SCENARIOS 7, 8, 9: TASK 2 — CLEAR ALL ORDER DETAILS ON 401/403
    // -------------------------------------------------------------

    test("Scenario 7: Open order details, then return 401 on refresh -> details close, rows disappear, sign-in guidance appears", async () => {
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");

        // Admin opens order details modal & image preview
        harness.current.setViewOrder(harness.current.orders[0]);
        harness.current.setPreviewItem({ name: "Silk Saree", quantity: 1, price: 9999 });
        assert.ok(harness.current.viewOrder);
        assert.ok(harness.current.previewItem);

        // Later refresh encounters 401
        await harness.current.fetchOrders(1, "", "");

        // Protected details modal closed, preview closed, rows cleared, auth error displayed
        assert.equal(harness.current.viewOrder, null, "viewOrder modal must be closed on 401");
        assert.equal(harness.current.previewItem, null, "previewItem must be cleared on 401");
        assert.equal(harness.current.orders.length, 0, "orders must be cleared on 401");
        assert.equal(harness.current.displayedQuery, null);
        assert.equal(harness.current.fetchErrorStatus, 401);
        assert.match(harness.current.fetchError, /Admin session was not recognized/);
    });

    test("Scenario 8: Open order details, then return 403 on refresh -> details close, rows disappear, access-denied appears", async () => {
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        await harness.current.fetchOrders(1, "", "");

        harness.current.setViewOrder(harness.current.orders[0]);
        assert.ok(harness.current.viewOrder);

        // Refresh encounters 403 Forbidden
        await harness.current.fetchOrders(1, "", "");

        assert.equal(harness.current.viewOrder, null, "viewOrder modal must be closed on 403");
        assert.equal(harness.current.orders.length, 0, "orders must be cleared on 403");
        assert.equal(harness.current.fetchErrorStatus, 403);
        assert.match(harness.current.fetchError, /Access denied/);
    });

    test("Scenario 9: For each order-action dialog, return 401/403 from its request -> dialog and protected values clear", async () => {
        setAdminToken("test_token");
        const harness = createHookHarness(useAdminOrders, { autoFetch: false });

        // Populate initial orders
        harness.current.setOrders([
            { _id: "ord_hold", orderId: "LS-HOLD", status: "processing", pricing: { total: 1000 }, items: [] }
        ]);

        // 9a: Resolve Hold Dialog with 401 response
        globalThis.fetch = async () => ({
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Unauthorized hold action" }),
        });

        harness.current.setHoldOrder(harness.current.orders[0]);
        harness.current.setHoldNotes("Sensitive internal notes for hold");
        assert.ok(harness.current.holdOrder);
        assert.equal(harness.current.holdNotes, "Sensitive internal notes for hold");

        await harness.current.handleResolveHoldSubmit("clear_hold");

        assert.equal(harness.current.holdOrder, null, "Hold dialog must close on 401");
        assert.equal(harness.current.holdNotes, "", "Hold notes must reset on 401");
        assert.equal(harness.current.orders.length, 0, "Orders must clear on 401");
        assert.equal(harness.current.fetchErrorStatus, 401);

        // 9b: COD Reconcile Dialog with 403 response
        harness.current.setOrders([
            { _id: "ord_cod", orderId: "LS-COD", status: "delivered", pricing: { total: 2000 }, items: [] }
        ]);
        globalThis.fetch = async () => ({
            ok: false,
            status: 403,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Forbidden COD action" }),
        });

        harness.current.setCodOrder(harness.current.orders[0]);
        harness.current.setCodUtr("UTR-BANK-123456");
        harness.current.setCodAmount("2000");
        harness.current.setCodDiscrepancyReason("Suspected fraud discrepancy");

        await harness.current.handleCodReconcileSubmit();

        assert.equal(harness.current.codOrder, null, "COD dialog must close on 403");
        assert.equal(harness.current.codUtr, "", "COD UTR must reset on 403");
        assert.equal(harness.current.codAmount, "", "COD Amount must reset on 403");
        assert.equal(harness.current.codDiscrepancyReason, "", "COD discrepancy reason must reset on 403");
        assert.equal(harness.current.orders.length, 0, "Orders must clear on 403");
        assert.equal(harness.current.fetchErrorStatus, 403);

        // 9c: Physical Return Confirmation Dialog with 401 response
        harness.current.setOrders([
            { _id: "ord_ret", orderId: "LS-RET", status: "delivered", pricing: { total: 3000 }, items: [] }
        ]);
        globalThis.fetch = async () => ({
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Unauthorized return action" }),
        });

        harness.current.setReturnOrder(harness.current.orders[0]);
        harness.current.setReturnNotes("Warehouse inspection comments");

        await harness.current.handleConfirmReturnSubmit();

        assert.equal(harness.current.returnOrder, null, "Return dialog must close on 401");
        assert.equal(harness.current.returnNotes, "", "Return notes must reset on 401");
        assert.equal(harness.current.orders.length, 0, "Orders must clear on 401");
        assert.equal(harness.current.fetchErrorStatus, 401);
    });

    // -------------------------------------------------------------
    // SCENARIOS 10, 11, 12: CONCURRENCY, RACES & UNMOUNT GUARDS
    // -------------------------------------------------------------

    test("Scenario 10: Resolve an older search/filter request after a newer one -> only the newer result remains", async () => {
        setAdminToken("valid_admin_token");
        let resolveReqA;
        let resolveReqB;
        let callIndex = 0;

        globalThis.fetch = async (url) => {
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });

        // Intent A fires
        const pA = harness.current.fetchOrders(1, "slow", "processing");

        // Intent B fires while A is pending
        const pB = harness.current.fetchOrders(1, "fast", "delivered");

        // Intent B completes FIRST
        resolveReqB();
        await pB;

        assert.equal(harness.current.orders[0].orderId, "ORD-FAST-B");

        // Intent A completes LAST
        resolveReqA();
        await pA;

        // Intent A must NOT overwrite Intent B
        assert.equal(harness.current.orders[0].orderId, "ORD-FAST-B", "Obsolete Request A must not overwrite newer Request B");
        assert.equal(harness.current.displayedQuery.status, "delivered");
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

        const harness = createHookHarness(useAdminOrders, { debounceMs: 50, autoFetch: true });

        // User rapidly modifies status filter: 'processing' -> 'cancelled' -> 'shipped'
        harness.current.setStatusFilter("processing");
        await new Promise((r) => setTimeout(r, 10)); // during debounce
        harness.current.setStatusFilter("cancelled");
        await new Promise((r) => setTimeout(r, 10)); // during debounce
        harness.current.setStatusFilter("shipped");

        // Wait for debounce timer to expire
        await new Promise((r) => setTimeout(r, 100));

        // Only the final selection ('shipped') should trigger fetch
        assert.ok(fetchCalls.length >= 1);
        const lastCall = fetchCalls[fetchCalls.length - 1];
        assert.ok(lastCall.includes("status=shipped"), "Latest status filter must be requested");
        assert.equal(harness.current.orders[0].orderId, "ORD-LATEST");
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

        const harness = createHookHarness(useAdminOrders, { autoFetch: false });
        const fetchPromise = harness.current.fetchOrders(1, "", "");

        // Unmount while request is still pending
        harness.unmount();

        // Resolve fetch after unmount
        resolveReq();
        await fetchPromise;

        // UI state was preserved without applying late response
        assert.equal(harness.current.orders.length, 0, "No state update after unmount");
    });
});
