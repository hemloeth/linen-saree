/**
 * Centralized API client for House of Qalakari.
 * 
 * Multi-store configuration:
 * Canonical store identity is locked to 'linen'.
 * All requests forward X-Store-Id: linen as request store context.
 * Browser session cookies remain HttpOnly; tokens are never stored in localStorage.
 */

export const STORE_ID = "linen";

const REMOTE_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

// Explicitly require NEXT_PUBLIC_API_BASE_URL to consider API configured
export const apiConfigured = Boolean(REMOTE_BASE);

export function getEffectiveBaseUrl() {
  if (typeof window !== "undefined") {
    if (!REMOTE_BASE) {
      return "";
    }
    // In browser: use relative path "" which routes through Next.js rewrites proxy
    // (configured in next.config.mjs to point to the configured NEXT_PUBLIC_API_BASE_URL).
    // This completely prevents CORS preflight rejections on custom headers (X-Store-Id)
    // while forwarding store context cleanly on the server-to-server connection.
    if (process.env.NEXT_PUBLIC_USE_DIRECT_API === "true") {
      return REMOTE_BASE;
    }
    return "";
  }
  return REMOTE_BASE;
}

export async function apiRequest(path, options = {}) {
  // Prevent silently using an unconfigured or unintended backend
  if (!REMOTE_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Please define NEXT_PUBLIC_API_BASE_URL in your environment."
    );
  }

  const base = getEffectiveBaseUrl();
  const targetUrl = `${base}${path}`;

  const { headers = {}, body, ...restOptions } = options;
  const isFormData = body instanceof FormData;

  const requestHeaders = {
    "X-Requested-With": "XMLHttpRequest",
    ...headers,
    // Store identity is canonical and non-overridable by individual callers
    "X-Store-Id": STORE_ID,
  };

  if (body && !isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(targetUrl, {
      ...restOptions,
      body,
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders,
    });
  } catch (networkErr) {
    // If direct cross-origin fetch failed (e.g. CORS preflight blocked custom headers),
    // and we were using a remote base in browser, seamlessly retry via the relative Next.js proxy
    if (typeof window !== "undefined" && base && path.startsWith("/api/")) {
      try {
        response = await fetch(path, {
          ...restOptions,
          body,
          credentials: "include",
          cache: "no-store",
          headers: requestHeaders,
        });
      } catch (proxyErr) {
        throw new Error(`Unable to connect to store server (${proxyErr.message}). Please check your internet connection.`);
      }
    } else {
      throw new Error(`Unable to connect to store server (${networkErr.message}). Please check your internet connection.`);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || (Array.isArray(data.errors) ? data.errors.join(", ") : null) || `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiRequest;
