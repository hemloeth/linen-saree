"use client";

import { useEffect, useState } from "react";

const FIELDS = [
  { key: "firstName", label: "First Name", type: "text", required: true, placeholder: "e.g. Priya", colSpan: 1 },
  { key: "lastName", label: "Last Name", type: "text", required: false, placeholder: "e.g. Sharma", colSpan: 1 },
  { key: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com", colSpan: 1 },
  { key: "phone", label: "Mobile Number", type: "tel", required: true, placeholder: "10-digit mobile number", colSpan: 1 },
  { key: "address", label: "Flat / House No., Apartment & Street", type: "text", required: true, placeholder: "House/Flat 204, Green Valley Apartments, 4th Main", colSpan: 2 },
  { key: "landmark", label: "Landmark", type: "text", required: false, placeholder: "Near Lotus Temple / Behind Metro Station", colSpan: 2 },
  { key: "pincode", label: "6-Digit PIN Code", type: "text", required: true, placeholder: "e.g. 560001", colSpan: 1 },
  { key: "city", label: "City / District", type: "text", required: true, placeholder: "Auto-fills from PIN", colSpan: 1 },
  { key: "state", label: "State", type: "text", required: true, placeholder: "Auto-fills from PIN", colSpan: 1 },
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

export default function ShippingAddressForm({ value, onChange, error }) {
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
            const state = po.State || "";
            onChange((prev) => ({
              ...prev,
              city: city || prev.city,
              state: state || prev.state,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setPinLoading(false));
    }
  }, [value.pincode, onChange]);

  return (
    <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pine-950/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-pine-950">
            Delivery Address
          </h2>
          <p className="mt-1 text-xs text-muted">
            Fields marked with an asterisk (<span className="text-[#b42318] font-bold">*</span>) are mandatory.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-pine-900">
          Step 1 of 2
        </span>
      </div>

      {/* Input Fields */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const isFull = field.colSpan === 2;
          return (
            <div key={field.key} className={isFull ? "sm:col-span-2" : ""}>
              <label htmlFor={field.key} className="flex items-center justify-between text-xs font-medium text-pine-950">
                <span className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-[#b42318] font-bold" title="Required">*</span>
                  ) : (
                    <span className="text-[10px] font-normal text-muted">(Optional)</span>
                  )}
                </span>
                {field.key === "pincode" && pinLoading && (
                  <span className="text-[10px] font-semibold text-pine-800 animate-pulse">
                    Auto-filling city &amp; state…
                  </span>
                )}
              </label>

              <input
                id={field.key}
                type={field.type}
                required={field.required}
                value={value[field.key] || ""}
                placeholder={field.placeholder}
                maxLength={field.key === "phone" ? 10 : field.key === "pincode" ? 6 : 200}
                pattern={
                  field.key === "phone"
                    ? "[6-9][0-9]{9}"
                    : field.key === "pincode"
                    ? "[0-9]{6}"
                    : undefined
                }
                autoComplete={
                  {
                    firstName: "given-name",
                    lastName: "family-name",
                    email: "email",
                    phone: "tel",
                    address: "street-address",
                    city: "address-level2",
                    state: "address-level1",
                    pincode: "postal-code",
                  }[field.key]
                }
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="mt-1.5 block w-full rounded-md border border-pine-950/20 bg-white px-3.5 py-2.5 font-inter text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
              />
            </div>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
