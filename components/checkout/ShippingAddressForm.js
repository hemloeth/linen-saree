"use client";

import { useEffect, useState } from "react";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function ShippingAddressForm({ value, onChange, error, onContinue }) {
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    if (value.pincode && /^\d{6}$/.test(value.pincode)) {
      setPinLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${value.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
            const po = data[0].PostOffice[0];
            const city = po.District || po.Block || "";
            const rawState = po.State || "";
            const matchedState = INDIAN_STATES.find(
              (s) => s.toLowerCase() === rawState.trim().toLowerCase()
            );
            const resolvedState = matchedState || rawState;
            onChange((prev) => ({
              ...prev,
              city: city || prev.city,
              state: resolvedState || prev.state,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setPinLoading(false));
    }
  }, [value.pincode, onChange]);

  return (
    <div className="rounded-2xl border border-pine-950/10 bg-white p-5 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-pine-950/10 pb-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-pine-950 leading-tight">
            Delivery Address
          </h2>
          <p className="mt-1 text-xs text-muted">
            Fields marked with an asterisk (<span className="text-[#b42318] font-bold">*</span>) are mandatory.
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-pine-900 border border-pine-950/10">
          Step 1 of 2
        </span>
      </div>

      {/* Input Fields */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Row 1: First Name & Last Name (Side by side on BOTH mobile and desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:col-span-2">
          <div>
            <label htmlFor="firstName" className="flex items-center gap-1 text-xs font-medium text-pine-950">
              <span>First Name</span>
              <span className="text-[#b42318] font-bold" title="Required">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={value.firstName || ""}
              placeholder="e.g. Priya"
              autoComplete="given-name"
              onChange={(e) => onChange((prev) => ({ ...prev, firstName: e.target.value }))}
              className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3 sm:px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="flex items-center justify-between text-xs font-medium text-pine-950">
              <span>Last Name</span>
              <span className="text-[10px] font-normal text-muted">(Optional)</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={value.lastName || ""}
              placeholder="e.g. Sharma"
              autoComplete="family-name"
              onChange={(e) => onChange((prev) => ({ ...prev, lastName: e.target.value }))}
              className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3 sm:px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
            />
          </div>
        </div>

        {/* Row 2: Email Address & Mobile Number */}
        <div>
          <label htmlFor="email" className="flex items-center gap-1 text-xs font-medium text-pine-950">
            <span>Email Address</span>
            <span className="text-[#b42318] font-bold" title="Required">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={value.email || ""}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
            className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
          />
        </div>

        <div>
          <label htmlFor="phone" className="flex items-center gap-1 text-xs font-medium text-pine-950">
            <span>Mobile Number</span>
            <span className="text-[#b42318] font-bold" title="Required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            value={value.phone || ""}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            onChange={(e) => onChange((prev) => ({ ...prev, phone: e.target.value }))}
            className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
          />
        </div>

        {/* Row 3: Street Address */}
        <div className="sm:col-span-2">
          <label htmlFor="address" className="flex items-center gap-1 text-xs font-medium text-pine-950">
            <span>Flat / House No., Apartment &amp; Street</span>
            <span className="text-[#b42318] font-bold" title="Required">*</span>
          </label>
          <input
            id="address"
            type="text"
            required
            value={value.address || ""}
            placeholder="House/Flat 204, Green Valley Apartments, 4th Main"
            autoComplete="street-address"
            onChange={(e) => onChange((prev) => ({ ...prev, address: e.target.value }))}
            className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
          />
        </div>

        {/* Row 4: Landmark */}
        <div className="sm:col-span-2">
          <label htmlFor="landmark" className="flex items-center justify-between text-xs font-medium text-pine-950">
            <span>Landmark</span>
            <span className="text-[10px] font-normal text-muted">(Optional)</span>
          </label>
          <input
            id="landmark"
            type="text"
            value={value.landmark || ""}
            placeholder="Near Lotus Temple / Behind Metro Station"
            onChange={(e) => onChange((prev) => ({ ...prev, landmark: e.target.value }))}
            className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
          />
        </div>

        {/* Row 5: PIN Code, City & State Dropdown */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:col-span-2 sm:grid-cols-3">
          <div>
            <label htmlFor="pincode" className="flex items-center justify-between text-xs font-medium text-pine-950">
              <span className="flex items-center gap-1">
                <span>PIN Code</span>
                <span className="text-[#b42318] font-bold" title="Required">*</span>
              </span>
              {pinLoading && (
                <span className="text-[10px] font-semibold text-pine-800 animate-pulse">
                  Finding…
                </span>
              )}
            </label>
            <input
              id="pincode"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={value.pincode || ""}
              placeholder="e.g. 560001"
              autoComplete="postal-code"
              onChange={(e) => onChange((prev) => ({ ...prev, pincode: e.target.value }))}
              className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3 sm:px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
            />
          </div>

          <div>
            <label htmlFor="city" className="flex items-center gap-1 text-xs font-medium text-pine-950">
              <span>City / District</span>
              <span className="text-[#b42318] font-bold" title="Required">*</span>
            </label>
            <input
              id="city"
              type="text"
              required
              value={value.city || ""}
              placeholder="City / District"
              autoComplete="address-level2"
              onChange={(e) => onChange((prev) => ({ ...prev, city: e.target.value }))}
              className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3 sm:px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="state" className="flex items-center justify-between text-xs font-medium text-pine-950">
              <span className="flex items-center gap-1">
                <span>State</span>
                <span className="text-[#b42318] font-bold" title="Required">*</span>
              </span>
              <span className="text-[10px] text-muted font-normal">Select or Auto</span>
            </label>
            <div className="relative mt-1.5">
              <select
                id="state"
                required
                value={value.state || ""}
                onChange={(e) => onChange((prev) => ({ ...prev, state: e.target.value }))}
                className="block w-full appearance-none rounded-md border border-pine-950/20 bg-white pl-3.5 pr-10 py-2.5 font-inter text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:ring-1 focus:ring-pine-900 cursor-pointer"
              >
                <option value="" disabled>Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
                {value.state && !INDIAN_STATES.includes(value.state) && (
                  <option value={value.state}>{value.state}</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-pine-900">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Unified Action Footer (Integrated directly inside the same card) */}
      {onContinue && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 border-t border-pine-950/10 pt-6">
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-semibold text-pine-950">
              Ready for Payment?
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Proceed to choose Cash on Delivery or Secure Online Payment.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-tomato px-7 py-3.5 font-inter text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-tomato-hover shrink-0 active:scale-[0.98] w-full sm:w-auto"
          >
            <span>Continue to Payment</span>
            <span aria-hidden="true" className="text-sm font-bold">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
