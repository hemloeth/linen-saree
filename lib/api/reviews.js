import { apiRequest } from "./client";
export const reviewsApi = {
  list: (id) => apiRequest(`/api/review/product/${encodeURIComponent(id)}?limit=50`),
  create: (id, values) => {
    const form = new FormData();
    Object.entries(values).forEach(([key,value]) => form.append(key, String(value)));
    return apiRequest(`/api/review/product/${encodeURIComponent(id)}`, {method:"POST",body:form});
  },
};
