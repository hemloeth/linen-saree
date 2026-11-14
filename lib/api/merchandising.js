import { apiRequest } from "./client";

const safeImage = (value) => (typeof value === "string" ? value : value?.url || "");

export async function fetchMerchandising() {
  const [categoryResponse, collectionResponse] = await Promise.allSettled([
    apiRequest("/api/category/allcategory"),
    apiRequest("/api/marketing-collections"),
  ]);

  return {
    categories:
      categoryResponse.status === "fulfilled"
        ? (categoryResponse.value.categories || []).map((item) => ({
            id: String(item._id),
            name: item.name,
            slug: (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            image: safeImage(item.image),
            description: item.sortDesc || "",
          }))
        : [],
    collections:
      collectionResponse.status === "fulfilled"
        ? (collectionResponse.value.data || [])
            .filter((item) => item.key !== "none" && item.title2 !== "none")
            .map((item) => ({
              id: String(item.key || item._id),
              key: String(item.key || item._id),
              name: item.name || item.title2 || item.key,
              tagline: item.tagline || item.subtitle || item.title1 || "",
              image: safeImage(item.image),
              description: item.description || "",
            }))
        : [],
    errors: [categoryResponse, collectionResponse]
      .filter((x) => x.status === "rejected")
      .map((x) => x.reason?.message || "Unable to fetch collections"),
  };
}
