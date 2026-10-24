/**
 * Shared client-side reads (spec §12).
 *
 * The header, footer and several homepage sections each independently fetched
 * the SAME public reference data (/api/marketing-collections, category lists).
 * The apiGet in-flight coalescer only merges calls happening at the exact same
 * moment, so once components mounted at different times the data was refetched
 * per component. This module memoizes those reads with a short TTL and shares a
 * single in-flight promise, cutting redundant public GETs across the layout.
 *
 * IMPORTANT: this is for PUBLIC, non-identity-scoped reads only. Anything that
 * varies by auth/header semantics must NOT be cached here (the request would be
 * reused across identities) — those keep calling apiGet directly.
 */
import { apiGet } from "@/lib/api"

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes — reference data changes rarely

interface CacheEntry<T> {
    value: T
    at: number
    inflight?: Promise<T>
}

// Separate Map per sensitivity bucket so a caller can purge just what it needs.
const cache = new Map<string, CacheEntry<any>>()

async function sharedRead<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = DEFAULT_TTL_MS
): Promise<T> {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < ttlMs) return hit.value
    // Reuse an identical in-flight request rather than firing a parallel one.
    if (hit?.inflight) return hit.inflight

    const inflight = fetcher()
        .then((value) => {
            cache.set(key, { value, at: Date.now() })
            return value
        })
        .catch((err) => {
            // Failure must NOT be cached — drop the entry so the next caller retries.
            cache.delete(key)
            throw err
        })

    cache.set(key, { value: hit?.value, at: hit?.at ?? 0, inflight })
    return inflight
}

export async function getMarketingCollections(): Promise<any[]> {
    return sharedRead("marketing-collections", async () => {
        const response = await apiGet("/api/marketing-collections")
        if (response.success && Array.isArray(response.data)) {
            return response.data.filter((col: any) => col.key !== "none")
        }
        return []
    })
}

export async function getAllCategories(): Promise<any[]> {
    return sharedRead("all-categories", async () => {
        const response = await apiGet("/api/category/allcategory")
        return Array.isArray(response.categories) ? response.categories : []
    })
}

/** Drop cached shared reads (e.g. after an admin mutation that changes them). */
export function invalidateSharedRead(key?: string): void {
    if (key) cache.delete(key)
    else cache.clear()
}
