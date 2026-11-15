import { apiRequest } from "./client";

const imageURL = (img) => (typeof img === "string" ? img : img?.url);

// In-flight request deduplication and bounded in-memory cache
const inFlightRequests = new Map();
const apiCache = new Map();
const DEFAULT_CACHE_TTL = 60 * 1000; // 60 seconds

function getCachedOrFetch(key, fetcher, ttl = DEFAULT_CACHE_TTL) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = fetcher()
    .then((data) => {
      apiCache.set(key, { data, timestamp: Date.now() });
      inFlightRequests.delete(key);
      return data;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      throw err;
    });

  inFlightRequests.set(key, promise);
  return promise;
}

export function normalizeProduct(item) {
  const gallery = [
    ...new Set(
      [imageURL(item.mainImage), imageURL(item.alternateImage), ...(item.galleryImages || []).map(imageURL)].filter(Boolean)
    ),
  ];
  const id = String(item._id || item.id);
  const categoryName = typeof item.category === "object" ? item.category?.name || "" : item.category || "";

  // Smart color determination: if color is generic like "Printed", check if tags or description mentions specific color (e.g. offwhite, black, rose pink)
  let resolvedColor = (item.color || "").trim();
  const lowerColor = resolvedColor.toLowerCase();
  if (!resolvedColor || lowerColor === "printed" || lowerColor === "multicolor" || lowerColor === "multi-color") {
    const textToScan = `${item.tags || ""} ${item.name || ""} ${item.shortDescription || ""}`.toLowerCase();
    const commonColors = [
      { key: "offwhite", label: "Off White" },
      { key: "off-white", label: "Off White" },
      { key: "off white", label: "Off White" },
      { key: "black", label: "Black" },
      { key: "white", label: "White" },
      { key: "pearl white", label: "Pearl White" },
      { key: "ivory", label: "Ivory" },
      { key: "beige", label: "Beige" },
      { key: "rose pink", label: "Rose Pink" },
      { key: "pink", label: "Pink" },
      { key: "red", label: "Red" },
      { key: "purple", label: "Purple" },
      { key: "green", label: "Green" },
      { key: "blue", label: "Blue" },
      { key: "yellow", label: "Yellow" },
      { key: "gold", label: "Golden" },
      { key: "golden", label: "Golden" },
      { key: "maroon", label: "Maroon" },
      { key: "grey", label: "Grey" },
      { key: "gray", label: "Grey" },
    ];
    const match = commonColors.find((c) => textToScan.includes(c.key));
    if (match) {
      resolvedColor = lowerColor === "printed" ? `${match.label} (Printed)` : match.label;
    }
  }

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
    colour: resolvedColor,
    rawColor: item.color || "",
    size: item.sareeSize || "Free size",
    blouseSize: item.blouseSize || "",
    sareeSize: item.sareeSize || "",
    washCare: item.washCare || "",
    dispatch: item.dispatch || "2-3 days",
    disclaimer: item.disclaimer || "Actual product color may differ slightly from the images due to lighting and display differences.",
    internationalNote: item.internationalNote || "",
    tags: item.tags || "",
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
    description: item.shortDescription || item.description || "",
    details: [
      { label: "Material & Fabric", content: item.material || "" },
      { label: "Saree Dimensions", content: item.sareeSize ? `Length: ${item.sareeSize}` : "" },
      { label: "Blouse Piece", content: item.blouseSize ? `Unstitched blouse: ${item.blouseSize}` : "" },
      { label: "Color / Pattern", content: item.color || "" },
      { label: "Wash & Care", content: item.washCare || "" },
      { label: "Shipping & Dispatch", content: item.dispatch ? `Ready for dispatch in ${item.dispatch}. Free delivery above ₹999 across India.` : "" },
      { label: "Disclaimer", content: item.disclaimer || "" },
      { label: "International Shipping", content: item.internationalNote || "" },
    ].filter((x) => x.content),
  };
}

export async function fetchPaginatedProducts({
  page = 1,
  limit = 32,
  sortBy = "newest",
  hasVideo,
  category,
  collection,
  search,
  q,
  color,
  material,
  priceMin,
  priceMax,
  inStock,
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
  const searchTerm = search || q;
  if (searchTerm) {
    query.set("search", String(searchTerm));
    query.set("q", String(searchTerm));
  }
  if (color) query.set("color", String(color));
  if (material) query.set("material", String(material));
  if (priceMin !== undefined && priceMin !== null && priceMin !== "") query.set("priceMin", String(priceMin));
  if (priceMax !== undefined && priceMax !== null && priceMax !== "") query.set("priceMax", String(priceMax));
  if (inStock !== undefined && inStock !== null && inStock !== "") query.set("inStock", String(inStock));
  if (isOnSale !== undefined) query.set("isOnSale", String(isOnSale));
  if (isBestSeller !== undefined) query.set("isBestSeller", String(isBestSeller));
  if (fullData) query.set("fullData", "true");

  const cacheKey = `paginated:${query.toString()}`;

  return getCachedOrFetch(cacheKey, async () => {
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
  });
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

export async function fetchProductRecommendations(productId, { limit = 8, cursor } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set("limit", String(limit));
  if (cursor) query.set("cursor", String(cursor));
  const cacheKey = `recommendations:${productId}:${query.toString()}`;

  return getCachedOrFetch(cacheKey, async () => {
    const response = await apiRequest(`/api/product/recommendations/${encodeURIComponent(productId)}?${query.toString()}`);
    const rawProducts = response.products || [];
    return {
      products: rawProducts.map(normalizeProduct),
      nextCursor: response.nextCursor,
      hasMore: Boolean(response.hasMore),
    };
  });
}

export async function fetchProductCardsByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  const cleanIds = ids.map(String).filter(Boolean);
  if (cleanIds.length === 0) return [];

  // Chunk in batches of 20 to conform with backend max limit per request
  const CHUNK_SIZE = 20;
  const chunks = [];
  for (let i = 0; i < cleanIds.length; i += CHUNK_SIZE) {
    chunks.push(cleanIds.slice(i, i + CHUNK_SIZE));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await apiRequest("/api/product/cards-by-ids", {
          method: "POST",
          body: JSON.stringify({ ids: chunk }),
        });
        return Array.isArray(res?.products) ? res.products.map(normalizeProduct) : [];
      } catch (err) {
        console.error("fetchProductCardsByIds chunk error:", err);
        return [];
      }
    })
  );

  return results.flat();
}

export async function fetchFilters(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", String(params.search));
  if (params.category) query.set("category", String(params.category));
  if (params.collection) query.set("collection", String(params.collection));
  if (params.isOnSale !== undefined) query.set("isOnSale", String(params.isOnSale));

  const cacheKey = `filters:${query.toString()}`;
  return getCachedOrFetch(cacheKey, async () => {
    const res = await apiRequest(`/api/product/filters?${query.toString()}`);
    return {
      colors: res.colors || [],
      materials: res.materials || [],
      categories: res.categories || [],
      counts: res.counts || { colors: {}, fabrics: {}, categories: {} },
      priceRange: res.priceRange || { min: 0, max: 10000 },
    };
  }, 120 * 1000);
}

const productsApi = {
  normalizeProduct,
  fetchPaginatedProducts,
  fetchVideoProducts,
  fetchAllProducts,
  fetchProductById,
  fetchProductBySlug,
  fetchProductRecommendations,
  fetchProductCardsByIds,
  fetchFilters,
};

export default productsApi;
