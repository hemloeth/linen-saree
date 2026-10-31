import { test, describe, before, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isAdminEndpoint, withAdminAuth } from "../lib/api.ts";

describe("PHASE 2 Frontend: Admin Authentication Client & Route Scoping", () => {
    const dummyAdminToken = "test_admin_jwt_token_xyz123";

    before(() => {
        // Mock window.localStorage for node environment
        if (typeof globalThis.window === "undefined") {
            const store = new Map();
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
        window.localStorage.setItem("auth_admin_token", dummyAdminToken);
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    test("isAdminEndpoint correctly identifies admin routes", () => {
        // Order admin routes
        assert.equal(isAdminEndpoint("/api/order/admin/all", "GET"), true);
        assert.equal(isAdminEndpoint("/api/order/admin/672000000000000000000001/status", "PUT"), true);
        assert.equal(isAdminEndpoint("/api/order/admin/672000000000000000000001/refund", "POST"), true);

        // Product mutations
        assert.equal(isAdminEndpoint("/api/product/add-product", "POST"), true);
        assert.equal(isAdminEndpoint("/api/product/update/672000000000000000000001", "PUT"), true);
        assert.equal(isAdminEndpoint("/api/product/quick-update/672000000000000000000001", "PATCH"), true);
        assert.equal(isAdminEndpoint("/api/product/672000000000000000000001", "DELETE"), true);

        // Coupons and banners
        assert.equal(isAdminEndpoint("/api/coupon", "POST"), true);
        assert.equal(isAdminEndpoint("/api/coupon/672000000000000000000001", "DELETE"), true);
        assert.equal(isAdminEndpoint("/api/category/add-category", "POST"), true);
        assert.equal(isAdminEndpoint("/api/hero", "POST"), true);
        assert.equal(isAdminEndpoint("/api/marketing-collections/wedding", "PUT"), true);
    });

    test("isAdminEndpoint strictly excludes customer routes from admin classification", () => {
        assert.equal(isAdminEndpoint("/api/order/create", "POST"), false);
        assert.equal(isAdminEndpoint("/api/order/my-orders", "GET"), false);
        assert.equal(isAdminEndpoint("/api/order/672000000000000000000001/cancel", "POST"), false);
        assert.equal(isAdminEndpoint("/api/cart", "GET"), false);
        assert.equal(isAdminEndpoint("/api/cart/add", "POST"), false);
        assert.equal(isAdminEndpoint("/api/cart/update", "PUT"), false);
        assert.equal(isAdminEndpoint("/api/user/profile", "GET"), false);
        assert.equal(isAdminEndpoint("/api/user/reset-password", "POST"), false);
    });

    test("withAdminAuth attaches Bearer token to admin routes when token is present", () => {
        const initialHeaders = { "X-Requested-With": "XMLHttpRequest" };

        const adminHeaders = withAdminAuth("/api/order/admin/all", initialHeaders, "GET");
        assert.equal(adminHeaders.Authorization, `Bearer ${dummyAdminToken}`);

        const productHeaders = withAdminAuth("/api/product/add-product", initialHeaders, "POST");
        assert.equal(productHeaders.Authorization, `Bearer ${dummyAdminToken}`);

        const couponHeaders = withAdminAuth("/api/coupon", initialHeaders, "POST");
        assert.equal(couponHeaders.Authorization, `Bearer ${dummyAdminToken}`);
    });

    test("Customer requests NEVER inherit an admin bearer token, even with admin token stored", () => {
        const initialHeaders = { "X-Requested-With": "XMLHttpRequest" };

        // Customer checkout order creation
        const orderCreateHeaders = withAdminAuth("/api/order/create", initialHeaders, "POST");
        assert.equal(orderCreateHeaders.Authorization, undefined, "Customer order creation must not carry admin token");

        // Customer cancellation
        const cancelHeaders = withAdminAuth("/api/order/672000000000000000000001/cancel", initialHeaders, "POST");
        assert.equal(cancelHeaders.Authorization, undefined, "Customer order cancel must not carry admin token");

        // Cart operations
        const cartAddHeaders = withAdminAuth("/api/cart/add", initialHeaders, "POST");
        assert.equal(cartAddHeaders.Authorization, undefined, "Cart add must not carry admin token");

        // User profile
        const userHeaders = withAdminAuth("/api/user/profile", initialHeaders, "GET");
        assert.equal(userHeaders.Authorization, undefined, "User profile must not carry admin token");
    });

    test("Explicit forceAdmin flag attaches admin token to targeted endpoints", () => {
        const initialHeaders = {};
        const res = withAdminAuth("/api/custom/admin-check", initialHeaders, "GET", true);
        assert.equal(res.Authorization, `Bearer ${dummyAdminToken}`);
    });

    test("Absence of token in localStorage leaves headers untouched", () => {
        window.localStorage.removeItem("auth_admin_token");
        const initialHeaders = { "Content-Type": "application/json" };
        const res = withAdminAuth("/api/order/admin/all", initialHeaders, "GET");
        assert.equal(res.Authorization, undefined);
    });
});

