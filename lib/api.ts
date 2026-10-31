/**
 * Centralized API Client for Handloomer E-Commerce
 * 
 * Production-level API client with:
 * - Single source of truth for API base URL
 * - Automatic auth token attachment
 * - Retry logic with exponential backoff (GET requests only)
 * - Timeout support (configurable per request)
 * - Type-safe request methods
 * - Consistent error handling
 */

// Dev fallback: the backend runs plain HTTP on :5000, so always use http:// (never
// window.location.protocol, which can be https:// on tunneled/preview dev servers).
const DEV_API_PORT = process.env.NEXT_PUBLIC_API_PORT || '5000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://sareeghar.com' : (typeof window !== 'undefined' ? `http://${window.location.hostname}:${DEV_API_PORT}` : 'http://127.0.0.1:5000'));

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Custom error class for API errors
export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Admin session token stored after OTP verification. The backend adminProtect
// middleware accepts it as `Authorization: Bearer <token>` in addition to the
// HttpOnly cookie, so admin APIs keep working even if the cross-origin cookie
// is blocked or dropped by the browser.
export const ADMIN_TOKEN_KEY = 'auth_admin_token';

export type AdminSessionListener = (token: string | null) => void;

function getAdminSessionListeners(): Set<AdminSessionListener> {
    if (typeof window === 'undefined') {
        return new Set();
    }
    const win = window as any;
    if (!win.__admin_session_listeners) {
        win.__admin_session_listeners = new Set<AdminSessionListener>();
    }
    return win.__admin_session_listeners;
}

function ensureStorageListener(): void {
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (win.__admin_storage_listener_initialized) return;
    win.__admin_storage_listener_initialized = true;

    try {
        win.__last_known_admin_token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
        win.__last_known_admin_token = null;
    }

    window.addEventListener('storage', (event: StorageEvent) => {
        // If event.key is null, storage.clear() occurred
        if (event.key === ADMIN_TOKEN_KEY || event.key === null) {
            let currentToken: string | null = null;
            try {
                currentToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);
            } catch {
                currentToken = null;
            }
            if (currentToken !== win.__last_known_admin_token) {
                win.__last_known_admin_token = currentToken;
                notifyAdminSessionChange(currentToken);
            }
        }
    });
}

function notifyAdminSessionChange(newToken: string | null): void {
    const listeners = getAdminSessionListeners();
    listeners.forEach((listener) => {
        try {
            listener(newToken);
        } catch (e) {
            console.error('Error in admin session listener:', e);
        }
    });
}

