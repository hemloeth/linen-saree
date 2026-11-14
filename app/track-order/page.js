"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api/client";

export default function TrackOrderPage() {
  const [trackMode, setTrackMode] = useState("awb"); // "awb" | "order"
  const [awb, setAwb] = useState("");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleTrack(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const payload =
      trackMode === "awb"
        ? { awb: awb.trim() }
        : { orderId: orderId.trim(), email: email.trim() };

    if (trackMode === "awb" && !payload.awb) {
      setError("Please enter your AWB / tracking number.");
      return;
    }
    if (trackMode === "order" && (!payload.orderId || !payload.email)) {
      setError("Please enter both your Order ID and billing email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/api/order/track-public", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "No tracking details found for this shipment.");
      }
    } catch (err) {
      setError(err.message || "Failed to retrieve tracking details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[800px] flex-1 px-4 py-10 lg:px-6 lg:py-16">
        <div className="text-center">
          <span className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-pine-900">
            Order Status
          </span>
          <h1 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-pine-950 lg:text-3xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-xs text-muted lg:text-sm">
            Enter your AWB / tracking number or Order ID to view real-time delivery status.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full bg-linen p-1">
            <button
              type="button"
              onClick={() => {
                setTrackMode("awb");
                setError("");
              }}
              className={`rounded-full px-5 py-2 font-inter text-xs font-medium transition-colors ${
                trackMode === "awb" ? "bg-pine-900 text-white shadow-sm" : "text-pine-900 hover:text-pine-950"
              }`}
            >
              Track with AWB / Waybill
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackMode("order");
                setError("");
              }}
              className={`rounded-full px-5 py-2 font-inter text-xs font-medium transition-colors ${
                trackMode === "order" ? "bg-pine-900 text-white shadow-sm" : "text-pine-900 hover:text-pine-950"
              }`}
            >
              Track with Order ID
            </button>
          </div>
        </div>

        {/* Tracking Form */}
        <form onSubmit={handleTrack} className="mt-8 rounded-xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
          {trackMode === "awb" ? (
            <div>
              <label htmlFor="awb-input" className="block font-inter text-xs font-semibold text-pine-950">
                AWB / Tracking Number
              </label>
              <input
                id="awb-input"
                type="text"
                placeholder="e.g. 14324892482"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                className="mt-2 w-full rounded-md border border-pine-950/20 px-3.5 py-2.5 font-inter text-sm text-pine-950 placeholder:text-muted/60 focus:border-pine-900 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="order-id" className="block font-inter text-xs font-semibold text-pine-950">
                  Order ID
                </label>
                <input
                  id="order-id"
                  type="text"
                  placeholder="e.g. QAL-1002"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-2 w-full rounded-md border border-pine-950/20 px-3.5 py-2.5 font-inter text-sm text-pine-950 placeholder:text-muted/60 focus:border-pine-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email-input" className="block font-inter text-xs font-semibold text-pine-950">
                  Billing Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-md border border-pine-950/20 px-3.5 py-2.5 font-inter text-sm text-pine-950 placeholder:text-muted/60 focus:border-pine-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-pine-900 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 disabled:opacity-60"
          >
            {loading ? "Tracking shipment…" : "Track Shipment"}
          </button>
        </form>

        {/* Tracking Results */}
        {result && (
          <div className="mt-8 rounded-xl border border-pine-950/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-pine-950">Shipment Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-muted">Status</span>
                <p className="mt-1 font-semibold text-pine-900">
                  {result.tracking?.current_status || result.order?.status || "Processing"}
                </p>
              </div>
              <div>
                <span className="text-muted">Courier</span>
                <p className="mt-1 font-semibold text-pine-950">
                  {result.tracking?.courier_name || "Assigned Partner"}
                </p>
              </div>
              <div>
                <span className="text-muted">Tracking AWB</span>
                <p className="mt-1 font-semibold text-pine-950">{result.awb || "—"}</p>
              </div>
              <div>
                <span className="text-muted">Estimated Delivery</span>
                <p className="mt-1 font-semibold text-pine-950">{result.tracking?.etd || "2-4 business days"}</p>
              </div>
            </div>

            {result.tracking?.track_url && (
              <a
                href={result.tracking.track_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-xs font-semibold text-pine-900 underline underline-offset-4"
              >
                Open Courier Live Tracking &rarr;
              </a>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

