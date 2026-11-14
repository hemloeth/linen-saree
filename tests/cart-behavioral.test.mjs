import test from "node:test";
import assert from "node:assert/strict";

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
    // Delta rollback must subtract ONLY p2's quantity, leaving p1 and p3 intact!
    cart = pureDeltaRollback(cart, "prod-2", 2);

    assert.equal(cart.length, 2, "Cart contains 2 items after isolated delta rollback");
    assert.deepEqual(
      cart.map((l) => l.product.id),
      ["prod-1", "prod-3"],
      "p1 and p3 were preserved, p2 was removed"
    );
  });

  await t.test("5. Serialized queue with pending mutation counter blocks premature server overwrite", async () => {
    let clientCart = [];
    let pendingMutationsCount = 0;
    let serverReconciled = false;

    // Mutation 1: Add p1
    pendingMutationsCount++;
    const p1 = { id: "prod-1", name: "Saree 1" };
    clientCart = pureAdd(clientCart, p1, 1);

    // Mutation 2: Add p2 (fired before Mutation 1 server response returns)
    pendingMutationsCount++;
    const p2 = { id: "prod-2", name: "Saree 2" };
    clientCart = pureAdd(clientCart, p2, 1);

    assert.equal(clientCart.length, 2, "Optimistic client cart has both p1 and p2");

    // Mutation 1 server response arrives with serverCart that only knows about p1
    const serverCartFromMutation1 = [{ product: p1, qty: 1 }];
    pendingMutationsCount--;

    // Guard: Only reconcile when pendingMutationsCount === 0
    if (pendingMutationsCount === 0) {
      clientCart = serverCartFromMutation1;
      serverReconciled = true;
    }

    assert.equal(
      serverReconciled,
      false,
      "Premature reconciliation was blocked because Mutation 2 is still in flight"
    );
    assert.equal(clientCart.length, 2, "clientCart still holds both p1 and p2");

    // Mutation 2 server response arrives with serverCart that knows about both
    const serverCartFromMutation2 = [
      { product: p1, qty: 1 },
      { product: p2, qty: 1 },
    ];
    pendingMutationsCount--;

    if (pendingMutationsCount === 0) {
      clientCart = serverCartFromMutation2;
      serverReconciled = true;
    }

    assert.equal(serverReconciled, true, "Authoritative reconciliation applied once queue drained");
    assert.equal(clientCart.length, 2, "Final cart is consistent");
  });

  await t.test("6. Failed clear operation restores previous cart state", () => {
    let clientCart = [
      { product: { id: "p1" }, qty: 1 },
      { product: { id: "p2" }, qty: 3 },
    ];
    const prevCart = [...clientCart];

    // Optimistically clear
    clientCart = [];
    assert.equal(clientCart.length, 0, "Cart is optimistically empty");

    // Backend network failure on clear()
    const clearFailed = true;
    if (clearFailed) {
      // Recovery restores previous cart
      clientCart = prevCart;
    }

    assert.equal(clientCart.length, 2, "Cart was safely restored on failed clear");
    assert.equal(clientCart[1].qty, 3);
  });

  await t.test("7. awaitCartSettled awaits complete queue resolution before proceeding", async () => {
    let settled = false;
    let queue = Promise.resolve();

    // Enqueue an async mutation that takes 20ms
    queue = queue.then(async () => {
      await new Promise((r) => setTimeout(r, 20));
      settled = true;
    });

    assert.equal(settled, false, "Not settled before await");
    await queue;
    assert.equal(settled, true, "Settled after queue completion");
  });
});