export function getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setAdminToken(token: string): void {
    if (typeof window === 'undefined') return;
    const win = window as any;
    let prev: string | null = null;
    try {
        prev = window.localStorage.getItem(ADMIN_TOKEN_KEY);
        window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch (e) {
        console.error('Failed to set admin token in localStorage', e);
    }
    if (prev !== token) {
        win.__last_known_admin_token = token;
        notifyAdminSessionChange(token);
    }
}

export function clearAdminToken(): void {
    if (typeof window === 'undefined') return;
    const win = window as any;
    let prev: string | null = null;
    try {
        prev = window.localStorage.getItem(ADMIN_TOKEN_KEY);
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (e) {
        console.error('Failed to remove admin token from localStorage', e);
    }
    if (prev !== null) {
        win.__last_known_admin_token = null;
        notifyAdminSessionChange(null);
    }
}

export function subscribeAdminSession(listener: AdminSessionListener): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }
    ensureStorageListener();
    const listeners = getAdminSessionListeners();
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getAdminSessionListenerCount(): number {
    return getAdminSessionListeners().size;
}

// Build headers
function buildHeaders(customHeaders?: Record<string, string>, isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {
        // Custom header that a plain cross-origin HTML <form> cannot set. The
        // backend CSRF guard requires it on every state-changing request.
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (customHeaders) {
        Object.assign(headers, customHeaders);
    }

    return headers;
}

// Customer endpoints that must NEVER inherit the admin token
const CUSTOMER_EXCLUSION_PATTERNS = [
    /^\/api\/order\/(create|my-orders|[a-f0-9]{24}\/cancel)/,
    /^\/api\/cart(\/.*)?$/,
    /^\/api\/user(\/.*)?$/,
    /^\/api\/checkout(\/.*)?$/,
];

/**
 * Determine whether an API endpoint requires administrative authentication.
 */
export function isAdminEndpoint(endpoint: string, method = 'GET'): boolean {
    const pathname = (endpoint || '').split('?')[0].split('#')[0];
    if (CUSTOMER_EXCLUSION_PATTERNS.some((p) => p.test(pathname))) {
        return false;
    }
    if (/^\/api\/(admin(-auth)?|order\/admin)\//.test(pathname)) {
        return true;
    }
    // Admin mutations on product, category, banner, hero, coupon collections
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
        if (/^\/api\/(product|coupon|category|category-banner|celebrity-collection|festive-banner|festive-sale|hero|marketing-collections)(\/.*)?$/.test(pathname)) {
            return true;
        }
    }
    // Admin GET endpoints for coupons, category banners, hero, admin product queries
    if (/^\/api\/(coupon|category-banner\/all|hero|celebrity-collection|festive-banner|festive-sale|marketing-collections)$/.test(pathname)) {
        return true;
    }
    return false;
}

// Attach the admin Bearer token to admin-protected API calls only. Scoping by
// endpoint and method prevents the admin token from leaking into regular storefront/user
// requests, which authenticate via their own cookie session.
export function withAdminAuth(
    endpoint: string,
    headers: Record<string, string>,
    method = 'GET',
    forceAdmin = false
): Record<string, string> {
    if (CUSTOMER_EXCLUSION_PATTERNS.some((p) => p.test(endpoint))) {
        return headers;
    }

    if (forceAdmin || isAdminEndpoint(endpoint, method)) {
        const token = getAdminToken();
        if (token) return { ...headers, Authorization: `Bearer ${token}` };
    }
    return headers;
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            signal: controller.signal,
        });
        return response;
    } catch (err: any) {
        if (err.name === 'AbortError') {
            throw new ApiError('Request timed out', 408);
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to parse responses robustly (handling non-JSON responses like HTML 404/502/504 pages)
async function parseResponse(response: Response): Promise<{ data: any; isJson: boolean }> {
    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { data, isJson: true };
        } else {
            const text = await response.text();
            let message = `Request failed with status ${response.status}`;
            if (response.status === 404) {
                message = `Endpoint not found (404). Please ensure the route exists on the backend.`;
            } else if (response.status >= 500) {
                message = `Internal Server Error (${response.status}).`;
            }
            // If the response text is short and not HTML, include it
            if (text && text.length < 200 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
                message += `: ${text.trim()}`;
            }
            return {
                data: { message },
                isJson: false
            };
        }
    } catch (err) {
        return {
            data: { message: `Failed to parse server response (Status ${response.status})` },
            isJson: false
        };
    }
}

// Core request function with retry logic
async function request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    config: { timeout?: number; retries?: number; retryOnMethods?: string[] } = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const timeout = config.timeout || DEFAULT_TIMEOUT;
    const maxRetries = config.retries ?? (options.method === 'GET' || !options.method ? MAX_RETRIES : 0);

    // Ensure admin endpoints always carry the Bearer token (options.headers may
    // be a plain Record or a Headers instance from a caller).
    const adminHeaders = withAdminAuth(
        endpoint,
        options.headers && !(options.headers instanceof Headers)
            ? { ...(options.headers as Record<string, string>) }
            : {},
        options.method || 'GET',
        (config as any)?.isAdmin
    );
    if (Object.keys(adminHeaders).length > 0) {
        options = { ...options, headers: { ...(options.headers as any), ...adminHeaders } };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, options, timeout);

            // Parse response
            const { data } = await parseResponse(response);

            if (!response.ok) {
                throw new ApiError(
                    data.message || `Request failed with status ${response.status}`,
                    response.status,
                    data
                );
            }

            return data as T;
        } catch (err: any) {
            lastError = err;

            // Don't retry on client errors (4xx) or if it's an ApiError with status < 500
            if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
                throw err;
            }

            // Retry on network errors or server errors
            if (attempt < maxRetries) {
                const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
                console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw lastError || new ApiError('Request failed after all retries', 500);
}

