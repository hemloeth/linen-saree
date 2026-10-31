/**
 * Production Razorpay Script Loader & Modal Controller
 *
 * Implements resilient script loading and robust lifecycle management for Razorpay Checkout:
 * 1. Concurrency-safe script loading with single in-flight promise deduplication.
 * 2. Script DOM cleanup on failure/timeout allowing genuine subsequent retries.
 * 3. SDK constructor verification (`window.Razorpay` function existence).
 * 4. Exception-safe modal initialization (constructor, event registration, open()).
 * 5. Deterministic single promise settlement across success, dismiss, script error, and SDK failure.
 * 6. UI state recovery on failure paths without orphaned operation or modal locks.
 * 7. Active session retention during `payment.failed` to support in-modal retry,
 *    with clean dismissal and unmount/account retirement.
 */

import type { PreparingRetryManager, CheckoutOperationIdentity, ModalSession } from "./preparing-retry"

let cachedScriptPromise: Promise<boolean> | null = null

export function resetScriptLoader(): void {
  cachedScriptPromise = null
}

export function isRazorpayLoaded(win: any = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? (globalThis as any).window : undefined)): boolean {
  return typeof win !== "undefined" && typeof win?.Razorpay === "function"
}

export interface RazorpayScriptOptions {
  timeoutMs?: number
  doc?: Document | any
  win?: any
  src?: string
}

export async function loadRazorpayScript(options?: RazorpayScriptOptions): Promise<boolean> {
  const win = options?.win ?? (typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? (globalThis as any).window : undefined))
  if (!win) return false
  if (isRazorpayLoaded(win)) return true

  if (cachedScriptPromise) {
    return cachedScriptPromise
  }

  const doc = options?.doc ?? win.document ?? (typeof globalThis !== "undefined" ? (globalThis as any).document : undefined)
  if (!doc) return false

  const timeoutMs = options?.timeoutMs ?? 15000
  const scriptSrc = options?.src ?? "https://checkout.razorpay.com/v1/checkout.js"

  cachedScriptPromise = new Promise<boolean>((resolve) => {
    let resolved = false
    let timer: any = null

    const finish = (success: boolean) => {
      if (resolved) return
      resolved = true
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (!success) {
        cachedScriptPromise = null
        try {
          const el = doc.getElementById("razorpay-script")
          if (el && el.parentNode) {
            el.parentNode.removeChild(el)
          }
        } catch {}
      }
      resolve(success)
    }

    timer = setTimeout(() => {
      finish(false)
    }, timeoutMs)

    const existingScript = doc.getElementById("razorpay-script") as HTMLScriptElement | null
    if (existingScript) {
      if (isRazorpayLoaded(win)) {
        finish(true)
        return
      }
      existingScript.addEventListener("load", () => finish(isRazorpayLoaded(win)), { once: true })
      existingScript.addEventListener("error", () => finish(false), { once: true })
      return
    }

    const script = doc.createElement("script")
    script.id = "razorpay-script"
    script.src = scriptSrc
    script.async = true
    script.onload = () => finish(isRazorpayLoaded(win))
    script.onerror = () => finish(false)

    try {
      const target = doc.body || doc.head || doc.documentElement
      if (!target) {
        finish(false)
      } else {
        target.appendChild(script)
      }
    } catch {
      finish(false)
    }
  })

  return cachedScriptPromise
}

export interface OpenRazorpayModalParams {
  orderId: string
  dbId?: string
  token?: string
  razorpayOrderId: string
  amount: number
  currency: string
  key?: string
  prefill?: { name?: string; email?: string; contact?: string }
  purchasedLines?: Array<{ productId: string; quantity: number }>
  parentOp?: CheckoutOperationIdentity | null
  scope: string
  retryManager: PreparingRetryManager
  onVerify: (response: any, verifyOp: CheckoutOperationIdentity) => Promise<void>
  onDismiss: () => void
  onFailure: (err: any) => void
  onErrorState: (message: string) => void
  loadScript?: () => Promise<boolean>
  getRazorpayConstructor?: () => any
}

