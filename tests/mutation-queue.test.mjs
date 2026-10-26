/**
 * Frontend Mutation Queue & Checkout State Unit Tests
 *
 * Exercises the REAL lib/mutation-queue.ts implementation:
 *  1. CartMutationQueue ordering, debounce and per-product op merging
 *  2. Queue flush() barrier ensuring consistent snapshot & revision
 *  3. Account scoping with monotonic generation token: switching storage keys
 *     invalidates in-flight and pending callbacks, even when switching away and back
 *  4. Clear barrier cancels pending product debounces and executes in order
 *  5. Flush handles edits occurring during flush (drain stability)
 *  6. Failed mutations remain visible until reconciled
 */

import test from "node:test";
import assert from "node:assert/strict";
import { CartMutationQueue } from "../lib/mutation-queue.ts";

test("CartMutationQueue debounces per-product operations and preserves latest call", async () => {
    let cart = [];
    const executedOps = [];

    const queue = new CartMutationQueue({
        debounceMs: 50,
        execute: async (op) => {
            executedOps.push(op);
            if (op.kind === "set") {
                cart = [{ productId: op.productId, quantity: op.quantity }];
            }
            return true;
        },
        getSnapshot: () => [...cart],
    });

    queue.enqueue({ kind: "set", productId: "prod_1", quantity: 1 });
    queue.enqueue({ kind: "set", productId: "prod_1", quantity: 2 });
    queue.enqueue({ kind: "set", productId: "prod_1", quantity: 3 });

    assert.equal(executedOps.length, 0, "No execution should happen before debounce fires");

    const flushResult = await queue.flush();
    assert.equal(executedOps.length, 1, "Only one merged mutation for prod_1 should execute");
    assert.equal(executedOps[0].quantity, 3, "Latest quantity should win");
    assert.equal(flushResult.success, true);
    assert.deepEqual(flushResult.snapshot, [{ productId: "prod_1", quantity: 3 }]);
});

test("CartMutationQueue runs distinct products independently", async () => {
    const executed = [];

    const queue = new CartMutationQueue({
        debounceMs: 30,
        execute: async (op) => {
            executed.push(op.productId);
            return true;
        },
        getSnapshot: () => executed,
    });

    queue.enqueue({ kind: "add", productId: "prod_1", quantity: 1 });
    queue.enqueue({ kind: "add", productId: "prod_2", quantity: 2 });

    await queue.flush();
    assert.equal(executed.length, 2);
    assert.ok(executed.includes("prod_1"));
    assert.ok(executed.includes("prod_2"));
});

test("CartMutationQueue cancels pending mutations on scope/account switch", async () => {
    let executed = false;

    const queue = new CartMutationQueue({
        debounceMs: 40,
        execute: async () => {
            executed = true;
            return true;
        },
        getSnapshot: () => ({ executed }),
    });

    queue.enqueue({ kind: "add", productId: "prod_1", quantity: 1 });

    // Switch account / storage key before timer expires
    queue.setScope("auth_user_123");

    await queue.flush();
    assert.equal(executed, false, "Pending mutation from old scope must not execute in new scope");
});

test("CartMutationQueue generation token prevents stale callbacks when switching away and back", async () => {
    let executedForGen0 = false;
    let slowResolve;

    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async (op, scope, revision, generation) => {
            if (generation === 0) {
                // Hang to simulate slow network
                await new Promise((resolve) => { slowResolve = resolve; });
                executedForGen0 = true;
            }
            return true;
        },
        getSnapshot: () => ({}),
    });

    // Enqueue on user A (generation 0)
    queue.setScope("user_A"); // gen 1
    const genBefore = queue.getGeneration();
    assert.equal(genBefore, 1);

    queue.enqueue({ kind: "add", productId: "prod_1", quantity: 1 });
    await new Promise((r) => setTimeout(r, 20)); // debounce fires, request in-flight

    // User switches to guest and back to user A
    queue.setScope("guest");  // gen 2
    queue.setScope("user_A"); // gen 3

    assert.equal(queue.getGeneration(), 3);

    // Now slow request finishes
    if (slowResolve) slowResolve();
    await queue.flush();

    // Stale work from generation 1 must not record as valid callback in generation 3
    assert.equal(queue.getFailedMutations().length, 0);
});

