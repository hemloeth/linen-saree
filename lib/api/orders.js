import { apiRequest } from "./client";

export const ordersApi = {
  list: (page = 1, limit = 20) =>
    apiRequest(`/api/order/my-orders?page=${page}&limit=${limit}`),
  get: (id) =>
    apiRequest(`/api/order/${encodeURIComponent(id)}`),
  createOrder: (payload) =>
    apiRequest("/api/order", { method: "POST", body: JSON.stringify(payload) }),
  createCod: (payload) =>
    apiRequest("/api/order", {
      method: "POST",
      body: JSON.stringify({ ...payload, paymentMethod: "cod" }),
    }),
  verifyPayment: (payload) =>
    apiRequest("/api/order/verify-payment", { method: "POST", body: JSON.stringify(payload) }),
  abandonCheckout: (payload) =>
    apiRequest("/api/order/abandon-checkout", { method: "POST", body: JSON.stringify(payload) }),
  claimGuestOrder: (orderId, checkoutToken) =>
    apiRequest("/api/order/claim", {
      method: "POST",
      body: JSON.stringify({ orderId, checkoutToken }),
    }),
  cancel: (id, { reason = "Customer request", details = "" } = {}) =>
    apiRequest(`/api/order/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason, details }),
    }),
  track: (id) =>
    apiRequest(`/api/order/${encodeURIComponent(id)}/track`),
  trackPublic: (payload) =>
    apiRequest("/api/order/track-public", { method: "POST", body: JSON.stringify(payload) }),
  serviceability: (pincode, cod = false) =>
    apiRequest(
      `/api/order/check-serviceability?pincode=${encodeURIComponent(pincode)}&cod=${cod ? "true" : "false"}`
    ),
};

export default ordersApi;
