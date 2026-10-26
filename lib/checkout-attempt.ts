/**
 * Persisted checkout-attempt store (spec §5).
 *
 * A checkout attempt's idempotency key, canonical payload fingerprint, the
 * server order id and the one-time guest capability token must survive a
 * page reload / dropped response — React state alone loses all of it, which
 * previously forced either a "Payment ID missing" dead-end or a duplicate
 * order on retry. This module stores ONE scoped attempt in sessionStorage:
 *
 *  - Scoped by identity (`u:<userId>` or `guest`) so logging in / switching
 *    accounts can never replay or leak another shopper's attempt/token.
 *  - Fingerprinted by the canonical payload so a changed address, coupon,
 *    method or cart yields a fresh key instead of a backend 409.
 *  - Cleared the moment an attempt reaches a terminal local outcome
 *    (paid / cod accepted), and bounded by a TTL as a safety net.
 */

export type AttemptPhase =
    | "placing" // POST /api/order in flight or failed before an order id existed
    | "awaiting_payment" // order created, Razorpay popup not yet completed
    | "awaiting_verify" // popup paid, verification result not yet known
    | "confirmed" // terminal: success screen shown
    | "pending_recovery" // terminal-ish: server still confirming, safe to re-check

export interface CheckoutAttempt {
    key: string
    fingerprint: string
    phase: AttemptPhase
    // Client-held guest recovery secret — generated BEFORE the first request and
    // persisted here. Its hash becomes the server's checkout capability token, so
    // a guest can verify even if the FIRST HTTP response was lost (the raw value
    // never has to come back from the server).
    recoverySecret: string
    orderId?: string
    orderDbId?: string
    // Legacy server-issued one-time token (only set when the server generated it
    // because no client secret was supplied). Kept for backward compatibility.
    checkoutToken?: string
    outcome?: string
    paymentStatus?: string
    purchasedLines?: Array<{ productId: string; quantity: number }>
    razorpayOrderId?: string
    amount?: number
    currency?: string
    keyId?: string
    prefill?: { name?: string; email?: string; contact?: string }
    canonicalOrderData?: Record<string, any>
    updatedAt: number
}

// 24 random bytes as hex (48 chars) — within the server's 16-64 [A-Za-z0-9_-] bound.
function generateRecoverySecret(): string {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const b = new Uint8Array(24)
        crypto.getRandomValues(b)
        return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 48)
}

const STORAGE_PREFIX = "checkout-attempt:"
const ATTEMPT_TTL_MS = 6 * 60 * 60 * 1000 // 6h — longer than any reservation window

// Synchronous djb2-ish hash — the SERVER holds the authoritative sha256 of the
// canonical payload; this only detects client-side payload changes.
export function payloadFingerprint(parts: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: Record<string, string>
    paymentMethod: string
    couponCode: string
}): string {
    const canonical = JSON.stringify({
        i: parts.items
            .map((i) => [i.productId, i.quantity])
            .sort((a, b) => (a[0] < b[0] ? -1 : 1)),
        s: parts.shippingAddress,
        p: parts.paymentMethod,
        c: (parts.couponCode || "").toUpperCase(),
    })
    let h = 5381
    for (let i = 0; i < canonical.length; i++) {
        h = (h * 33) ^ canonical.charCodeAt(i)
    }
    return (h >>> 0).toString(36) + ":" + canonical.length.toString(36)
}

export function attemptScope(user: { _id?: string } | null, isAuthenticated: boolean): string {
    return isAuthenticated && user?._id ? `u:${user._id}` : "guest"
}

const storageKey = (scope: string) => `${STORAGE_PREFIX}${scope}`

export function loadAttempt(scope: string): CheckoutAttempt | null {
    if (typeof window === "undefined") return null
    try {
        const raw = sessionStorage.getItem(storageKey(scope))
        if (!raw) return null
        const parsed = JSON.parse(raw) as CheckoutAttempt
        if (!parsed?.key || !parsed?.updatedAt || Date.now() - parsed.updatedAt > ATTEMPT_TTL_MS) {
            sessionStorage.removeItem(storageKey(scope))
            return null
        }
        return parsed
    } catch {
        return null
    }
}

export function saveAttempt(scope: string, attempt: CheckoutAttempt): void {
    if (typeof window === "undefined") return
    try {
        sessionStorage.setItem(storageKey(scope), JSON.stringify({ ...attempt, updatedAt: Date.now() }))
    } catch {
        /* storage full/blocked — the in-memory copy still guards this tab */
    }
}

export function patchAttempt(scope: string, patch: Partial<CheckoutAttempt>): void {
    const current = loadAttempt(scope)
    if (!current) return
    // Never clobber a persisted field with `undefined` — a replayed response that
    // omits the token/secret used to overwrite the saved one with undefined and
    // permanently stranded guest verification. Drop undefined keys first.
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
    saveAttempt(scope, { ...current, ...clean })
}

export function clearAttempt(scope: string): void {
    if (typeof window === "undefined") return
    try {
        sessionStorage.removeItem(storageKey(scope))
    } catch {
        /* ignore */
    }
}

/**
 * Get-or-create the attempt for this exact payload. Same scope + same
 * fingerprint reuses the SAME key (idempotent retry); any payload change
 * starts a fresh attempt. Also sweeps attempts left by a DIFFERENT scope so
 * an account switch in one tab cannot expose another account's token.
 */
export function resolveAttempt(
    scope: string,
    fingerprint: string
): { attempt: CheckoutAttempt; fresh: boolean } {
    if (typeof window !== "undefined") {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i)
            if (k && k.startsWith(STORAGE_PREFIX) && k !== storageKey(scope)) {
                sessionStorage.removeItem(k)
            }
        }
    }
    const existing = loadAttempt(scope)
    if (existing && existing.fingerprint === fingerprint) {
        // Backfill a secret for any pre-existing attempt missing one, then reuse
        // the SAME key + secret so a dropped-response retry stays idempotent.
        if (!existing.recoverySecret) {
            existing.recoverySecret = generateRecoverySecret()
            saveAttempt(scope, existing)
        }
        return { attempt: existing, fresh: false }
    }
    const attempt: CheckoutAttempt = {
        key:
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID().replace(/-/g, "")
                : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`.slice(0, 32),
        recoverySecret: generateRecoverySecret(),
        fingerprint,
        phase: "placing",
        updatedAt: Date.now(),
    }
    saveAttempt(scope, attempt)
    return { attempt, fresh: true }
}