export async function openRazorpayModal(params: OpenRazorpayModalParams): Promise<void> {
  const {
    orderId,
    dbId,
    token,
    razorpayOrderId,
    amount,
    currency,
    key,
    prefill,
    purchasedLines,
    parentOp,
    scope,
    retryManager,
    onVerify,
    onDismiss,
    onFailure,
    onErrorState,
    loadScript = loadRazorpayScript,
    getRazorpayConstructor = () => {
      const win = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? (globalThis as any).window : undefined)
      return win?.Razorpay
    },
  } = params

  let settlePromise: () => void = () => {}
  const modalCompletionPromise = new Promise<void>((resolve) => {
    settlePromise = resolve
  })

  let settled = false
  const settleOnce = () => {
    if (!settled) {
      settled = true
      settlePromise()
    }
  }

  // Step 1: Establish modal session handoff from parent operation
  let modalSession: ModalSession | null = null
  if (parentOp && retryManager.isOperationValid(parentOp)) {
    modalSession = retryManager.startModalSession(parentOp, orderId, settleOnce)
  } else if (!parentOp) {
    const tempOp = retryManager.startOperation(scope, orderId)
    if (tempOp) {
      modalSession = retryManager.startModalSession(tempOp, orderId, settleOnce)
    }
  }

  if (!modalSession) {
    // Competing modal or operation already active; reject opening second modal
    settleOnce()
    return modalCompletionPromise
  }

  // Step 2: Load Razorpay script with identity validation
  let scriptLoaded = false
  try {
    scriptLoaded = await loadScript()
  } catch {
    scriptLoaded = false
  }

  if (!retryManager.isModalSessionValid(modalSession)) {
    settleOnce()
    return modalCompletionPromise
  }

  if (!scriptLoaded) {
    // TASK 1: Clean up failure, restore UI loading states, preserve attempt/recovery
    retryManager.endModalSession(modalSession)
    onErrorState("Could not load the payment gateway. Tap 'Resume Payment' to retry.")
    settleOnce()
    return modalCompletionPromise
  }

  // Step 3: Instantiate SDK, configure options, and open modal
  let paymentObject: any = null
  try {
    const RZP = getRazorpayConstructor()
    if (typeof RZP !== "function") {
      throw new Error("Payment gateway SDK is not available.")
    }

    const options = {
      key: key || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID : "") || "",
      amount,
      currency,
      name: "Handloomer",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        if (!retryManager.isModalSessionValid(modalSession)) return
        const verifyOp = retryManager.startVerificationFromModal(modalSession!)
        if (!verifyOp) return // duplicate callback deduplicated
        try {
          await onVerify(response, verifyOp)
        } finally {
          settleOnce()
        }
      },
      prefill,
      theme: {
        color: "#0f172a",
      },
      modal: {
        ondismiss: function () {
          if (!retryManager.isModalSessionValid(modalSession)) {
            settleOnce()
            return
          }
          retryManager.endModalSession(modalSession!)
          onDismiss()
          settleOnce()
        },
      },
    }

    paymentObject = new RZP(options)
    retryManager.registerActiveModalInstance(modalSession, paymentObject)

    // Register payment.failed listener:
    // Policy A: Keep modal session active so that user can retry in the open modal or dismiss it.
    paymentObject.on("payment.failed", function (response: any) {
      if (!retryManager.isModalSessionValid(modalSession)) {
        settleOnce()
        return
      }
      onFailure(response)
    })

    paymentObject.open()
  } catch (sdkErr: any) {
    // TASK 2: Catch SDK constructor, .on(), or .open() exceptions without hanging
    retryManager.endModalSession(modalSession)
    if (paymentObject) {
      try {
        paymentObject.close?.()
      } catch {}
    }
    onErrorState(sdkErr?.message || "Could not launch payment gateway. Tap 'Resume Payment' to retry.")
    settleOnce()
    return modalCompletionPromise
  }

  return modalCompletionPromise
}

export interface CheckoutLoadingSetters {
  setIsPlacingOrder: (v: boolean) => void
  setIsResumingPayment: (v: boolean) => void
  setIsCheckingPending: (v: boolean) => void
}

/**
 * Authoritatively clears checkout loading states while guarding against obsolete callbacks
 * from superseded generations or previous account scopes.
 *
 * Does NOT require released operations to still be active in PreparingRetryManager,
 * ensuring that successful endOperation(op) can immediately and synchronously clear loading states.
 */
export function clearCheckoutLoadingStates(
  scope: string,
  retryManager: PreparingRetryManager,
  setters: CheckoutLoadingSetters,
  identity?: CheckoutOperationIdentity | ModalSession | null
): boolean {
  if (identity) {
    if ("modalId" in identity) {
      if (identity.retired) return false
      if (identity.scope !== scope) return false
      if (retryManager.isObsolete(identity.attemptId, identity.generation)) return false
    }
    if ("operationId" in identity) {
      if (identity.scope !== scope) return false
      if (retryManager.isObsolete(identity.attemptId, identity.generation)) return false
    }
  }
  setters.setIsPlacingOrder(false)
  setters.setIsResumingPayment(false)
  setters.setIsCheckingPending(false)
  return true
}

