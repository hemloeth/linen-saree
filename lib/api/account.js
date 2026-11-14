import { apiRequest } from "./client";

export const accountApi = {
  // Session & Authentication
  login: (payload) =>
    apiRequest("/api/user/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    apiRequest("/api/user/register", { method: "POST", body: JSON.stringify(payload) }),
  logout: () =>
    apiRequest("/api/user/logout", { method: "POST" }),
  getProfile: () =>
    apiRequest("/api/user/profile"),
  updateProfile: (payload) =>
    apiRequest("/api/user/profile", { method: "PUT", body: JSON.stringify(payload) }),

  // Password Recovery
  forgotPassword: (email) =>
    apiRequest("/api/user/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (payload) =>
    apiRequest("/api/user/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (payload) =>
    apiRequest("/api/user/reset-password", { method: "POST", body: JSON.stringify(payload) }),

  // Address Management
  addAddress: (address) =>
    apiRequest("/api/user/address", { method: "POST", body: JSON.stringify(address) }),
  updateAddress: (id, address) =>
    apiRequest(`/api/user/address/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(address) }),
  deleteAddress: (id) =>
    apiRequest(`/api/user/address/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // Wishlist
  wishlist: () =>
    apiRequest("/api/wishlist"),
  wishlistSync: (productIds) =>
    apiRequest("/api/wishlist/sync", { method: "POST", body: JSON.stringify({ productIds }) }),
  wishlistAdd: (productId) =>
    apiRequest("/api/wishlist/add", { method: "POST", body: JSON.stringify({ productId }) }),
  wishlistRemove: (productId) =>
    apiRequest(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" }),
  wishlistClear: () =>
    apiRequest("/api/wishlist/clear", { method: "DELETE" }),
};

export const wishlistIds = (data) =>
  (data?.wishlist || []).map((item) => String(item.productId?._id || item.productId?.id || item.productId || "")).filter(Boolean);

export default accountApi;
