/**
 * Centralized API Client for Linen Saree E-Commerce
 * 
 * Production-level API client with:
 * - Single source of truth for API base URL
 * - Automatic auth token attachment
 * - Retry logic with exponential backoff (GET requests only)
 * - Timeout support (configurable per request)
 * - Type-safe request methods
 * - Consistent error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://linensaree.in' : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://127.0.0.1:5000'));

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

// Build headers
function buildHeaders(customHeaders?: Record<string, string>, isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (customHeaders) {
        Object.assign(headers, customHeaders);
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

/**
 * GET request
 */
export async function apiGet<T = any>(
    endpoint: string,
    config?: { timeout?: number; headers?: Record<string, string>; cache?: RequestCache }
): Promise<T> {
    return request<T>(endpoint, {
        method: 'GET',
        headers: buildHeaders(config?.headers),
        cache: config?.cache,
    }, { timeout: config?.timeout });
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
export { API_BASE_URL };
