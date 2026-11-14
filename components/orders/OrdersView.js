"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { ordersApi } from "@/lib/api/orders";
import { apiConfigured } from "@/lib/api/client";
import { formatINR } from "@/lib/data";

export default function OrdersView() {
  const { user, notify } = useStore();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [tracking, setTracking] = useState({});
  const [trackingLoading, setTrackingLoading] = useState({});

  // Cancellation modal state
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Order placed by mistake");
  const [cancelDetails, setCancelDetails] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Claim guest order state
  const [claimOrderId, setClaimOrderId] = useState("");
  const [claimToken, setClaimToken] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!apiConfigured || !user) {
      setBusy(false);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await ordersApi.list();
      const fetched = res.orders || [];
      setOrders(fetched);
      if (fetched.length > 0) {
        setExpandedIds(new Set([fetched[0].orderId || fetched[0]._id]));
      }
    } catch (err) {
      setError(err.message || "Unable to retrieve orders.");
      setOrders([]);
    } finally {
      setBusy(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleTrack(id) {
    setTrackingLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const result = await ordersApi.track(id);
      const trackingData = result.tracking || result;
      const statusText =
        trackingData.current_status ||
        trackingData.status ||
        result.status ||
        "Order confirmed and undergoing handloom inspection.";
      const courier = trackingData.courier_name ? ` via ${trackingData.courier_name}` : "";
      const awb = trackingData.awb_code ? ` (AWB: ${trackingData.awb_code})` : "";

      setTracking((prev) => ({
        ...prev,
        [id]: `${statusText}${courier}${awb}`,
      }));
    } catch (err) {
      setTracking((prev) => ({
        ...prev,
        [id]: "Shipment is being prepared at our weaving facility. AWB waybill will be assigned upon parcel dispatch.",
      }));
    } finally {
      setTrackingLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleConfirmCancel(e) {
    e.preventDefault();
    if (!cancellingOrder) return;

    setCancelBusy(true);
    setCancelError("");

    try {
      const orderId = cancellingOrder.orderId || cancellingOrder._id;
      const res = await ordersApi.cancel(cancellingOrder._id || orderId, {
        reason: cancelReason,
        details: cancelDetails,
      });

      notify("Order cancelled successfully");
      setCancellingOrder(null);
      setCancelReason("Order placed by mistake");
      setCancelDetails("");
      // Refresh order list to reflect cancelled status & stock restoration
      await loadOrders();
    } catch (err) {
      setCancelError(err.message || "Failed to cancel order. Please contact concierge support.");
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleClaimGuestOrder(e) {
    e.preventDefault();
    setClaimError("");
    setClaimMessage("");

    if (!claimOrderId || !claimToken) {
      setClaimError("Both Order Reference and Checkout Capability Token are required.");
      return;
    }

    setClaimBusy(true);
    try {
      const res = await ordersApi.claimGuestOrder(claimOrderId.trim(), claimToken.trim());
      if (res?.success) {
        setClaimMessage(`Order ${res.orderId || claimOrderId} successfully claimed and linked to your account!`);
        setClaimOrderId("");
        setClaimToken("");
        notify("Guest order linked to your account");
        await loadOrders();
      } else {
        setClaimError(res?.message || "Failed to claim order. Please verify token.");
      }
    } catch (err) {
      setClaimError(err.message || "Invalid order reference or capability token.");
    } finally {
      setClaimBusy(false);
    }
  }

  function handlePrintReceipt() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-pine-950 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-pine-950">My Orders</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pine-950/10 pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-pine-950 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Review detailed invoices, shipping addresses, delivery timeline, and package tracking.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-pine-900 px-5 py-2.5 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-pine-950"
        >
          Explore More Sarees
        </Link>
      </div>

      {!user ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-pine-900">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-pine-950">
            Sign In to View Orders
          </h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Please sign in to access your order history, delivery tracking, and official GST tax invoices.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="inline-flex cursor-pointer rounded-lg bg-pine-900 px-6 py-2.5 font-inter text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-pine-950"
            >
              Sign In
            </Link>
            <Link
              href="/track-order"
              className="inline-flex cursor-pointer rounded-lg border border-pine-950/20 bg-white px-6 py-2.5 font-inter text-xs font-semibold uppercase tracking-wider text-pine-950 transition hover:bg-linen"
            >
              Track Guest Order
            </Link>
          </div>
        </div>
      ) : busy ? (
        <div className="py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pine-900 border-r-transparent" />
          <p className="mt-4 font-inter text-xs font-medium text-muted">
            Retrieving your order records…
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="space-y-10">
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-pine-900">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-pine-950">
              No Orders Placed Yet
            </h2>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              You haven&apos;t placed any orders yet. Discover our collection of authentic 100% pure handloom linen sarees.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex cursor-pointer rounded-lg bg-pine-900 px-6 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow transition hover:bg-pine-950"
            >
              Start Shopping
            </Link>
          </div>

          {/* Claim Guest Order Card */}
          <div className="mx-auto max-w-xl rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-semibold text-pine-950">
              Placed an order as a guest?
            </h3>
            <p className="mt-1 text-xs text-muted">
              Link past guest orders to your account using the checkout capability token provided during checkout.
            </p>
            <form onSubmit={handleClaimGuestOrder} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Order ID (e.g. LS-20261112-...)"
                  value={claimOrderId}
                  onChange={(e) => setClaimOrderId(e.target.value)}
                  className="rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                />
                <input
                  required
                  type="password"
                  placeholder="Checkout Capability Token"
                  value={claimToken}
                  onChange={(e) => setClaimToken(e.target.value)}
                  className="rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                />
              </div>
              {claimError && <p className="text-xs text-red-700">{claimError}</p>}
              {claimMessage && <p className="text-xs text-emerald-700">{claimMessage}</p>}
              <button
                type="submit"
                disabled={claimBusy}
                className="rounded-md bg-pine-900 px-4 py-2 text-xs font-semibold text-white hover:bg-pine-950 disabled:opacity-50"
              >
                {claimBusy ? "Verifying…" : "Link Order to Account"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => {
            const orderId = order.orderId || order._id;
            const isExpanded = expandedIds.has(orderId);
            const items = order.items || [];
            const addr = order.shippingAddress || {};
            const total = order.pricing?.total ?? order.totalAmount ?? 0;
            const subtotal = order.pricing?.subtotal ?? total;
            const discount = order.pricing?.discount ?? 0;
            const shipping = order.pricing?.shipping ?? (total >= 999 ? 0 : 100);
            const status = order.status || order.orderStatus || "Processing";
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent";

            const canCancel =
              order.canCancel !== undefined
                ? order.canCancel
                : ["placed", "confirmed", "processing"].includes(status.toLowerCase());

            return (
              <article
                key={orderId}
                className="overflow-hidden rounded-2xl border border-pine-950/10 bg-white shadow-xs transition hover:border-pine-950/20 hover:shadow-sm"
              >
                {/* 1. Order Card Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pine-950/10 bg-neutral-50/70 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Order Placed
                      </p>
                      <p className="font-inter text-xs font-semibold text-pine-950">{dateStr}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Order Total
                      </p>
                      <p className="font-inter text-xs font-bold text-pine-950">{formatINR(total)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Recipient
                      </p>
                      <p className="font-inter text-xs font-semibold text-pine-950 truncate max-w-[140px] sm:max-w-none">
                        {addr.firstName || "Customer"} {addr.lastName || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-inter text-xs font-semibold border ${
                        status.toLowerCase() === "cancelled"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : status.toLowerCase() === "delivered"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          status.toLowerCase() === "cancelled"
                            ? "bg-red-600"
                            : status.toLowerCase() === "delivered"
                            ? "bg-blue-600"
                            : "bg-emerald-600 animate-pulse"
                        }`}
                      />
                      {status}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(orderId)}
                      aria-expanded={isExpanded}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-pine-950/20 bg-white px-3 py-1.5 font-inter text-xs font-semibold text-pine-950 transition hover:bg-neutral-50 shadow-xs"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 2. Order Items Preview List */}
                <div className="p-5 sm:p-6">
                  <div className="divide-y divide-pine-950/5">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        {it.image && (
                          <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-lg border border-pine-950/10 bg-neutral-50">
                            <Image
                              src={it.image}
                              alt={it.name || "Saree"}
                              fill
                              sizes="56px"
                              unoptimized={/^https?:\/\//.test(it.image)}
                              className="object-cover object-top"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate font-display text-sm font-semibold text-pine-950">
                            {it.name || "Pure Handloom Linen Saree"}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted">
                            Qty: <strong className="text-pine-950">{it.qty || it.quantity || 1}</strong>
                            {it.fabric ? ` · ${it.fabric}` : " · Pure Handloom Linen"}
                            {it.colour ? ` · ${it.colour}` : ""}
                          </p>
                          <p className="mt-1 font-inter text-xs font-semibold text-pine-900">
                            {formatINR(it.price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. Expandable Details */}
                  {isExpanded && (
                    <div className="mt-6 border-t border-pine-950/10 pt-6 animate-fadeIn">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* A. Full Delivery Address Details */}
                        <div className="rounded-xl border border-pine-950/10 bg-neutral-50/60 p-4 sm:p-5">
                          <div className="flex items-center gap-2 border-b border-pine-950/10 pb-2.5">
                            <span className="text-pine-900">📍</span>
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-pine-950">
                              Shipping &amp; Delivery Address
                            </h4>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-muted">
                            <p className="font-semibold text-pine-950 text-sm">
                              {addr.firstName} {addr.lastName || ""}
                            </p>
                            <p className="leading-relaxed">
                              {addr.address || "Street Address recorded"}
                            </p>
                            {addr.landmark && (
                              <p className="text-[11px] text-muted italic">
                                Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="font-medium text-pine-950">
                              {addr.city ? `${addr.city}, ` : ""}
                              {addr.state || ""} {addr.pincode ? `- ${addr.pincode}` : ""}
                            </p>
                            <div className="mt-3 pt-2.5 border-t border-pine-950/10 space-y-1 text-[11px]">
                              <p className="flex items-center gap-1.5">
                                <span className="font-semibold text-pine-950">Phone:</span>
                                <span>{addr.phone || "Not specified"}</span>
                              </p>
                              <p className="flex items-center gap-1.5 truncate">
                                <span className="font-semibold text-pine-950">Email:</span>
                                <span className="truncate">{addr.email || "Not specified"}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* B. Billing & Payment Breakdown */}
                        <div className="rounded-xl border border-pine-950/10 bg-neutral-50/60 p-4 sm:p-5">
                          <div className="flex items-center gap-2 border-b border-pine-950/10 pb-2.5">
                            <span className="text-pine-900">💳</span>
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-pine-950">
                              Payment &amp; Billing
                            </h4>
                          </div>

                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between text-muted">
                              <span>Payment Mode</span>
                              <span className="font-semibold text-pine-950">
                                {order.payment?.method === "cod" || order.paymentMethod === "cod"
                                  ? "Cash on Delivery"
                                  : "Prepaid Online Payment"}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted">
                              <span>Items Subtotal</span>
                              <span>{formatINR(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-medium">
                                <span>Discount Applied</span>
                                <span>- {formatINR(discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-muted">
                              <span>Shipping &amp; Transit</span>
                              <span className={shipping === 0 ? "font-semibold text-emerald-700" : ""}>
                                {shipping === 0 ? "FREE" : formatINR(shipping)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-pine-950/10 pt-2 text-sm font-bold text-pine-950">
                              <span>Total Amount</span>
                              <span className="text-pine-900">{formatINR(total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* C. Express Transit & Logistics Status */}
                        <div className="rounded-xl border border-pine-950/10 bg-neutral-50/60 p-4 sm:p-5 md:col-span-2 lg:col-span-1">
                          <div className="flex items-center gap-2 border-b border-pine-950/10 pb-2.5">
                            <span className="text-pine-900">📦</span>
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-pine-950">
                              Fulfillment &amp; Tracking
                            </h4>
                          </div>

                          <div className="mt-3 text-xs text-muted space-y-2">
                            <p>
                              Order Reference: <strong className="font-mono text-pine-950">#{orderId}</strong>
                            </p>
                            <p>
                              Packaging: <span className="font-medium text-pine-950">Eco-Friendly Handloom Cotton Cover</span>
                            </p>
                            <p>
                              Standard Transit: <span className="font-medium text-pine-950">4 - 6 Business Days</span>
                            </p>

                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => handleTrack(order._id || orderId)}
                                disabled={trackingLoading[order._id || orderId]}
                                className="w-full cursor-pointer rounded-lg bg-pine-900 px-3 py-2 text-center font-inter text-xs font-semibold text-white transition hover:bg-pine-950 shadow-xs disabled:opacity-50"
                              >
                                {trackingLoading[order._id || orderId]
                                  ? "Checking courier status…"
                                  : "Check Live Tracking"}
                              </button>

                              {canCancel && status.toLowerCase() !== "cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => setCancellingOrder(order)}
                                  className="w-full cursor-pointer rounded-lg border border-red-300 bg-white px-3 py-1.5 text-center font-inter text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Tracking Result Box */}
                      {tracking[order._id || orderId] && (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950">
                          <div className="flex items-center gap-2 font-semibold text-emerald-900">
                            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                            <span>Courier &amp; Logistics Tracking:</span>
                          </div>
                          <p className="mt-1 text-muted leading-relaxed">
                            {tracking[order._id || orderId]}
                          </p>
                        </div>
                      )}

                      {/* Bottom Action Strip */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-pine-950/10 pt-4 text-xs">
                        <a
                          href={`https://wa.me/919934752538?text=${encodeURIComponent(
                            `Hello House of Qalakari team, I have a query regarding my Order #${orderId}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer inline-flex items-center gap-1.5 font-medium text-emerald-800 hover:text-emerald-950"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                          </svg>
                          <span>Need help with this order? Chat on WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={handlePrintReceipt}
                          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-pine-900 underline hover:text-pine-950"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect width="12" height="8" x="6" y="14" />
                          </svg>
                          <span>Print Order Summary</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-semibold text-pine-950">
              Cancel Order #{cancellingOrder.orderId || cancellingOrder._id}?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, reserved product inventory will be restored.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <label className="block text-xs font-medium text-pine-950">
                Reason for cancellation *
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                >
                  <option value="Order placed by mistake">Order placed by mistake</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Want to change delivery address">Want to change delivery address</option>
                  <option value="Want to apply another coupon or payment method">Want to apply another coupon</option>
                  <option value="Other">Other reason</option>
                </select>
              </label>

              <label className="block text-xs font-medium text-pine-950">
                Additional Comments (Optional)
                <textarea
                  rows={2}
                  value={cancelDetails}
                  onChange={(e) => setCancelDetails(e.target.value)}
                  placeholder="Provide more information..."
                  className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                />
              </label>

              {cancelError && <p className="text-xs text-red-700">{cancelError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={cancelBusy}
                  onClick={() => setCancellingOrder(null)}
                  className="rounded-md border border-pine-950/20 px-4 py-2 text-xs font-semibold text-pine-950 hover:bg-linen"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelBusy}
                  className="rounded-md bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {cancelBusy ? "Processing…" : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
