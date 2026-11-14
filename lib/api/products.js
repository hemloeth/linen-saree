import { apiRequest } from "./client";

const imageURL = (img) => (typeof img === "string" ? img : img?.url);

export function normalizeProduct(item) {
  const gallery = [
    ...new Set(
      [imageURL(item.mainImage), imageURL(item.alternateImage), ...(item.galleryImages || []).map(imageURL)].filter(Boolean)
    ),
  ];
  const id = String(item._id || item.id);
  const categoryName = typeof item.category === "object" ? item.category?.name || "" : item.category || "";

  return {
    id,
    sku: item.sku || "",
    name: item.name || "Saree",
    category: categoryName,
    collection: item.productCollection || "",
    video: item.videoFile || item.videoUrl || item.video || (Array.isArray(item.videos) ? item.videos[0] : "") || "",
    videos: Array.isArray(item.videos) ? item.videos : [item.videoFile || item.videoUrl || item.video].filter(Boolean),
    price: Number(item.price || 0),
    mrp: Number(item.regularPrice || item.price || 0),
    image: gallery[0] || "/images/product-1.png",
    gallery,
    images: gallery.map((src, index) => ({
      src,
      alt: `${item.name} — image ${index + 1}`,
      label: `View ${index + 1}`,
    })),
    fabric: item.material || "",
    colour: item.color || "",
    size: item.sareeSize || "Free size",
    inStock: Number(item.stock) > 0,
    stock: Number(item.stock || 0),
    rating: Number(item.averageRating || 0),
    reviews: Number(item.numReviews || 0),
    isOnSale: Boolean(
      item.isOnSale ||
        (item.regularPrice && Number(item.regularPrice) > Number(item.price)) ||
        item.productCollection === "big-sale"
    ),
    isBestSeller: Boolean(item.isBestSeller),
    isNew: Boolean(item.isNewArrival || item.isNew || item.productCollection === "new-arrivals"),
    hasVideo: Boolean(item.videoFile || item.videoUrl || item.video || (Array.isArray(item.videos) && item.videos.length > 0)),
    description: item.shortDescription || "",
    details: [
      { label: "Fabric & Weave", content: item.material || "" },
      { label: "Care Instructions", content: item.washCare || "" },
      { label: "Shipping", content: item.dispatch || "" },
      { label: "Size & Fit", content: [item.sareeSize, item.blouseSize].filter(Boolean).join(" / ") },
    ].filter((x) => x.content),
  };
}

export async function fetchPaginatedProducts({
  page = 1,
  limit = 30,
  sortBy = "newest",
  hasVideo,
  category,
  collection,
  isOnSale,
  isBestSeller,
  fullData = false,
} = {}) {
  const query = new URLSearchParams();
  if (page) query.set("page", String(page));
  if (limit) query.set("limit", String(limit));
  if (sortBy) query.set("sortBy", String(sortBy));
  if (hasVideo !== undefined) query.set("hasVideo", String(hasVideo));
  if (category) query.set("category", String(category));
  if (collection) query.set("collection", String(collection));
  if (isOnSale !== undefined) query.set("isOnSale", String(isOnSale));
  if (isBestSeller !== undefined) query.set("isBestSeller", String(isBestSeller));
  if (fullData) query.set("fullData", "true");

  const response = await apiRequest(`/api/product/allproducts?${query.toString()}`);
  const rawProducts = response.products || [];
  return {
    products: rawProducts.map(normalizeProduct),
    pagination: response.pagination || {
      currentPage: page,
      totalPages: 1,
      totalProducts: rawProducts.length,
      limit,
    },
  };
}

export async function fetchVideoProducts(limit = 12) {
  return fetchPaginatedProducts({
    hasVideo: true,
    limit,
    sortBy: "newest",
  });
}

export async function fetchAllProducts() {
  const result = [];
  let page = 1;
  while (true) {
    const response = await apiRequest(`/api/product/allproducts?page=${page}&limit=100&fullData=true`);
    const batch = response.products || [];
    result.push(...batch.map(normalizeProduct));
    const totalPages = Number(response.pagination?.totalPages || 1);
    if (!batch.length || page >= totalPages) break;
    if (page >= 100) throw new Error("Catalog exceeds client loading limit; add server pagination.");
    page += 1;
  }
  return result;
}

export async function fetchProductById(id) {
  const response = await apiRequest(`/api/product/${encodeURIComponent(id)}`);
  const raw = response.product || response;
  return normalizeProduct(raw);
}

export async function fetchProductBySlug(slug) {
  const response = await apiRequest(`/api/product/by-slug/${encodeURIComponent(slug)}`);
  const raw = response.product || response;
  return normalizeProduct(raw);
}

const productsApi = {
  normalizeProduct,
  fetchPaginatedProducts,
  fetchVideoProducts,
  fetchAllProducts,
  fetchProductById,
  fetchProductBySlug,
};

export default productsApi;