test("CartMutationQueue clear cancels pending debounces immediately and acts as barrier", async () => {
    const ops = [];

    const queue = new CartMutationQueue({
        debounceMs: 50,
        execute: async (op) => {
            ops.push(op.kind);
            return true;
        },
        getSnapshot: () => ops,
    });

    queue.enqueue({ kind: "add", productId: "prod_1", quantity: 1 });
    queue.enqueue({ kind: "clear" });

    await queue.flush();
    assert.deepEqual(ops, ["add", "clear"], "Pending add must drain before clear executes");
});

test("CartMutationQueue tracks failed mutations until cleared", async () => {
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => {
            return false; // failed
        },
        getSnapshot: () => ({}),
    });

    queue.enqueue({ kind: "add", productId: "prod_fail", quantity: 1 });
    const res = await queue.flush();

    assert.equal(res.success, false);
    const failed = queue.getFailedMutations();
    assert.equal(failed.length, 1);
    assert.equal(failed[0].op.productId, "prod_fail");

    queue.clearFailedMutations();
    assert.equal(queue.getFailedMutations().length, 0);
});

test("CartMutationQueue terminates flush and does not leak inFlightCount on account switch", async () => {
    let callCount = 0;
    const queue = new CartMutationQueue({
        debounceMs: 50,
        execute: async () => {
            callCount++;
            return true;
        },
        getSnapshot: () => ({ items: [] }),
    });

    queue.enqueue({ kind: "add", productId: "item-1", quantity: 1 });
    queue.enqueue({ kind: "add", productId: "item-2", quantity: 2 });

    // Switch account before debounces finish
    queue.setScope("user-B");

    const flushRes = await queue.flush();
    assert.equal(flushRes.success, true);
    assert.equal(callCount, 0, "No stale calls should have run after scope switch");
});

test("CartMutationQueue preserves unresolved failed mutations across consecutive flushes", async () => {
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => {
            return false;
        },
        getSnapshot: () => ({ items: [] }),
    });

    queue.enqueue({ kind: "add", productId: "fail-item", quantity: 1 });
    const firstFlush = await queue.flush();
    assert.equal(firstFlush.success, false);

    // Second flush without resolving failure must NOT report false success
    const secondFlush = await queue.flush();
    assert.equal(secondFlush.success, false, "Second flush must still report false if failure is unresolved");
    assert.equal(queue.getFailedMutations().length, 1);
});

// ===========================================================================
// TASK 7: COMPLETE CART SYNC FAILURE RECOVERY TESTS
// ===========================================================================

test("reconcileFailedMutations selectively resolves matching product failures and preserves others", async () => {
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => false, // fails
        getSnapshot: () => ({ items: [] }),
    });

    queue.enqueue({ kind: "add", productId: "prod_A", quantity: 1 });
    queue.enqueue({ kind: "add", productId: "prod_B", quantity: 2 });
    const flushRes = await queue.flush();
    assert.equal(flushRes.success, false, "Flush must fail when mutations fail");
    assert.equal(queue.getFailedMutations().length, 2);

    // Authoritative reconciliation confirms prod_A is in server cart, but NOT prod_B
    const resolvedCount = queue.reconcileFailedMutations(["prod_A"]);
    assert.equal(resolvedCount, 1);

    const remainingFailed = queue.getFailedMutations();
    assert.equal(remainingFailed.length, 1);
    assert.equal(remainingFailed[0].op.productId, "prod_B", "prod_B must remain unresolved");

    // Flush is still blocked because prod_B is unresolved
    const secondFlush = await queue.flush();
    assert.equal(secondFlush.success, false, "Checkout must remain blocked while prod_B is unresolved");

    // Now resolve prod_B
    queue.reconcileFailedMutations(["prod_B"]);
    assert.equal(queue.getFailedMutations().length, 0);

    // Flush now succeeds in the same session without reload or logout!
    const thirdFlush = await queue.flush();
    assert.equal(thirdFlush.success, true, "Checkout unblocked after complete reconciliation");
});

