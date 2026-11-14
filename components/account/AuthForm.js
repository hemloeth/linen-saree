"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { accountApi } from "@/lib/api/account";

export default function AuthForm() {
  const router = useRouter();
  const {
    authenticate,
    authBusy,
    user,
    logout,
    wishlist,
    refreshProfile,
    addAddress,
    deleteAddress,
    notify,
  } = useStore();

  // Mode: "login" | "register" | "forgot" | "reset"
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetState, setResetState] = useState({ otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  // Address form modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function handleAuth(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    try {
      await authenticate(
        mode,
        mode === "register" ? form : { email: form.email, password: form.password }
      );
      router.push("/account");
    } catch (reason) {
      setError(reason.message || "Unable to authenticate");
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    if (!forgotEmail) {
      setError("Please enter your registered email address");
      return;
    }
    setBusy(true);
    try {
      await accountApi.forgotPassword(forgotEmail.trim().toLowerCase());
      setInfo("A 6-digit password reset code has been sent to your email.");
      setMode("reset");
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please check your email.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    if (!resetState.otp || !resetState.newPassword) {
      setError("Please enter both the reset code and your new password");
      return;
    }
    if (resetState.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    setBusy(true);
    try {
      await accountApi.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp: resetState.otp.trim(),
        newPassword: resetState.newPassword,
      });
      setInfo("Password reset successfully! Please sign in with your new password.");
      setForm((prev) => ({ ...prev, email: forgotEmail, password: "" }));
      setMode("login");
    } catch (err) {
      setError(err.message || "Invalid or expired reset code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await accountApi.updateProfile(profileForm);
      await refreshProfile();
      setEditingProfile(false);
      notify("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await addAddress(addressForm);
      setShowAddressModal(false);
      setAddressForm({
        fullName: "",
        mobile: "",
        pincode: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
      });
      notify("Delivery address saved successfully");
    } catch (err) {
      setError(err.message || "Failed to save address");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAddress(addrId) {
    if (!confirm("Remove this address from your saved list?")) return;
    try {
      await deleteAddress(addrId);
      notify("Address removed");
    } catch (err) {
      alert(err.message || "Failed to delete address");
    }
  }

  // -------------------------------------------------------------------------
  // Logged-in Customer Dashboard
  // -------------------------------------------------------------------------
  if (user) {
    const initials = (user.name || user.email || "U")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const addresses = Array.isArray(user.address) ? user.address : [];

    return (
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:flex-row sm:p-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pine-900 font-display text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-pine-950">
                  {user.name || "Valued Customer"}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm({ name: user.name || "", phone: user.phone || "" });
                    setEditingProfile(!editingProfile);
                  }}
                  className="text-xs text-pine-900 underline hover:text-pine-700"
                >
                  {editingProfile ? "Cancel" : "Edit"}
                </button>
              </div>
              <p className="mt-0.5 font-inter text-xs text-muted">{user.email}</p>
              {user.phone && <p className="font-inter text-xs text-muted">Phone: {user.phone}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-md border border-pine-950/20 bg-linen px-4 py-2 font-inter text-xs font-semibold uppercase tracking-wider text-pine-950 transition-colors hover:bg-pine-950/10"
          >
            Sign Out
          </button>
        </div>

        {/* Edit Profile Form */}
        {editingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="font-display text-lg font-semibold text-pine-950">Edit Profile</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-pine-950">
                Full Name
                <input
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-pine-950/20 px-3 py-2 text-sm text-pine-950 focus:border-pine-900 focus:outline-none"
                />
              </label>
              <label className="block text-xs font-medium text-pine-950">
                10-Digit Mobile Number
                <input
                  required
                  pattern="[0-9]{10}"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="mt-1 block w-full rounded-md border border-pine-950/20 px-3 py-2 text-sm text-pine-950 focus:border-pine-900 focus:outline-none"
                />
              </label>
            </div>
            {error && <p className="text-xs text-red-700">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-pine-900 px-4 py-2 text-xs font-semibold text-white hover:bg-pine-950 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="rounded-md border border-pine-950/20 px-4 py-2 text-xs font-semibold text-pine-950 hover:bg-linen"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Dashboard Navigation Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/orders"
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-pine-950/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pine-900/40 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linen text-pine-900 transition-colors group-hover:bg-pine-900 group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-pine-950">My Orders</h3>
              <p className="mt-1 text-xs text-muted">View past shipments, order details, and invoices.</p>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-pine-950/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pine-900/40 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linen text-pine-900 transition-colors group-hover:bg-pine-900 group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-pine-950">
                My Wishlist ({wishlist.length})
              </h3>
              <p className="mt-1 text-xs text-muted">View your curated favorite handwoven sarees.</p>
            </div>
          </Link>

          <Link
            href="/track-order"
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-pine-950/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pine-900/40 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linen text-pine-900 transition-colors group-hover:bg-pine-900 group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-pine-950">Track Shipment</h3>
              <p className="mt-1 text-xs text-muted">Real-time parcel dispatch & courier waybill tracking.</p>
            </div>
          </Link>

          <a
            href="https://wa.me/919934752538?text=Hello%20House%20of%20Qalakari,%20I%20need%20assistance%20with%20my%20saree%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-pine-950/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pine-900/40 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linen text-pine-900 transition-colors group-hover:bg-[#25D366] group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-pine-950">WhatsApp Concierge ↗</h3>
              <p className="mt-1 text-xs text-muted">Direct assistance for bespoke styling and video drape tours.</p>
            </div>
          </a>
        </div>

        {/* Saved Delivery Addresses Section */}
        <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-pine-950">Saved Delivery Addresses</h2>
            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="text-xs font-semibold text-pine-900 underline hover:text-pine-700"
            >
              + Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="mt-4 text-xs text-muted">
              You haven&apos;t saved any addresses yet. Saved addresses make checkout faster.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="relative rounded-lg border border-pine-950/15 p-4 text-xs text-pine-950"
                >
                  <p className="font-semibold text-sm">{addr.fullName}</p>
                  <p className="mt-1 text-muted">{addr.address}</p>
                  {addr.landmark && <p className="text-muted">Landmark: {addr.landmark}</p>}
                  <p className="text-muted">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="mt-1 font-medium">Phone: {addr.mobile}</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="mt-3 text-[11px] text-red-600 underline hover:text-red-800"
                  >
                    Delete Address
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-display text-lg font-semibold text-pine-950">Add Shipping Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="text-muted hover:text-pine-950"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-pine-950">
                    Full Name *
                    <input
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs font-medium text-pine-950">
                    10-Digit Mobile *
                    <input
                      required
                      pattern="[0-9]{10}"
                      value={addressForm.mobile}
                      onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                      className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block text-xs font-medium text-pine-950">
                  Street Address & House/Flat No. *
                  <input
                    required
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                  />
                </label>

                <label className="block text-xs font-medium text-pine-950">
                  Landmark (Optional)
                  <input
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs font-medium text-pine-950">
                    PIN Code *
                    <input
                      required
                      pattern="[0-9]{6}"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs font-medium text-pine-950">
                    City *
                    <input
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs font-medium text-pine-950">
                    State *
                    <input
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="mt-1 w-full rounded border border-pine-950/20 px-3 py-2 text-xs focus:border-pine-900 focus:outline-none"
                    />
                  </label>
                </div>

                {error && <p className="text-xs text-red-700">{error}</p>}

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="rounded-md border border-pine-950/20 px-4 py-2 text-xs font-semibold text-pine-950 hover:bg-linen"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-pine-900 px-5 py-2 text-xs font-semibold text-white hover:bg-pine-950 disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Password Recovery Modes ("forgot" & "reset")
  // -------------------------------------------------------------------------
  if (mode === "forgot" || mode === "reset") {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-pine-950">
          {mode === "forgot" ? "Reset your password" : "Enter Verification Code"}
        </h1>
        <p className="mt-2 font-inter text-xs text-muted">
          {mode === "forgot"
            ? "Enter your registered email address to receive a 6-digit verification code."
            : `Enter the 6-digit code sent to ${forgotEmail} and choose a new password.`}
        </p>

        {mode === "forgot" ? (
          <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
            <label className="block text-xs font-medium text-pine-950">
              Email address
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
              />
            </label>

            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            {info && <p role="status" className="text-xs text-emerald-700">{info}</p>}

            <button
              disabled={busy}
              type="submit"
              className="w-full cursor-pointer rounded-md bg-pine-900 px-5 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 disabled:opacity-50"
            >
              {busy ? "Sending Code…" : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <label className="block text-xs font-medium text-pine-950">
              6-Digit Verification Code
              <input
                type="text"
                required
                maxLength={6}
                value={resetState.otp}
                onChange={(e) => setResetState((prev) => ({ ...prev, otp: e.target.value }))}
                placeholder="123456"
                className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
              />
            </label>

            <label className="block text-xs font-medium text-pine-950">
              New Password (minimum 8 characters)
              <input
                type="password"
                required
                minLength={8}
                value={resetState.newPassword}
                onChange={(e) => setResetState((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New strong password"
                className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
              />
            </label>

            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            {info && <p role="status" className="text-xs text-emerald-700">{info}</p>}

            <button
              disabled={busy}
              type="submit"
              className="w-full cursor-pointer rounded-md bg-pine-900 px-5 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 disabled:opacity-50"
            >
              {busy ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-between text-xs">
          <button
            type="button"
            className="cursor-pointer font-medium text-pine-900 underline hover:text-pine-700"
            onClick={() => {
              setError("");
              setInfo("");
              setMode("login");
            }}
          >
            ← Back to Sign In
          </button>
          {mode === "reset" && (
            <button
              type="button"
              className="cursor-pointer font-medium text-pine-900 underline hover:text-pine-700"
              onClick={() => {
                setError("");
                setInfo("");
                setMode("forgot");
              }}
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Login / Register Form
  // -------------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-pine-950">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h1>
      <p className="mt-2 font-inter text-xs text-muted">
        {mode === "login"
          ? "Sign in to access your orders, saved sarees, and delivery addresses."
          : "Join House of Qalakari for an artisan luxury shopping experience."}
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleAuth}>
        {mode === "register" && (
          <>
            <label className="block text-xs font-medium text-pine-950">
              Full name *
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
              />
            </label>
            <label className="block text-xs font-medium text-pine-950">
              Mobile number *
              <input
                required
                pattern="[0-9]{10}"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
              />
            </label>
          </>
        )}

        <label className="block text-xs font-medium text-pine-950">
          Email address *
          <input
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
          />
        </label>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-pine-950">
              Password *
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setInfo("");
                  setForgotEmail(form.email);
                  setMode("forgot");
                }}
                className="cursor-pointer text-[11px] font-medium text-pine-900 underline hover:text-pine-700"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <input
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            minLength={8}
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 8 characters"
            className="mt-1 block w-full rounded-md border border-pine-950/20 bg-linen/20 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
          />
        </div>

        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
        {info && <p role="status" className="text-xs text-emerald-700">{info}</p>}

        <button
          disabled={authBusy}
          type="submit"
          className="w-full cursor-pointer rounded-md bg-pine-900 px-5 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 disabled:opacity-50"
        >
          {authBusy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        type="button"
        className="mt-6 cursor-pointer text-xs font-medium text-pine-900 underline underline-offset-4 hover:text-pine-700"
        onClick={() => {
          setError("");
          setInfo("");
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
