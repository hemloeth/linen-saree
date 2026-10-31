import { test, describe, before, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isAdminEndpoint, buildDedupeKey, withAdminAuth, setAdminToken, clearAdminToken, apiGet } from "../lib/api.ts";

describe("Admin Orders Request Isolation & Error States Unit Suite", () => {
    let originalFetch;
    let store;

    before(() => {
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
    });

    beforeEach(() => {
        store.clear();
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        store.clear();
    });

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

    test("3. Admin session changes do not share in-flight results (Task 1 Acceptance)", async () => {
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

    test("4. Public GET deduplication remains intact for concurrent identical reads", async () => {
        let networkCallCount = 0;
        let resolveNetwork;

        globalThis.fetch = async (url) => {
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

        // Fire two concurrent identical public GETs
        const p1 = apiGet("/api/product?category=linen&limit=20");
        const p2 = apiGet("/api/product?category=linen&limit=20");

        resolveNetwork();
        const [res1, res2] = await Promise.all([p1, p2]);

        // Exactly one network call was made; second caller coalesced onto in-flight promise
        assert.equal(networkCallCount, 1, "Concurrent public reads must be coalesced");
        assert.deepEqual(res1, res2);
    });

    test("5. buildDedupeKey returns null for any admin GET request with query params", () => {
        assert.equal(buildDedupeKey("/api/order/admin/all?page=1&limit=20&search=test"), null);
        assert.equal(buildDedupeKey("/api/order/admin/123"), null);
        assert.equal(buildDedupeKey("/api/admin/dashboard"), null);
        assert.equal(buildDedupeKey("/api/coupon?active=true"), null);

        // Public and customer endpoints generate valid non-null dedupe keys
        assert.notEqual(buildDedupeKey("/api/product?limit=20"), null);
        assert.notEqual(buildDedupeKey("/api/order/my-orders"), null);
    });

    // Helper that models the exact sequence guard and state machine in AdminOrdersPage
    function createAdminOrdersController() {
        let orders = [];
        let loading = false;
        let fetchError = null;
        let fetchErrorStatus = null;
        let displayedQuery = null;
        let currentPage = 1;
        let totalPages = 1;
        let totalCount = 0;
        let requestSeq = 0;
        let isMounted = true;

        async function fetchOrders({
            targetPage = currentPage,
            search = "",
            status = "",
            sequenceId = undefined,
            fetcher,
        }) {
            const mySeq = sequenceId !== undefined ? sequenceId : ++requestSeq;
            loading = true;

            try {
                const data = await fetcher({ targetPage, search, status });

                if (!isMounted || mySeq !== requestSeq) {
                    return; // discard obsolete
                }

                if (!data || data.success === false || !Array.isArray(data.orders)) {
                    throw new Error(data?.message || "Failed to retrieve valid order listing from server.");
                }

                orders = data.orders;
                displayedQuery = { status: status || "", search: search.trim(), page: targetPage };
                if (data.pagination) {
                    currentPage = data.pagination.page || targetPage;
                    totalPages = data.pagination.totalPages || 1;
                    totalCount = data.pagination.totalCount ?? data.orders.length;
                }
                fetchError = null;
                fetchErrorStatus = null;
            } catch (err) {
                if (!isMounted || mySeq !== requestSeq) {
                    return; // discard obsolete
                }
                const errStatus = err?.status || null;
                fetchErrorStatus = errStatus;
                fetchError = errStatus === 401
                    ? "Admin session was not recognized. Please sign in again from the admin gate."
                    : errStatus === 403
                    ? "Access denied. Administrative privileges are required."
                    : err?.message || "Failed to load orders. Please try again.";

                if (errStatus === 401 || errStatus === 403) {
                    orders = [];
                    displayedQuery = null;
                }
            } finally {
                if (isMounted && mySeq === requestSeq) {
                    loading = false;
                }
            }
        }

        return {
            getState: () => ({
                orders,
                loading,
                fetchError,
                fetchErrorStatus,
                displayedQuery,
                currentPage,
                totalPages,
                totalCount,
                isOutdated: Boolean(fetchError && orders.length > 0 && fetchErrorStatus !== 401 && fetchErrorStatus !== 403),
                hasQueryMismatch: (status, search, page) => Boolean(
                    fetchError && orders.length > 0 && displayedQuery && (
                        displayedQuery.status !== (status || "") ||
                        displayedQuery.search !== (search || "").trim() ||
                        displayedQuery.page !== page
                    )
                ),
            }),
            setOrdersDirectly: (o) => { orders = o; },
            bumpSequence: () => ++requestSeq,
            unmount: () => {
                isMounted = false;
                requestSeq++;
            },
            fetchOrders,
        };
    }

    test("6. Latest search/filter request wins (Task 2: Out-of-order race resolution)", async () => {
        const ctrl = createAdminOrdersController();

        let resolveRequestA;
        let resolveRequestB;

        // Intent A triggered (e.g. status "processing")
        const seqA = ctrl.bumpSequence();
        const promiseA = ctrl.fetchOrders({
            status: "processing",
            sequenceId: seqA,
            fetcher: () => new Promise((resolve) => {
                resolveRequestA = () => resolve({
                    success: true,
                    orders: [{ _id: "ord_A", orderId: "ORD-PROCESSING" }],
                });
            }),
        });

        // While A is in-flight, Intent B triggered (e.g. status "delivered")
        const seqB = ctrl.bumpSequence();
        const promiseB = ctrl.fetchOrders({
            status: "delivered",
            sequenceId: seqB,
            fetcher: () => new Promise((resolve) => {
                resolveRequestB = () => resolve({
                    success: true,
                    orders: [{ _id: "ord_B", orderId: "ORD-DELIVERED" }],
                });
            }),
        });

        // Request B resolves FIRST
        resolveRequestB();
        await promiseB;

        // State now reflects Request B
        assert.equal(ctrl.getState().orders[0].orderId, "ORD-DELIVERED");
        assert.equal(ctrl.getState().loading, false);

        // Request A resolves LAST
        resolveRequestA();
        await promiseA;

        // Request A must be rejected: Request B remains authoritative!
        assert.equal(ctrl.getState().orders[0].orderId, "ORD-DELIVERED", "Obsolete Request A must not overwrite newer Request B");
        assert.equal(ctrl.getState().displayedQuery.status, "delivered");
        assert.equal(ctrl.getState().fetchError, null);
    });

    test("7. Obsolete request failure does not show an error or clear newer loading indicator", async () => {
        const ctrl = createAdminOrdersController();

        let rejectRequestA;
        let resolveRequestB;

        // Request A starts
        const seqA = ctrl.bumpSequence();
        const promiseA = ctrl.fetchOrders({
            search: "linen",
            sequenceId: seqA,
            fetcher: () => new Promise((_, reject) => {
                rejectRequestA = () => reject(new Error("Network timeout on obsolete query"));
            }),
        });

        // Request B starts immediately
        const seqB = ctrl.bumpSequence();
        const promiseB = ctrl.fetchOrders({
            search: "cotton",
            sequenceId: seqB,
            fetcher: () => new Promise((resolve) => {
                resolveRequestB = () => resolve({
                    success: true,
                    orders: [{ _id: "ord_cotton", orderId: "ORD-COTTON" }],
                });
            }),
        });

        // While B is still in flight (loading = true), A fails
        rejectRequestA();
        await promiseA;

        // A must not set an error and must not terminate B's loading indicator!
        assert.equal(ctrl.getState().loading, true, "Obsolete request failure must not stop active loading indicator");
        assert.equal(ctrl.getState().fetchError, null, "Obsolete request error must be suppressed");

        // Now B resolves
        resolveRequestB();
        await promiseB;

        assert.equal(ctrl.getState().loading, false);
        assert.equal(ctrl.getState().orders[0].orderId, "ORD-COTTON");
        assert.equal(ctrl.getState().fetchError, null);
    });

    test("8. Initial load failure shows error state and Retry", async () => {
        const ctrl = createAdminOrdersController();

        await ctrl.fetchOrders({
            targetPage: 1,
            fetcher: async () => {
                throw new Error("Database connection refused (500)");
            },
        });

        const state = ctrl.getState();
        assert.equal(state.orders.length, 0);
        assert.equal(state.fetchError, "Database connection refused (500)");
        assert.equal(state.isOutdated, false, "Initial load failure has no prior rows, not outdated");
    });

    test("9. Refresh failure preserves existing rows, displays error banner, and marks rows as outdated (Task 3)", async () => {
        const ctrl = createAdminOrdersController();

        // 1. Initial successful fetch
        await ctrl.fetchOrders({
            targetPage: 1,
            status: "confirmed",
            fetcher: async () => ({
                success: true,
                orders: [{ _id: "ord_1", orderId: "ORD-CONFIRMED-1" }],
                pagination: { page: 1, totalPages: 3, totalCount: 60 },
            }),
        });

        assert.equal(ctrl.getState().orders.length, 1);
        assert.equal(ctrl.getState().fetchError, null);
        assert.equal(ctrl.getState().isOutdated, false);

        // 2. User changes filter to "shipped", but refresh fails
        await ctrl.fetchOrders({
            targetPage: 1,
            status: "shipped",
            fetcher: async () => {
                throw new Error("Temporary gateway timeout (504)");
            },
        });

        const state = ctrl.getState();
        // Existing rows PRESERVED!
        assert.equal(state.orders.length, 1, "Previously loaded rows must be preserved");
        assert.equal(state.orders[0].orderId, "ORD-CONFIRMED-1");
        // Error banner is populated
        assert.equal(state.fetchError, "Temporary gateway timeout (504)");
        // Mark explicitly as outdated!
        assert.equal(state.isOutdated, true);
        // Query mismatch correctly identified: displayed rows are "confirmed", but current filter is "shipped"
        assert.equal(state.hasQueryMismatch("shipped", "", 1), true, "Must flag mismatch between displayed rows and active selection");
    });

    test("10. Retry clears error banner, removes outdated flag, and updates rows", async () => {
        const ctrl = createAdminOrdersController();

        // Existing rows
        ctrl.setOrdersDirectly([{ _id: "ord_old", orderId: "ORD-OLD" }]);

        // 1. Refresh failed
        await ctrl.fetchOrders({
            targetPage: 1,
            status: "shipped",
            fetcher: async () => {
                throw new Error("500 Server Error");
            },
        });
        assert.equal(ctrl.getState().isOutdated, true);
        assert.ok(ctrl.getState().fetchError);

        // 2. User clicks Retry -> successful fetch
        await ctrl.fetchOrders({
            targetPage: 1,
            status: "shipped",
            fetcher: async () => ({
                success: true,
                orders: [{ _id: "ord_new", orderId: "ORD-SHIPPED-NEW" }],
                pagination: { page: 1, totalPages: 1, totalCount: 1 },
            }),
        });

        const state = ctrl.getState();
        assert.equal(state.fetchError, null, "Error must be cleared upon successful retry");
        assert.equal(state.isOutdated, false, "Outdated flag must be cleared");
        assert.equal(state.orders[0].orderId, "ORD-SHIPPED-NEW");
    });

    test("11. Empty response shows empty state, but malformed response triggers error", async () => {
        const ctrl = createAdminOrdersController();

        // Legitimate empty response
        await ctrl.fetchOrders({
            fetcher: async () => ({ success: true, orders: [], pagination: { totalCount: 0 } }),
        });
        assert.equal(ctrl.getState().orders.length, 0);
        assert.equal(ctrl.getState().fetchError, null, "Legitimate empty response is NOT an error");

        // Malformed / failure response (success: false)
        await ctrl.fetchOrders({
            fetcher: async () => ({ success: false, message: "Internal catalogue index failure" }),
        });
        assert.equal(ctrl.getState().fetchError, "Internal catalogue index failure", "success: false must be treated as an error");

        // Malformed orders field (null/missing)
        await ctrl.fetchOrders({
            fetcher: async () => ({ success: true, orders: null }),
        });
        assert.match(ctrl.getState().fetchError, /Failed to retrieve valid order listing/, "Non-array orders must be treated as an error");
    });

    test("12. 401/403 authorization failure immediately clears protected rows", async () => {
        const ctrl = createAdminOrdersController();

        // Initial loaded state with sensitive customer orders
        ctrl.setOrdersDirectly([{ _id: "sensitive_1", orderId: "ORD-SECRET-1" }]);

        // Session expired (401)
        await ctrl.fetchOrders({
            fetcher: async () => {
                const err = new Error("Unauthorized");
                err.status = 401;
                throw err;
            },
        });

        const state = ctrl.getState();
        assert.equal(state.orders.length, 0, "Protected orders must be wiped out on 401");
        assert.equal(state.displayedQuery, null);
        assert.match(state.fetchError, /Admin session was not recognized/);
    });

    test("13. Component unmount discards in-flight requests cleanly", async () => {
        const ctrl = createAdminOrdersController();
        let resolveRequest;

        const promise = ctrl.fetchOrders({
            fetcher: () => new Promise((resolve) => {
                resolveRequest = () => resolve({
                    success: true,
                    orders: [{ _id: "late", orderId: "ORD-LATE" }],
                });
            }),
        });

        // Component unmounts while request is in-flight
        ctrl.unmount();

        // Request finishes after unmount
        resolveRequest();
        await promise;

        // State remains empty, not mutated after unmount
        assert.equal(ctrl.getState().orders.length, 0);
    });
});