// ============= Public API Methods =============

// In-flight GET de-duplication. Product/category/home widgets often fire the
// same read several times in one render pass (StrictMode, overlapping contexts,
// fast navigation). Coalescing identical concurrent GETs onto ONE network call
// cuts redundant requests without changing semantics — the map entry is cleared
// as soon as the promise settles, so genuinely sequential refetches still hit
// the server. Mutations are intentionally NOT deduped.
//
// Dedup is keyed by REQUEST SEMANTICS, not just the URL: two GETs are only
// merged when they would return the SAME data. The key therefore includes the
// current auth scope (so an authenticated read is never served to a different
// account), the cache policy, and any caller-supplied non-sensitive headers.
// Requests that carry sensitive headers are never deduped.
const inflightGets = new Map<string, Promise<any>>();

// Auth scope for dedup isolation. Set by the auth layer on login/logout/account
// change; changing it drops every in-flight GET so a prior account's response
// can never satisfy a different account's request. It is a NON-secret label
// (e.g. the user id or "anon") — never a token.
let dedupeAuthScope = 'anon';

/** Set the identity scope used to isolate in-flight GET de-duplication. */
export function setApiDedupeScope(scope: string): void {
    const next = scope || 'anon';
    if (next === dedupeAuthScope) return;
    dedupeAuthScope = next;
    // Drop all in-flight reads so none crosses the account boundary.
    inflightGets.clear();
}

// Header names whose values must never enter a cache/dedup key or be shared.
const SENSITIVE_HEADER_RE = /^(authorization|x-access-token|cookie|x-api-key|apikey)$/i;

/**
 * Build a dedup key from request semantics, or null when the request must not
 * be deduped (sensitive headers present, or cache explicitly dynamic/no-store).
 */
export function buildDedupeKey(
    endpoint: string,
    config?: { timeout?: number; headers?: Record<string, string>; cache?: RequestCache }
): string | null {
    // Admin endpoints are Bearer-authenticated per session; never share their
    // in-flight results with a request that may carry a different (or no) token.
    if (isAdminEndpoint(endpoint, 'GET')) return null;
    const headers = config?.headers;
    if (headers) {
        for (const name of Object.keys(headers)) {
            if (SENSITIVE_HEADER_RE.test(name)) return null; // never share
        }
    }
    // Only dedupe cacheable reads; a fresh/dynamic read expects its own call.
    const cache = config?.cache;
    if (cache === 'no-store' || cache === 'reload' || cache === 'no-cache') return null;

    const headerSig = headers
        ? Object.keys(headers).sort().map((k) => `${k.toLowerCase()}:${headers[k]}`).join(';')
        : '';
    return `${dedupeAuthScope}|${endpoint}|${cache ?? 'default'}|${headerSig}|${config?.timeout ?? ''}`;
}

/**
 * GET request
 */
export async function apiGet<T = any>(
    endpoint: string,
    config?: { timeout?: number; headers?: Record<string, string>; cache?: RequestCache }
): Promise<T> {
    const key = buildDedupeKey(endpoint, config);

    if (key) {
        const existing = inflightGets.get(key);
        if (existing) return existing as Promise<T>;
    }

    const promise = request<T>(endpoint, {
        method: 'GET',
        headers: buildHeaders(config?.headers),
        cache: config?.cache,
    }, { timeout: config?.timeout });

    if (key) {
        inflightGets.set(key, promise);
        // Clear the entry once settled WITHOUT creating an unhandled rejection
        // child (the old `promise.finally(...)` left a dangling rejected promise
        // whenever the underlying request failed). Handling both outcomes keeps
        // the derived promise resolved, and we still return the original.
        const cleanup = () => {
            if (inflightGets.get(key) === promise) inflightGets.delete(key);
        };
        promise.then(cleanup, cleanup);
    }

    return promise;
}

