import { apiRequest } from "./client";

export const cartApi = {
  get: () =>
    apiRequest("/api/cart"),
  add: (productId, quantity = 1) =>
    apiRequest("/api/cart/add", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  update: (productId, quantity) =>
    apiRequest("/api/cart/update", { method: "PUT", body: JSON.stringify({ productId, quantity }) }),
  remove: (productId) =>
    apiRequest(`/api/cart/${encodeURIComponent(productId)}`, { method: "DELETE" }),
  clear: () =>
    apiRequest("/api/cart/clear", { method: "DELETE" }),
  sync: (items) =>
    apiRequest("/api/cart/sync", { method: "POST", body: JSON.stringify({ items }) }),
};

export default cartApi;

