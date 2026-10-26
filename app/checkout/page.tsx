"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { CheckoutProductMedia } from "@/components/common/checkout-product-media"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { apiPost, ApiError } from "@/lib/api"
import {
  attemptScope,
  payloadFingerprint,
  loadAttempt,
  saveAttempt,
  patchAttempt,
  clearAttempt,
  resolveAttempt,
} from "@/lib/checkout-attempt"
import { Check, CreditCard, Truck, ShieldCheck, ArrowLeft, Tag, X, ChevronDown, Search, Loader2 } from "lucide-react"

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, totalPrice, removePurchasedItems, isHydrated, flushCart, reconcileCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [stateSearch, setStateSearch] = useState("")
  const stateDropdownRef = useRef<HTMLDivElement>(null)

  const indianStates = [
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CG", label: "Chhattisgarh" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HR", label: "Haryana" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "JH", label: "Jharkhand" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MH", label: "Maharashtra" },
    { value: "MN", label: "Manipur" },
    { value: "ML", label: "Meghalaya" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OD", label: "Odisha" },
    { value: "PB", label: "Punjab" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TS", label: "Telangana" },
    { value: "TR", label: "Tripura" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "UK", label: "Uttarakhand" },
    { value: "WB", label: "West Bengal" },
  ]

  const unionTerritories = [
    { value: "AN", label: "Andaman & Nicobar Islands" },
    { value: "CH", label: "Chandigarh" },
    { value: "DN", label: "Dadra & Nagar Haveli and Daman & Diu" },
    { value: "DL", label: "Delhi" },
    { value: "JK", label: "Jammu & Kashmir" },
    { value: "LA", label: "Ladakh" },
    { value: "LD", label: "Lakshadweep" },
    { value: "PY", label: "Puducherry" },
  ]

  const [orderPlaced, setOrderPlaced] = useState(false)

  // Scroll to top automatically when order is successfully placed
  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [orderPlaced])

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "card"
  })

  const [isFetchingPincode, setIsFetchingPincode] = useState(false)

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (formData.pincode.length === 6) {
        setIsFetchingPincode(true)
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
          const data = await response.json()
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0]
            const fetchedState = postOffice.State
            const fetchedCity = postOffice.District || postOffice.Block
            
            const allStates = [...indianStates, ...unionTerritories]
            const stateMatch = allStates.find(s => s.label.toLowerCase() === fetchedState.toLowerCase())
            
            setFormData(prev => ({
              ...prev,
              city: fetchedCity || prev.city,
              state: stateMatch ? stateMatch.value : prev.state
            }))
            
            setFormErrors(prev => ({ ...prev, city: '', state: '', pincode: '' }))
          } else {
             setFormErrors(prev => ({ ...prev, pincode: 'Invalid PIN code' }))
          }
        } catch (error) {
          console.error("Error fetching pincode details", error)
        } finally {
          setIsFetchingPincode(false)
        }
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchPincodeDetails()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.pincode])

  const filteredStates = indianStates.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
  const filteredUTs = unionTerritories.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
  const selectedStateLabel = [...indianStates, ...unionTerritories].find(s => s.value === formData.state)?.label

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setStateDropdownOpen(false)
        setStateSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const shipping = totalPrice >= 999 ? 0 : 199

  // Calculate discount using backend supplied amount
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = totalPrice + shipping - discount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Allow only digits for pincode and phone
    if (name === 'pincode') {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setFormData({ ...formData, [name]: digits })
      if (formErrors.pincode) setFormErrors(prev => ({ ...prev, pincode: '' }))
      return
    }
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      setFormData({ ...formData, [name]: digits })
      if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }))
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const [formErrors, setFormErrors] = useState<{ email: string; firstName: string; lastName: string; address: string; city: string; pincode: string; phone: string; state: string }>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    state: '',
  })

  const validateAndContinue = () => {
    const errors = { email: '', firstName: '', lastName: '', address: '', city: '', pincode: '', phone: '', state: '' }
    let hasError = false

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
      hasError = true
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
      hasError = true
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required'
      hasError = true
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required'
      hasError = true
    }

    if (!formData.state) {
      errors.state = 'Please select a state'
      hasError = true
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      errors.pincode = 'Enter a valid 6-digit PIN code'
      hasError = true
    }

    if (!formData.phone || formData.phone.length !== 10) {
      errors.phone = 'Enter a valid 10-digit phone number'
      hasError = true
    } else if (!/^[6-9]/.test(formData.phone)) {
      errors.phone = 'Phone number must start with 6, 7, 8 or 9'
      hasError = true
    }

    setFormErrors(errors)
    if (!hasError) {
      setStep(2)
    }
  }

  const handleApplyCoupon = async () => {
    setCouponError("")

    if (!isAuthenticated) {
      setCouponError("Coupons are only available for signed-in accounts. Please log in to apply coupons.")
      return
    }

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setApplyingCoupon(true)
    try {
      const { apiPost } = await import("@/lib/api")
      const result = await apiPost('/api/coupon/apply', {
        code: couponCode,
        subtotal: totalPrice
      })

      if (result.success && result.coupon) {
        setAppliedCoupon({
          code: result.coupon.code,
          discountAmount: result.coupon.discountAmount
        })
        setCouponCode("")
      }
    } catch (error: any) {
      setCouponError(error.message || "Invalid or expired coupon")
      setAppliedCoupon(null)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState("")
  const [paymentPending, setPaymentPending] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState("")

  // ---- Persisted checkout attempt (spec §5) ------------------------------
  const scope = attemptScope(user as any, isAuthenticated)
  const recoveredRef = useRef(false)
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string
    token?: string
    dbId?: string
    purchasedLines?: Array<{ productId: string; quantity: number }>
    outcome?: string
    paymentStatus?: string
    razorpayOrderId?: string
    amount?: number
    currency?: string
    key?: string
  } | null>(null)
  const [isResumingPayment, setIsResumingPayment] = useState(false)
  const [isCheckingPending, setIsCheckingPending] = useState(false)

  const finalizeSuccess = (orderId: string, purchased?: Array<{ productId: string; quantity: number }>) => {
    const linesToSettle = purchased || pendingOrder?.purchasedLines || loadAttempt(scope)?.purchasedLines
    clearAttempt(scope)
    setPendingOrder(null)
    if (linesToSettle) removePurchasedItems(linesToSettle)
    setPlacedOrderId(orderId)
    setOrderPlaced(true)
  }

  const showPending = (o: {
    orderId: string
    token?: string
    dbId?: string
    purchasedLines?: Array<{ productId: string; quantity: number }>
    outcome?: string
    paymentStatus?: string
    razorpayOrderId?: string
    amount?: number
    currency?: string
    key?: string
  }) => {
    setPendingOrderId(o.orderId)
    setPendingOrder(o)
    setPaymentPending(true)
  }

  // Centralized terminal transition: safely exits pending screen, clears attempt when definitive, resets spinners
  const transitionToTerminal = (message?: string, options?: { clearAttemptData?: boolean }) => {
    const shouldClear = options?.clearAttemptData !== false
    if (shouldClear) {
      clearAttempt(scope)
    }
    setPendingOrder(null)
    setPendingOrderId("")
    setPaymentPending(false)
    setIsPlacingOrder(false)
    setIsResumingPayment(false)
    setIsCheckingPending(false)
    if (message) {
      toast.error(message)
    }
  }

  // Centralized held transition: displays holding explanation, keeps recovery state
  const transitionToHeld = (message?: string, orderDetails?: any) => {
    setIsPlacingOrder(false)
    setIsResumingPayment(false)
    setIsCheckingPending(false)
    patchAttempt(scope, { phase: "pending_recovery", outcome: "held" })
    if (orderDetails) {
      showPending({
        orderId: orderDetails.orderId,
        token: orderDetails.token || orderDetails.checkoutToken,
        dbId: orderDetails.dbId || orderDetails._id,
        purchasedLines: orderDetails.purchasedLines,
        outcome: "held",
        paymentStatus: orderDetails.paymentStatus,
      })
    }
    toast.warning(message || "Your order is currently held for review by the store.")
  }

  // Centralized verification pending transition: keeps attempt, shows status
  const transitionToVerificationPending = (message?: string) => {
    setIsPlacingOrder(false)
    setIsResumingPayment(false)
    setIsCheckingPending(false)
    patchAttempt(scope, { phase: "awaiting_verify" })
    toast.info(message || "Payment confirmation is in flight. Please re-check in a moment.")
  }

  const handleStartNewCheckout = () => {
    transitionToTerminal("Previous attempt reset. You can now adjust your cart or details and place a fresh order.")
  }

  // One-shot reload recovery: settle an attempt whose outcome was interrupted.
  useEffect(() => {
    if (recoveredRef.current || !isHydrated) return
    recoveredRef.current = true
    const a = loadAttempt(scope)
    if (!a) return
    if (a.phase === "confirmed") { clearAttempt(scope); return }
    if (!a.orderId) return
    const aToken = a.checkoutToken || a.recoverySecret
    if (a.phase === "pending_recovery") {
      showPending({
        orderId: a.orderId,
        token: aToken,
        dbId: a.orderDbId,
        purchasedLines: a.purchasedLines,
        outcome: a.outcome || "pending_recovery",
        paymentStatus: a.paymentStatus,
        razorpayOrderId: a.razorpayOrderId,
        amount: a.amount,
        currency: a.currency,
        key: a.keyId,
      })
      return
    }
    if (a.phase === "awaiting_verify" && a.paymentStatus !== "paid") {
      ;(async () => {
        try {
          const d = await apiPost("/api/order/verify-payment", { orderId: a.orderId, checkoutToken: aToken })
          if (d?.outcome === "paid" || d?.status === "paid") {
            finalizeSuccess(a.orderId!, a.purchasedLines)
          } else if (d?.outcome === "terminal" || d?.status === "failed") {
            transitionToTerminal(d?.message || "Your previous order attempt expired or was cancelled.")
          } else if (d?.outcome === "held") {
            transitionToHeld(d?.message, { orderId: a.orderId, token: aToken, dbId: a.orderDbId, purchasedLines: a.purchasedLines })
          } else {
            showPending({
              orderId: a.orderId!,
              token: aToken,
              dbId: a.orderDbId,
              purchasedLines: a.purchasedLines,
              outcome: a.outcome || "pending_recovery",
              paymentStatus: a.paymentStatus,
              razorpayOrderId: a.razorpayOrderId,
              amount: a.amount,
              currency: a.currency,
              key: a.keyId,
            })
          }
        } catch {
          showPending({
            orderId: a.orderId!,
            token: aToken,
            dbId: a.orderDbId,
            purchasedLines: a.purchasedLines,
            outcome: a.outcome || "pending_recovery",
            paymentStatus: a.paymentStatus,
            razorpayOrderId: a.razorpayOrderId,
            amount: a.amount,
            currency: a.currency,
            key: a.keyId,
          })
        }
      })()
      return
    }
    // If awaiting_payment (unpaid resumable), surface on pending screen so user can resume payment
    if (a.phase === "awaiting_payment") {
      showPending({
        orderId: a.orderId,
        token: aToken,
        dbId: a.orderDbId,
        purchasedLines: a.purchasedLines,
        outcome: "awaiting_payment",
        paymentStatus: a.paymentStatus,
        razorpayOrderId: a.razorpayOrderId,
        amount: a.amount,
        currency: a.currency,
        key: a.keyId,
      })
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, scope])

  // Open the Razorpay modal for an existing or newly prepared gateway order
  const openRazorpayCheckout = async (params: {
    orderId: string
    dbId?: string
    token?: string
    razorpayOrderId: string
    amount: number
    currency: string
    key?: string
    prefill?: { name?: string; email?: string; contact?: string }
    purchasedLines?: Array<{ productId: string; quantity: number }>
  }) => {
    const res = await loadRazorpayScript()
    if (!res) {
      patchAttempt(scope, { phase: "awaiting_payment" })
      toast.error("Could not load the payment gateway. Tap 'Resume Payment' to retry.")
      return
    }

    return new Promise<void>((resolve) => {
      let settledFlow = false
      const settle = () => { if (!settledFlow) { settledFlow = true; resolve() } }

      const finalize = (verifyData: any) => {
        if (verifyData?.status === "paid") {
          finalizeSuccess(params.orderId, params.purchasedLines)
          patchAttempt(scope, { phase: "confirmed", paymentStatus: "paid" })
        } else if (verifyData?.status === "pending") {
          patchAttempt(scope, { phase: "pending_recovery", paymentStatus: "pending" })
          showPending({
            orderId: params.orderId,
            token: params.token,
            dbId: params.dbId,
            purchasedLines: params.purchasedLines,
            outcome: "pending_recovery",
            paymentStatus: "pending",
            razorpayOrderId: params.razorpayOrderId,
            amount: params.amount,
            currency: params.currency,
            key: params.key,
          })
          toast.warning(verifyData.message || "Payment is being confirmed — you can safely re-check in a moment.")
        } else {
          patchAttempt(scope, { phase: "awaiting_payment", paymentStatus: verifyData?.status })
          toast.error(verifyData?.message || "Payment verification failed.")
        }
      }

      const verify = async (response: any) => {
        try {
          setIsPlacingOrder(true)
          patchAttempt(scope, { phase: "awaiting_verify" })
          const body: any = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: params.orderId,
          }
          const tokenNow = params.token || loadAttempt(scope)?.checkoutToken || loadAttempt(scope)?.recoverySecret
          if (tokenNow) body.checkoutToken = tokenNow
          const verifyData = await apiPost('/api/order/verify-payment', body)
          finalize(verifyData)
        } catch (verifyErr: any) {
          if (verifyErr instanceof ApiError && verifyErr.status >= 500) {
            patchAttempt(scope, { phase: "pending_recovery" })
            showPending({
              orderId: params.orderId,
              token: params.token,
              dbId: params.dbId,
              purchasedLines: params.purchasedLines,
              outcome: "pending_recovery",
            })
            toast.warning("Payment confirmation is delayed — your order is safe and will reconcile automatically.")
          } else if (!(verifyErr instanceof ApiError) || verifyErr.status === 408 || verifyErr.status >= 500) {
            patchAttempt(scope, { phase: "pending_recovery" })
            showPending({
              orderId: params.orderId,
              token: params.token,
              dbId: params.dbId,
              purchasedLines: params.purchasedLines,
              outcome: "pending_recovery",
            })
            toast.warning("Could not confirm the payment just now — it will be reconciled automatically if money was deducted.")
          } else {
            toast.error(verifyErr.message || "Could not verify payment. If money was deducted it will be confirmed automatically.")
          }
        }
      }

      const options = {
        key: params.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: params.amount,
        currency: params.currency,
        name: "Handloomer",
        description: "Order Payment",
        order_id: params.razorpayOrderId,
        handler: async function (response: any) {
          await verify(response)
          setIsPlacingOrder(false)
          setIsResumingPayment(false)
          settle()
        },
        prefill: {
          name: params.prefill?.name || `${formData.firstName} ${formData.lastName}`.trim(),
          email: params.prefill?.email || formData.email,
          contact: params.prefill?.contact || formData.phone,
        },
        theme: {
          color: "#0f172a"
        },
        modal: {
          ondismiss: function() {
            setIsPlacingOrder(false)
            setIsResumingPayment(false)
            patchAttempt(scope, { phase: "awaiting_payment" })
            toast.info("Payment window closed. Tap 'Resume Payment' whenever you are ready to complete your purchase.")
            settle()
          }
        }
      }

      const RZP = (window as any).Razorpay
      if (!RZP) {
        patchAttempt(scope, { phase: "pending_recovery" })
        showPending({
          orderId: params.orderId,
          token: params.token,
          dbId: params.dbId,
          purchasedLines: params.purchasedLines,
          outcome: "pending_recovery",
        })
        toast.warning("Payment gateway is unavailable — your order is safe. Re-check payment when ready.")
        setIsPlacingOrder(false)
        setIsResumingPayment(false)
        settle()
        return
      }
      const paymentObject = new RZP(options)
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(response.error?.description || "Payment did not complete. You can retry, or it will be reconciled automatically.")
        setIsPlacingOrder(false)
        setIsResumingPayment(false)
        settle()
      })
      paymentObject.open()
    })
  }

  // Authoritatively resume payment for an existing unpaid attempt
  const resumePendingPayment = async () => {
    if (isResumingPayment || isCheckingPending || isPlacingOrder) return
    const a = loadAttempt(scope)
    const orderId = pendingOrder?.orderId || a?.orderId
    const token = pendingOrder?.token || a?.checkoutToken || a?.recoverySecret
    if (!orderId && !a?.key) {
      toast.error("No pending order or checkout attempt found to resume.")
      return
    }

    setIsResumingPayment(true)
    try {
      // 1. Authoritative check: if an order exists, query backend for authoritative eligibility
      if (orderId) {
        const d = await apiPost("/api/order/verify-payment", { orderId, checkoutToken: token })
        if (d?.outcome === "paid" || d?.status === "paid") {
          toast.success("Payment already confirmed!")
          finalizeSuccess(orderId, pendingOrder?.purchasedLines || a?.purchasedLines)
          return
        }

        if (d?.outcome === "terminal") {
          transitionToTerminal(d?.message || "Order has expired or was cancelled.")
          return
        }

        if (d?.outcome === "held") {
          transitionToHeld(d?.message, { orderId, token, purchasedLines: pendingOrder?.purchasedLines || a?.purchasedLines })
          return
        }

        if (d?.outcome === "verification_pending") {
          transitionToVerificationPending(d?.message)
          return
        }

        if (d?.outcome === "preparing") {
          toast.info(d?.message || "Payment gateway is preparing your order. Retrying in a moment...")
          patchAttempt(scope, { phase: "placing" })
          setTimeout(() => {
            resumePendingPayment()
          }, 2000)
          return
        }

        // ONLY when backend explicitly returns outcome === "payable"
        if (d?.outcome === "payable" && d?.razorpayOrderId && d?.amount) {
          patchAttempt(scope, {
            phase: "awaiting_payment",
            razorpayOrderId: d.razorpayOrderId,
            amount: d.amount,
            currency: d.currency || "INR",
            keyId: d.key,
          })
          await openRazorpayCheckout({
            orderId,
            dbId: pendingOrder?.dbId || a?.orderDbId,
            token,
            razorpayOrderId: d.razorpayOrderId,
            amount: d.amount,
            currency: d.currency || "INR",
            key: d.key,
            prefill: a?.prefill || {
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              contact: formData.phone,
            },
            purchasedLines: pendingOrder?.purchasedLines || a?.purchasedLines,
          })
          return
        }
      }

      // 2. If no orderId exists yet or gateway initialization needs replaying:
      // Strictly verify cart synchronization first
      const flushResult = await flushCart()
      if (!flushResult.success) {
        toast.error("Cart synchronization failed: " + (flushResult.error || "Please resolve cart issues before proceeding."))
        return
      }

      // 3. Replay with canonical immutable order data
      const orderData = a?.canonicalOrderData
      if (!orderData) {
        transitionToTerminal("Original checkout attempt data is missing. Please start a new checkout.")
        return
      }

      const replayRes = await apiPost('/api/order', orderData)
      if (replayRes?.success && replayRes?.order) {
        const o = replayRes.order
        const purchasedLines = a?.purchasedLines || []
        if (o.outcome === 'paid_settled' || o.paymentStatus === 'paid') {
          finalizeSuccess(o.orderId, purchasedLines)
          return
        }
        if (o.requiresPayment && o.razorpayOrderId && o.amount) {
          patchAttempt(scope, {
            phase: "awaiting_payment",
            orderId: o.orderId,
            orderDbId: o._id,
            checkoutToken: o.checkoutToken || token,
            razorpayOrderId: o.razorpayOrderId,
            amount: o.amount,
            currency: o.currency || "INR",
            keyId: o.key,
          })
          await openRazorpayCheckout({
            orderId: o.orderId,
            dbId: o._id,
            token: o.checkoutToken || token,
            razorpayOrderId: o.razorpayOrderId,
            amount: o.amount,
            currency: o.currency || "INR",
            key: o.key,
            purchasedLines,
          })
          return
        }
      } else {
        toast.error(replayRes?.message || "Failed to resume order creation.")
      }
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403 || err.status === 409)) {
        transitionToTerminal(err.message || "This checkout attempt is no longer valid. Please start a fresh checkout.")
      } else {
        toast.error(err.message || "Could not resume payment. Please try again.")
      }
    } finally {
      setIsResumingPayment(false)
    }
  }

  // Manual "Re-check payment" from the pending screen
  const recheckPending = async () => {
    if (isCheckingPending || isResumingPayment) return
    if (!pendingOrder) return
    setIsCheckingPending(true)
    try {
      const d = await apiPost("/api/order/verify-payment", { orderId: pendingOrder.orderId, checkoutToken: pendingOrder.token })
      if (d?.outcome === "paid" || d?.status === "paid") {
        toast.success("Payment confirmed!")
        finalizeSuccess(pendingOrder.orderId, pendingOrder.purchasedLines)
        return
      }
      if (d?.outcome === "terminal") {
        transitionToTerminal(d?.message || "This order has expired or was cancelled.")
        return
      }
      if (d?.outcome === "held") {
        transitionToHeld(d?.message, pendingOrder)
        return
      }
      if (d?.outcome === "verification_pending") {
        transitionToVerificationPending(d?.message)
        return
      }
      if (d?.outcome === "preparing") {
        toast.info(d?.message || "Payment gateway is preparing your order. Please retry in a moment.")
        return
      }
      toast.message(d?.message || "Still confirming — if money was deducted it will be reconciled automatically.")
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403 || err.status === 409)) {
        transitionToTerminal("This checkout attempt can no longer be recovered.")
        return
      }
      toast.message("Could not reach the server — please try again in a moment.")
    } finally {
      setIsCheckingPending(false)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPlacingOrder) return
    setIsPlacingOrder(true)

    // Await mutation queue flush to obtain a consistent snapshot
    let flushResult = await flushCart()
    if (!flushResult.success) {
      const initialItems = [...items]
      const reconciled = await reconcileCart()
      if (reconciled) {
        flushResult = await flushCart()
        const newItems = flushResult.items || []
        const changed =
          newItems.length !== initialItems.length ||
          newItems.some((ni) => {
            const oi = initialItems.find((i) => i.product.id === ni.product.id)
            return !oi || oi.quantity !== ni.quantity
          })
        if (changed) {
          toast.info("Your cart was updated to match the saved server cart. Please review your order before placing it.")
          setIsPlacingOrder(false)
          return
        }
      }
    }
    if (!flushResult.success) {
      toast.error("Could not sync your cart with the server. Please check your connection and try again.")
      setIsPlacingOrder(false)
      return
    }

    const snapshotItems = flushResult.items
    if (!snapshotItems || snapshotItems.length === 0) {
      toast.error("Your cart is empty. Please add items to checkout.")
      setIsPlacingOrder(false)
      return
    }

    // Build BOTH purchasedLines and orderItems from the same accepted snapshot
    const purchasedLines = snapshotItems.map((i) => ({ productId: i.product.id, quantity: i.quantity }))

    try {
      const orderItems = snapshotItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        sku: item.product.sku || "",
      }))
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      }
      const couponCode = appliedCoupon?.code || ""

      // Same scope + same canonical payload ⇒ the SAME persisted key; any
      // change (address/coupon/method/cart) starts a fresh attempt.
      const fingerprint = payloadFingerprint({ items: purchasedLines, shippingAddress, paymentMethod: formData.paymentMethod, couponCode })
      let { attempt } = resolveAttempt(scope, fingerprint)

      const orderData = {
        items: orderItems,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        couponCode,
        discount,
        checkoutKey: attempt.key,
        checkoutRecoverySecret: attempt.recoverySecret,
      }
      patchAttempt(scope, { canonicalOrderData: orderData, purchasedLines })

      let data: any
      try {
        data = await apiPost('/api/order', orderData)
      } catch (placeErr: any) {
        const code = placeErr instanceof ApiError ? placeErr.data?.code : undefined
        const status = placeErr instanceof ApiError ? placeErr.status : undefined
        // DEFINITIVE conflict for THIS key (changed payload / expired attempt):
        // start a fresh attempt and retry exactly once — replace active attempt reference!
        if (code === 'CHECKOUT_CONFLICT' || code === 'CHECKOUT_ATTEMPT_FAILED') {
          clearAttempt(scope)
          const retry = resolveAttempt(scope, fingerprint)
          attempt = retry.attempt
          const retryOrderData = {
            ...orderData,
            checkoutKey: attempt.key,
            checkoutRecoverySecret: attempt.recoverySecret,
          }
          // TASK 3: Persist canonical payload BEFORE sending the retry request
          patchAttempt(scope, { canonicalOrderData: retryOrderData, purchasedLines })
          try {
            data = await apiPost('/api/order', retryOrderData)
          } catch (retryErr: any) {
            throw retryErr
          }
        } else if (
          !(placeErr instanceof ApiError) || // raw network failure — outcome unknown
          status === 408 ||
          status === 429 ||
          (typeof status === 'number' && status >= 500)
        ) {
          // UNCERTAIN execution: an order MAY already exist server-side. Keep the
          // SAME key + secret so a retry REPLAYS the attempt instead of making a
          // duplicate (this is the core lost-response fix).
          patchAttempt(scope, { phase: attempt.orderId ? 'pending_recovery' : 'placing' })
          if (attempt.orderId) {
            showPending({ orderId: attempt.orderId, token: attempt.checkoutToken || attempt.recoverySecret, dbId: attempt.orderDbId })
            toast.warning('We could not reach the server, but your order may already be placed. Use “Re-check payment” — do not place it again.')
          } else {
            toast.warning('We could not confirm your order was received. Please tap “Place Order” again — it will not create a duplicate.')
          }
          return
        } else {
          // DEFINITIVE rejection (validation / auth): no order was created, so it
          // is safe to clear the key and surface the reason.
          transitionToTerminal(placeErr.message || "Failed to place order.")
          throw placeErr
        }
      }

      if (data.success && data.order) {
        const o = data.order
        patchAttempt(scope, {
          phase: "awaiting_payment",
          orderId: o.orderId,
          orderDbId: o._id,
          checkoutToken: o.checkoutToken,
          paymentStatus: o.paymentStatus,
          outcome: o.outcome,
          purchasedLines,
        })
        const guestToken = o.checkoutToken || attempt.recoverySecret
        o.checkoutToken = guestToken

        if (o.outcome === 'paid_settled' || o.outcome === 'order_placed_cod' || o.settled || o.paymentStatus === 'paid') {
          finalizeSuccess(o.orderId, purchasedLines)
          return
        }
        if (o.outcome === 'rejected_terminal') {
          transitionToTerminal("This order can no longer be paid. Please review your cart and try again.")
          return
        }
        if (o.outcome === 'held_for_review') {
          transitionToHeld('Your order is being reviewed by the store — we will follow up shortly.', {
            orderId: o.orderId,
            token: guestToken,
            dbId: o._id,
            purchasedLines,
          })
          return
        }
        if (o.outcome === 'pending_recovery' || !o.requiresPayment) {
          if (!o.requiresPayment) {
            finalizeSuccess(o.orderId, purchasedLines)
            return
          }
          patchAttempt(scope, { phase: 'pending_recovery' })
          showPending({ orderId: o.orderId, token: guestToken, dbId: o._id, purchasedLines })
          return
        }

        patchAttempt(scope, {
          phase: "awaiting_payment",
          orderId: o.orderId,
          orderDbId: o._id,
          checkoutToken: o.checkoutToken,
          paymentStatus: o.paymentStatus,
          outcome: o.outcome,
          purchasedLines,
          razorpayOrderId: o.razorpayOrderId,
          amount: o.amount,
          currency: o.currency,
          keyId: o.key,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
        })

        await openRazorpayCheckout({
          orderId: o.orderId,
          dbId: o._id,
          token: o.checkoutToken,
          razorpayOrderId: o.razorpayOrderId,
          amount: o.amount,
          currency: o.currency || "INR",
          key: o.key,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          purchasedLines,
        })
        return
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen">
        <Header />
        <div 
          className="min-h-[80vh] flex items-center justify-center px-4 md:px-8"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="animate-pulse text-muted-foreground">Loading checkout...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (items.length === 0 && !orderPlaced && !paymentPending) {
    return (
      <main className="min-h-screen">
        <Header />
        <div 
          className="min-h-[80vh] flex items-center justify-center px-4 md:px-8"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="text-center px-4">
            <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some products to checkout</p>
            <Link href="/collections">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div 
          className="flex-1 flex items-center justify-center px-4 md:px-8 pb-16"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. We{"'"}ve sent a confirmation email to {formData.email || "your email"}.
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">#{placedOrderId || "Processing..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online (Razorpay)"}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href={`/track-order?orderId=${encodeURIComponent(placedOrderId)}&email=${encodeURIComponent(formData.email || "")}`} className="w-full sm:w-auto">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                  Track This Order
                </Button>
              </Link>
              <Link href="/collections" className="w-full sm:w-auto">
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (paymentPending) {
    const isResumable =
      pendingOrder?.outcome === "awaiting_payment" ||
      (Boolean(pendingOrder?.razorpayOrderId) && pendingOrder?.paymentStatus !== "paid")

    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div
          className="flex-1 flex items-center justify-center px-4 md:px-8 pb-16"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {isResumingPayment || isCheckingPending ? (
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              ) : (
                <CreditCard className="w-10 h-10 text-amber-600" />
              )}
            </div>
            <h1 className="font-serif text-3xl mb-4">
              {isResumable ? "Complete Your Payment" : "Confirming your payment"}
            </h1>
            <p className="text-muted-foreground mb-4">
              {isResumable
                ? "Your order has been initiated. Tap 'Resume Payment' to open the secure payment gateway and complete your order."
                : "We have received your order but are still waiting for the payment gateway to confirm it. If money was deducted, it will be reconciled automatically — there is nothing you need to do."}
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left space-y-3 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">#{pendingOrderId || "Processing..."}</span>
              </div>
              {pendingOrder?.amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">₹{(pendingOrder.amount / 100).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 justify-center items-center w-full">
              {isResumable && (
                <Button
                  className="bg-primary hover:bg-primary/90 w-full flex items-center justify-center gap-2"
                  onClick={resumePendingPayment}
                  disabled={isResumingPayment || isCheckingPending}
                >
                  {isResumingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Resume Payment
                    </>
                  )}
                </Button>
              )}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-full sm:flex-1"
                  onClick={recheckPending}
                  disabled={isCheckingPending || isResumingPayment}
                >
                  {isCheckingPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Re-check Payment"
                  )}
                </Button>
                <Link
                  href={`/track-order?orderId=${encodeURIComponent(pendingOrderId)}&email=${encodeURIComponent(formData.email || "")}`}
                  className="w-full sm:flex-1"
                >
                  <Button variant="outline" className="w-full" disabled={isCheckingPending || isResumingPayment}>
                    Check Status
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground text-xs mt-2"
                onClick={handleStartNewCheckout}
                disabled={isResumingPayment || isCheckingPending}
              >
                Cancel and Start Fresh Checkout
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}>
        <section className="pb-8 lg:pb-12 px-4 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-[1200px] mx-auto">
            {/* Back Link */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Checkout Form */}
              <div className="order-2 lg:order-1">
                <h1 className="font-serif text-3xl mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>1</span>
                    <span className="text-sm font-medium">Information</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>2</span>
                    <span className="text-sm font-medium">Payment</span>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  {step === 1 && (
                    <div className="space-y-6">
                      <p className="text-xs text-muted-foreground">Fields marked with <span className="text-red-500">*</span> are required.</p>

                      {/* Contact */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Contact Information</h2>
                        <label className="block text-xs font-medium mb-1.5">Email address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.email ? 'border-red-500' : 'border-border'}`}
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Shipping Address</h2>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1.5">First name <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                name="firstName"
                                placeholder="e.g. Riya"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.firstName ? 'border-red-500' : 'border-border'}`}
                              />
                              {formErrors.firstName && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5">Last name <span className="text-muted-foreground font-normal">(optional)</span></label>
                              <input
                                type="text"
                                name="lastName"
                                placeholder="e.g. Sharma"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.lastName ? 'border-red-500' : 'border-border'}`}
                              />
                              {formErrors.lastName && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5">Address <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="address"
                              placeholder="House no, building, street, area"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                              className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.address ? 'border-red-500' : 'border-border'}`}
                            />
                            {formErrors.address && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5">Landmark <span className="text-muted-foreground font-normal">(optional)</span></label>
                            <input
                              type="text"
                              name="landmark"
                              placeholder="Nearest landmark"
                              value={formData.landmark}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-border bg-background text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1.5">City <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.city ? 'border-red-500' : 'border-border'}`}
                              />
                              {formErrors.city && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>
                              )}
                            </div>
                            <div ref={stateDropdownRef} className="relative">
                              <label className="block text-xs font-medium mb-1.5">State <span className="text-red-500">*</span></label>
                              <button
                                type="button"
                                onClick={() => { setStateDropdownOpen(!stateDropdownOpen); setStateSearch(""); }}
                                className={`w-full px-4 py-3 border border-border bg-background text-sm text-left flex items-center justify-between gap-2 transition-colors ${stateDropdownOpen ? 'border-primary' : ''
                                  }`}
                              >
                                <span className={formData.state ? 'text-foreground' : 'text-muted-foreground'}>
                                  {selectedStateLabel || 'Select State'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${stateDropdownOpen ? 'rotate-180' : ''
                                  }`} />
                              </button>
                              {stateDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-20 max-h-[280px] flex flex-col" onWheel={(e) => e.stopPropagation()}>
                                  <div className="p-2 border-b border-border">
                                    <div className="relative">
                                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                      <input
                                        type="text"
                                        placeholder="Search state..."
                                        value={stateSearch}
                                        onChange={(e) => setStateSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 border border-border rounded focus:outline-none focus:border-primary"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <div className="overflow-y-auto overscroll-contain">
                                    {filteredStates.length > 0 && (
                                      <div>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">States</div>
                                        {filteredStates.map((state) => (
                                          <button
                                            key={state.value}
                                            type="button"
                                            onClick={() => {
                                              setFormData({ ...formData, state: state.value })
                                              setStateDropdownOpen(false)
                                              setStateSearch("")
                                            }}
                                            className={`w-full px-3 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors flex items-center justify-between ${formData.state === state.value ? 'bg-primary/5 text-primary font-medium' : ''
                                              }`}
                                          >
                                            {state.label}
                                            {formData.state === state.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {filteredUTs.length > 0 && (
                                      <div>
                                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">Union Territories</div>
                                        {filteredUTs.map((ut) => (
                                          <button
                                            key={ut.value}
                                            type="button"
                                            onClick={() => {
                                              setFormData({ ...formData, state: ut.value })
                                              setStateDropdownOpen(false)
                                              setStateSearch("")
                                            }}
                                            className={`w-full px-3 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors flex items-center justify-between ${formData.state === ut.value ? 'bg-primary/5 text-primary font-medium' : ''
                                              }`}
                                          >
                                            {ut.label}
                                            {formData.state === ut.value && <Check className="w-3.5 h-3.5 text-primary" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {filteredStates.length === 0 && filteredUTs.length === 0 && (
                                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">No results found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1.5">PIN Code <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="pincode"
                                  placeholder="6-digit PIN"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={6}
                                  value={formData.pincode}
                                  onChange={handleInputChange}
                                  onKeyDown={(e) => {
                                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                      e.preventDefault()
                                    }
                                  }}
                                  required
                                  className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.pincode ? 'border-red-500' : 'border-border'
                                    }`}
                                />
                                {isFetchingPincode && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              {formErrors.pincode && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5">Phone number <span className="text-red-500">*</span></label>
                              <input
                                type="tel"
                                name="phone"
                                placeholder="10-digit mobile number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                value={formData.phone}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault()
                                  }
                                }}
                                required
                                className={`w-full px-4 py-3 border bg-background text-sm ${formErrors.phone ? 'border-red-500' : 'border-border'
                                  }`}
                              />
                              {formErrors.phone && (
                                <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                              )}
                            </div>
                          </div>
                          {formErrors.state && (
                            <p className="text-xs text-red-500 -mt-2">{formErrors.state}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-primary hover:bg-primary/90 py-6"
                        onClick={validateAndContinue}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Coupon Code Section */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Coupon Code</h2>

                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded">
                            <div className="flex items-center gap-2">
                              <Tag className="w-5 h-5 text-primary" />
                              <span className="font-medium text-primary">{appliedCoupon.code}</span>
                              <span className="text-sm text-primary/70">
                                (₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} off)
                              </span>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-primary hover:text-primary/70 transition-colors p-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 px-4 py-3 border border-border bg-background text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                                className="px-6 py-3"
                              >
                                {applyingCoupon ? "Applying..." : "Apply"}
                              </Button>
                            </div>
                            {couponError && (
                              <p className="text-sm text-red-500">{couponError}</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Enter a promotional code to apply a discount.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h2 className="font-medium text-lg mb-4">Payment Method</h2>
                        <div className="space-y-3">
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={formData.paymentMethod === "card"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-medium">Credit / Debit Card</span>
                              <span className="text-xs text-muted-foreground mt-0.5">Powered by Razorpay Secure</span>
                            </div>
                          </label>
                          
                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="upi"
                              checked={formData.paymentMethod === "upi"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "upi" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="font-medium">UPI / NetBanking / Wallets</span>
                              <span className="text-xs text-muted-foreground mt-0.5">GPay, PhonePe, Paytm & more</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-4 p-4 border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === "cod"}
                              onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                              className="w-4 h-4 accent-primary"
                            />
                            <Truck className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-medium">Cash on Delivery</span>
                              <span className="text-xs text-muted-foreground mt-0.5">Pay when you receive your order</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 py-6 bg-transparent"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-primary hover:bg-primary/90 py-6 text-primary-foreground font-medium flex items-center justify-center gap-2"
                          disabled={isPlacingOrder}
                        >
                          {isPlacingOrder ? "Processing..." : formData.paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now with Razorpay"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-5 h-5" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-5 h-5" />
                    Free Shipping
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:pl-12 lg:border-l border-border order-1 lg:order-2">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <CheckoutProductMedia
                      key={item.product.id}
                      product={item.product}
                      quantity={item.quantity}
                    />
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary" : ""}>
                      {shipping === 0 ? "Free" : `₹${shipping}`}
                    </span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount ({appliedCoupon.code})</span>
                      <span className="text-primary">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
