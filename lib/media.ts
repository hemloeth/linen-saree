import { API_BASE_URL } from "./api";

/**
 * Resolves a media path (image or video) to a full URL.
 * Supports:
 * - Cloudinary URLs (starts with http)
 * - Local legacy paths (starts with /uploads)
 * - Placeholder fallback
 */
export function resolveMediaUrl(path: string | null | undefined, fallback = "/placeholder.svg"): string {
    if (!path) return fallback;

    // If it's already a full URL (Cloudinary, etc.), return it
    if (path.startsWith("http")) {
        return path;
    }

    // Check if it's a frontend public asset (avoid prepending API_BASE_URL)
    const frontendAssets = ["/images", "/placeholder", "/videos", "/icon", "/apple-icon", "/linen-saree-logo"];
    if (frontendAssets.some(prefix => path.startsWith(prefix))) {
        return path;
    }

    // If it's a local legacy path, prepend the backend base URL
    if (path.startsWith("/") || path.startsWith("uploads")) {
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        return `${API_BASE_URL}${cleanPath}`;
    }

    // If it's a relative path without leading slash, usually intended for the backend
    return `${API_BASE_URL}/${path}`;
}
