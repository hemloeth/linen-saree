import { apiRequest } from "./client";

export const couponApi = {
  apply: (code, subtotal) =>
    apiRequest("/api/coupon/apply", {
      method: "POST",
      body: JSON.stringify({ code: String(code).trim().toUpperCase(), subtotal: Number(subtotal) }),
    }),
};

export default couponApi;