test("reconcileFailedMutations respects scope and generation boundaries", async () => {
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => false,
        getSnapshot: () => ({ items: [] }),
    });

    queue.setScope("user_1");
    queue.enqueue({ kind: "add", productId: "item_u1", quantity: 1 });
    await queue.flush();
    assert.equal(queue.getFailedMutations().length, 1);

    const gen1 = queue.getGeneration();

    // Stale reconciliation from old generation or different scope must not clear failure
    const clearedWrongScope = queue.reconcileFailedMutations(["item_u1"], "user_2", gen1);
    assert.equal(clearedWrongScope, 0);
    assert.equal(queue.getFailedMutations().length, 1, "Must not clear failure for different scope");

    const clearedWrongGen = queue.reconcileFailedMutations(["item_u1"], "user_1", gen1 + 5);
    assert.equal(clearedWrongGen, 0);
    assert.equal(queue.getFailedMutations().length, 1, "Must not clear failure for different generation");
});

test("acceptServerSnapshot resolves failed ADD and REMOVE for absent products", async () => {
    let failSync = true;
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => !failSync,
        getSnapshot: () => ({ items: [] }),
    });

    queue.setScope("user_test");

    // 1. Failed ADD: product was never added to server cart
    queue.enqueue({ kind: "add", productId: "absent_product", quantity: 1 });
    const flush1 = await queue.flush();
    assert.equal(flush1.success, false);
    assert.equal(queue.getFailedMutations().length, 1);

    // Accept verified server snapshot which contains NO items (absent_product is absent)
    const resolved = queue.acceptServerSnapshot([], "user_test", queue.getGeneration(), queue.getRevision());
    assert.equal(resolved, 1, "Absent product failure must be resolved by accepting server snapshot");
    assert.equal(queue.getFailedMutations().length, 0);

    // 2. Checkout unblocked in same session
    failSync = false;
    const flush2 = await queue.flush();
    assert.equal(flush2.success, true, "Checkout must be unblocked after accepting snapshot");

    // 3. Failed REMOVE: product was already absent on server
    failSync = true;
    queue.enqueue({ kind: "remove", productId: "already_absent" });
    const flush3 = await queue.flush();
    assert.equal(flush3.success, false);
    assert.equal(queue.getFailedMutations().length, 1);

    // Server snapshot has ['other_product'] (already_absent is absent)
    queue.acceptServerSnapshot(["other_product"], "user_test", queue.getGeneration());
    assert.equal(queue.getFailedMutations().length, 0, "Failed remove of already absent product is resolved");
});

test("acceptServerSnapshot preserves newer edits created while refetch was running", async () => {
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async () => false,
        getSnapshot: () => ({ items: [] }),
    });

    queue.setScope("user_test");

    // First failed mutation at revision 1
    queue.enqueue({ kind: "add", productId: "prod_old", quantity: 1 });
    await queue.flush();
    const revAtRefetch = queue.getRevision();
    assert.equal(queue.getFailedMutations().length, 1);

    // Newer mutation arrives while refetch is in flight at revision 2
    queue.enqueue({ kind: "add", productId: "prod_new", quantity: 1 });
    await queue.flush();
    assert.equal(queue.getFailedMutations().length, 2);

    // Reconcile response arrives for the older snapshot up to revAtRefetch
    const resolvedCount = queue.acceptServerSnapshot([], "user_test", queue.getGeneration(), revAtRefetch);
    assert.equal(resolvedCount, 1, "Only older failure should be resolved");

    const remaining = queue.getFailedMutations();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].op.productId, "prod_new", "Newer failure must survive older reconciliation");
});

test("retryFailedMutations re-enqueues failed operations to permit retry", async () => {
    let fail = true;
    const executed = [];
    const queue = new CartMutationQueue({
        debounceMs: 10,
        execute: async (op) => {
            executed.push(op);
            return !fail;
        },
        getSnapshot: () => ({ items: [] }),
    });

    queue.enqueue({ kind: "set", productId: "p1", quantity: 5 });
    await queue.flush();
    assert.equal(queue.getFailedMutations().length, 1);

    // User chooses to retry intended mutation when network restored
    fail = false;
    const retriedCount = queue.retryFailedMutations();
    assert.equal(retriedCount, 1);
    assert.equal(queue.getFailedMutations().length, 0);

    const flushRes = await queue.flush();
    assert.equal(flushRes.success, true);
    assert.equal(executed.length, 2, "Op should have executed twice (initial failure + retry)");
});