/**
 * POST request with JSON body
 */
export async function apiPost<T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> {
    return request<T>(endpoint, {
        method: 'POST',
        headers: buildHeaders(config?.headers),
        body: body ? JSON.stringify(body) : undefined,
    }, { timeout: config?.timeout });
}

/**
 * PUT request with JSON body
 */
export async function apiPut<T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> {
    return request<T>(endpoint, {
        method: 'PUT',
        headers: buildHeaders(config?.headers),
        body: body ? JSON.stringify(body) : undefined,
    }, { timeout: config?.timeout });
}

/**
 * PATCH request with JSON body
 */
export async function apiPatch<T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> {
    return request<T>(endpoint, {
        method: 'PATCH',
        headers: buildHeaders(config?.headers),
        body: body ? JSON.stringify(body) : undefined,
    }, { timeout: config?.timeout });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> {
    return request<T>(endpoint, {
        method: 'DELETE',
        headers: buildHeaders(config?.headers),
        body: body ? JSON.stringify(body) : undefined,
    }, { timeout: config?.timeout });
}

/**
 * Upload request (FormData — does NOT set Content-Type, lets browser set multipart boundary)
 */
export async function apiUpload<T = any>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST',
    config?: { timeout?: number }
): Promise<T> {
    return request<T>(endpoint, {
        method,
        headers: buildHeaders(undefined, true), // isFormData = true
        body: formData,
    }, { timeout: config?.timeout || 120000 }); // 2 min timeout for uploads
}

/**
 * Server-side GET request (for Next.js server components / getServerSideProps)
 * Does NOT attach auth token or use localStorage
 */
export async function apiServerGet<T = any>(
    endpoint: string,
    config?: { timeout?: number; cache?: RequestCache; revalidate?: number }
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const timeout = config?.timeout || DEFAULT_TIMEOUT;

    const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };

    if (config?.cache) {
        fetchOptions.cache = config.cache;
    }

    if (config?.revalidate !== undefined) {
        fetchOptions.next = { revalidate: config.revalidate };
    }

    const response = await fetchWithTimeout(url, fetchOptions, timeout);
    const { data } = await parseResponse(response);

    if (!response.ok) {
        throw new ApiError(
            data.message || `Request failed with status ${response.status}`,
            response.status,
            data
        );
    }

    return data as T;
}

// Export the base URL for cases that need it directly

/**
 * Explicit Admin API Helpers
 */
export const adminApiGet = <T = any>(
    endpoint: string,
    config?: { timeout?: number; headers?: Record<string, string>; cache?: RequestCache }
): Promise<T> => apiGet<T>(endpoint, { ...config, isAdmin: true } as any);

export const adminApiPost = <T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> => apiPost<T>(endpoint, body, { ...config, isAdmin: true } as any);

export const adminApiPut = <T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> => apiPut<T>(endpoint, body, { ...config, isAdmin: true } as any);

export const adminApiPatch = <T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> => apiPatch<T>(endpoint, body, { ...config, isAdmin: true } as any);

export const adminApiDelete = <T = any>(
    endpoint: string,
    body?: any,
    config?: { timeout?: number; headers?: Record<string, string> }
): Promise<T> => apiDelete<T>(endpoint, body, { ...config, isAdmin: true } as any);

export const adminApiUpload = <T = any>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST',
    config?: { timeout?: number }
): Promise<T> => apiUpload<T>(endpoint, formData, method, { ...config, isAdmin: true } as any);

export { API_BASE_URL };
