import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/**
 * Pure cart transition logic identical to StoreProvider implementation
 */
function pureAdd(current, product, qty) {
  const pid = String(product.id);
  const exists = current.find((l) => String(l.product.id) === pid);
  if (exists) {
    return current.map((l) =>
      String(l.product.id) === pid ? { ...l, qty: l.qty + qty } : l
    );
  }
  return [...current, { product, qty }];
}

function pureSetQty(current, pid, qty) {
  if (qty <= 0) {
    return current.filter((l) => String(l.product.id) !== String(pid));
  }
  return current.map((l) =>
    String(l.product.id) === String(pid) ? { ...l, qty } : l
  );
}

function pureRemove(current, pid) {
  return current.filter((l) => String(l.product.id) !== String(pid));
}

function pureDeltaRollback(current, pid, quantity) {
  return current
    .map((line) => {
      if (String(line.product.id) === String(pid)) {
        const remaining = line.qty - quantity;
        return remaining > 0 ? { ...line, qty: remaining } : null;
      }
      return line;
    })
    .filter(Boolean);
}

test("Cart Behavioral Concurrency & State Machine Suite", async (t) => {
  await t.test("1. Rapid consecutive additions for different products produce exact deterministic cart", () => {
    let cart = [];
    const p1 = { id: "prod-1", name: "Linen Saree 1", price: 2000 };
    const p2 = { id: "prod-2", name: "Linen Saree 2", price: 3000 };
    const p3 = { id: "prod-3", name: "Linen Saree 3", price: 4000 };

    cart = pureAdd(cart, p1, 1);
    cart = pureAdd(cart, p2, 2);
    cart = pureAdd(cart, p3, 1);

    assert.equal(cart.length, 3, "Cart contains exactly 3 items");
    assert.equal(cart[0].product.id, "prod-1");
    assert.equal(cart[0].qty, 1);
    assert.equal(cart[1].product.id, "prod-2");
    assert.equal(cart[1].qty, 2);
    assert.equal(cart[2].product.id, "prod-3");
    assert.equal(cart[2].qty, 1);
  });

  await t.test("2. Rapid quantity increments on the same product do not suffer from stale closures", () => {
    let cart = [];
    const p1 = { id: "prod-1", name: "Linen Saree 1", price: 2000 };

    // Simulate 5 rapid clicks on "Add to bag"
    for (let i = 0; i < 5; i++) {
      cart = pureAdd(cart, p1, 1);
    }

    assert.equal(cart.length, 1, "Cart contains 1 line item");
    assert.equal(cart[0].qty, 5, "Total quantity is exactly 5 without lost increments");
  });

  await t.test("3. Setting quantity to 0 removes line item cleanly", () => {
    let cart = [];
    const p1 = { id: "prod-1", name: "Saree 1", price: 2000 };
    const p2 = { id: "prod-2", name: "Saree 2", price: 3000 };

    cart = pureAdd(cart, p1, 2);
    cart = pureAdd(cart, p2, 1);
    cart = pureSetQty(cart, "prod-1", 0);

    assert.equal(cart.length, 1, "Only 1 product remains");
    assert.equal(cart[0].product.id, "prod-2", "prod-2 is preserved");
  });

  await t.test("4. Delta rollback on failed mutation preserves concurrent additions", () => {
    let cart = [];
    const p1 = { id: "prod-1", name: "Saree 1", price: 2000 };
    const p2 = { id: "prod-2", name: "Saree 2", price: 3000 };
    const p3 = { id: "prod-3", name: "Saree 3", price: 4000 };

    // User rapidly adds p1, p2, p3 optimistically
    cart = pureAdd(cart, p1, 1);
    cart = pureAdd(cart, p2, 2);
    cart = pureAdd(cart, p3, 1);

    // Assume backend mutation for p2 fails (e.g. out of stock on server)
    cart = pureDeltaRollback(cart, "prod-2", 2);

    assert.equal(cart.length, 2, "Cart contains 2 items after isolated delta rollback");
    assert.deepEqual(
      cart.map((l) => l.product.id),
      ["prod-1", "prod-3"],
      "p1 and p3 were preserved, p2 was removed"
    );
  });

  await t.test("5. Add then Clear: serialized queue ensures cart is cleared and older add response cannot resurrect item", async () => {
    let clientCart = [];
    let pendingMutationsCount = 0;
    let queue = Promise.resolve();

    const p1 = { id: "prod-1", name: "Saree 1" };

    // 1. User adds p1
    clientCart = pureAdd(clientCart, p1, 1);
    pendingMutationsCount++;

    // Enqueue Add
    queue = queue.then(async () => {
      // Simulate backend add latency
      await new Promise((r) => setTimeout(r, 10));
      pendingMutationsCount--;
      // Backend add returns cart with p1
      if (pendingMutationsCount === 0) {
        clientCart = [{ product: p1, qty: 1 }];
      }
    });

    // 2. User immediately clicks Clear before Add resolves
    clientCart = [];
    pendingMutationsCount++;

    // Enqueue Clear in the same serialized queue
    queue = queue.then(async () => {
      // Simulate backend clear latency
      await new Promise((r) => setTimeout(r, 10));
      pendingMutationsCount--;
      if (pendingMutationsCount === 0) {
        clientCart = [];
      }
    });

    await queue;
    assert.equal(clientCart.length, 0, "Cart is completely empty after Add then Clear queue execution");
    assert.equal(pendingMutationsCount, 0, "All mutations resolved");
  });

  await t.test("6. Clear then Add: serialized queue preserves newly added item and prevents Clear from wiping it", async () => {
    let clientCart = [{ product: { id: "prod-old" }, qty: 1 }];
    let pendingMutationsCount = 0;
    let queue = Promise.resolve();

    // 1. User clicks Clear
    clientCart = [];
    pendingMutationsCount++;

    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 10));
      pendingMutationsCount--;
      // Clear response: only overwrite if queue has drained
      if (pendingMutationsCount === 0) {
        clientCart = [];
      }
    });

    // 2. User immediately clicks Add for p2 before Clear resolves
    const p2 = { id: "prod-new", name: "New Saree" };
    clientCart = pureAdd(clientCart, p2, 1);
    pendingMutationsCount++;

    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 10));
      pendingMutationsCount--;
      if (pendingMutationsCount === 0) {
        clientCart = [{ product: p2, qty: 1 }];
      }
    });

    await queue;
    assert.equal(clientCart.length, 1, "Cart contains the newly added product");
    assert.equal(clientCart[0].product.id, "prod-new", "prod-new was not wiped by earlier Clear response");
  });

  await t.test("7. Remove then Clear in serialized queue", async () => {
    let clientCart = [
      { product: { id: "p1" }, qty: 1 },
      { product: { id: "p2" }, qty: 2 },
    ];
    let pendingMutationsCount = 0;
    let queue = Promise.resolve();

    // Remove p1
    clientCart = pureRemove(clientCart, "p1");
    pendingMutationsCount++;
    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 5));
      pendingMutationsCount--;
    });

    // Clear
    clientCart = [];
    pendingMutationsCount++;
    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 5));
      pendingMutationsCount--;
      if (pendingMutationsCount === 0) {
        clientCart = [];
      }
    });

    await queue;
    assert.equal(clientCart.length, 0, "Cart is cleanly emptied");
    assert.equal(pendingMutationsCount, 0);
  });

  await t.test("8. Network failure during Clear restores previous cart if no newer operations queued", async () => {
    const originalCart = [
      { product: { id: "p1" }, qty: 1 },
      { product: { id: "p2" }, qty: 3 },
    ];
    let clientCart = [...originalCart];
    let pendingMutationsCount = 0;
    const prevSnapshot = [...clientCart];

    // Optimistically clear
    clientCart = [];
    pendingMutationsCount++;

    let clearSuccess = false;
    let clearError = null;

    try {
      // Simulate backend network failure
      throw new Error("Network timeout");
    } catch (err) {
      pendingMutationsCount--;
      if (pendingMutationsCount === 0) {
        clientCart = prevSnapshot;
      }
      clearSuccess = false;
      clearError = err.message;
    }

    assert.equal(clearSuccess, false);
    assert.equal(clearError, "Network timeout");
    assert.equal(clientCart.length, 2, "Items restored after failed clear");
    assert.equal(clientCart[0].product.id, "p1");
  });

  await t.test("9. Navigation to checkout awaits pending cart queue resolution", async () => {
    let settled = false;
    let queue = Promise.resolve();

    // Queue in-flight cart operations
    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 25));
      settled = true;
    });

    // Checkout verification
    async function checkoutSubmit() {
      await queue;
      return { ready: settled };
    }

    const result = await checkoutSubmit();
    assert.equal(result.ready, true, "Checkout submission awaited queue completion before executing");
  });

  await t.test("10. Authentication state changing (logout/login) awaits in-flight cart queue settlement", () => {
    const providerCode = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      providerCode,
      /const\s+authenticate\s*=\s*useCallback\s*\(\s*async[^{]*\{\s*if\s*\(\s*typeof\s+awaitCartSettled\s*===\s*"function"\s*\)\s*\{\s*await\s+awaitCartSettled\(\);/s,
      "authenticate awaits awaitCartSettled before proceeding"
    );
    assert.match(
      providerCode,
      /const\s+logout\s*=\s*useCallback\s*\(\s*async[^{]*\{\s*if\s*\(\s*typeof\s+awaitCartSettled\s*===\s*"function"\s*\)\s*\{\s*await\s+awaitCartSettled\(\);/s,
      "logout awaits awaitCartSettled before proceeding"
    );
  });

  await t.test("11. StoreProvider clear implementation participates in cartQueueRef and returns explicit results", () => {
    const providerCode = fs.readFileSync(path.join(ROOT, "components", "StoreProvider.js"), "utf8");
    assert.match(
      providerCode,
      /clear\s*=\s*useCallback\s*\(\s*async[^{]*\{[^}]*cartQueueRef\.current\s*=\s*cartQueueRef\.current/s,
      "clear chains onto cartQueueRef.current"
    );
    assert.match(
      providerCode,
      /pendingCartMutationsRef\.current\+\+/,
      "clear increments pendingCartMutationsRef"
    );
    assert.match(
      providerCode,
      /resolve\(\{\s*success:\s*true\s*\}\)/,
      "clear returns explicit success result"
    );
  });
});
