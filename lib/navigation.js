/**
 * Centralized navigation configuration for House of Qalakari.
 * Restores all functional navigation destinations from the reference store
 * while preserving the new frontend's premium aesthetic.
 */

export function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const STATIC_NAV_LINKS = [
  { label: "New Arrivals", href: "/categories/new-arrivals" },
  { label: "Video Collection", href: "/video-collection" },
  { label: "Handloom", href: "/categories/handloom" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Blog", href: "/blog" },
  { label: "Sale", href: "/categories/sale", isHighlight: true },
];

export const ACCOUNT_LINKS = [
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/orders" },
  { label: "Track Order", href: "/track-order" },
  { label: "Wishlist", href: "/wishlist" },
];

export function buildCategoryLinks(categories = []) {
  const dynamic = categories.map((cat) => ({
    label: cat.name,
    href: `/categories/${cat.slug || slugify(cat.name)}`,
  }));

  return [
    { label: "All Categories", href: "/categories" },
    ...dynamic,
  ];
}

export function buildCollectionLinks(collections = []) {
  return collections
    .filter((col) => col.key !== "none" && col.name !== "none")
    .map((col) => ({
      label: col.name,
      tagline: col.tagline || "",
      href: `/collections/${encodeURIComponent(col.key || col.id)}`,
    }));
}

