"use client"

import { useState, useEffect, useRef } from "react"
import { apiGet, apiPost, apiPut, getAdminToken, subscribeAdminSession } from "@/lib/api"
import { toast } from "sonner"

export interface AdminOrder {
  _id: string
  orderId: string
  createdAt: string
  user?: { name?: string; email?: string }
  shippingAddress?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    landmark?: string
    city?: string
    state?: string
    pincode?: string
  }
  pricing: {
    total: number
    subtotal?: number
    shipping?: number
    discount?: number
    couponCode?: string
  }
  status: string
  items: { name: string; quantity: number; sku?: string; price: number; image?: string }[]
  shiprocket?: { courierName?: string; awbCode?: string; trackingUrl?: string }
  payment?: { method: string; status: string; razorpayPaymentId?: string; refundedAmount?: number }
  cancellation?: { status?: string; courierOutcome?: string; reason?: string; requestedAt?: string; resolvedAt?: string }
  refund?: { status?: string; amountPaise?: number; razorpayRefundId?: string; initiatedAt?: string; verifiedAt?: string; finalized?: boolean }
  fulfillmentHold?: { active?: boolean; reason?: string }
  codAccounting?: {
    amountDuePaise?: number
    collectedAtDelivery?: boolean
    collectedAmountPaise?: number
    collectedAt?: string
    remittanceStatus?: "none" | "pending" | "remitted" | "discrepancy"
    remittedAmountPaise?: number
    remittedAt?: string
    utr?: string
    reconciledBy?: string
    discrepancyReason?: string
    notes?: string
  }
  returnInfo?: {
    status?: string
    confirmedAt?: string
    stockRestored?: boolean
  }
  reservation?: {
    state?: string
  }
}

export interface UseAdminOrdersOptions {
  initialSearch?: string
  initialStatus?: string
  debounceMs?: number
  autoFetch?: boolean
}

export function useAdminOrders(options: UseAdminOrdersOptions = {}) {
  const {
    initialSearch = "",
    initialStatus = "",
    debounceMs = 300,
    autoFetch = true,
  } = options

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchErrorStatus, setFetchErrorStatus] = useState<number | null>(null)
  const [displayedQuery, setDisplayedQuery] = useState<{ status: string; search: string; page: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Dedicated monotonic sequence ref for list search/filter/pagination ordering
  const requestSeqRef = useRef(0)
  // Dedicated session & lifecycle generation ref to invalidate stale async callbacks
  const sessionGenRef = useRef(0)
  const isMountedRef = useRef(true)
  const activeTokenRef = useRef<string | null>(getAdminToken())

  // Synchronized ref for current search/status filters so the stable session subscriber
  // always refetches using the latest committed filter values without re-subscribing.
  const currentFiltersRef = useRef({ search: searchTerm, status: statusFilter })
  currentFiltersRef.current = { search: searchTerm, status: statusFilter }

  // Protected dialog & item preview state
  const [previewItem, setPreviewItem] = useState<{ name: string; quantity: number; sku?: string; price: number; image?: string } | null>(null)
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null)
  const [holdOrder, setHoldOrder] = useState<AdminOrder | null>(null)
  const [codOrder, setCodOrder] = useState<AdminOrder | null>(null)
  const [returnOrder, setReturnOrder] = useState<AdminOrder | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Sensitive form values for action dialogs
  const [holdNotes, setHoldNotes] = useState("")
  const [codAction, setCodAction] = useState<"confirm_remittance" | "record_discrepancy">("confirm_remittance")
  const [codUtr, setCodUtr] = useState("")
  const [codAmount, setCodAmount] = useState("")
  const [codDiscrepancyReason, setCodDiscrepancyReason] = useState("")
  const [returnRestock, setReturnRestock] = useState(true)
  const [returnCondition, setReturnCondition] = useState<"intact" | "damaged">("intact")
  const [returnNotes, setReturnNotes] = useState("")

  // SKU Search States
  const [skuQuery, setSkuQuery] = useState("")
  const [isSearchingSku, setIsSearchingSku] = useState(false)
  const [searchedProduct, setSearchedProduct] = useState<any>(null)
  const [showSkuModal, setShowSkuModal] = useState(false)
  const [skuNoResult, setSkuNoResult] = useState(false)

  /**
   * Centralized cleanup for protected order UI when access is rejected (401/403).
   * Immediately clears order rows, closes all action & details dialogs, resets
   * sensitive form values, and explicitly resets all loading states.
   */
  const clearProtectedOrderState = (errStatus?: number | null) => {
    // Invalidate sessions and pending asynchronous callbacks
    sessionGenRef.current += 1
    requestSeqRef.current += 1
    activeTokenRef.current = getAdminToken()

    // Explicitly reset loading indicators so no spinner or badge gets stuck
    setLoading(false)
    setActionLoading(false)
    setIsSearchingSku(false)

    // Clear order list & displayed query metadata
    setOrders([])
    setDisplayedQuery(null)

    // Reset pagination & totals
    setTotalPages(1)
    setTotalCount(0)
    setCurrentPage(1)

    // Close all order details and dialogs
    setViewOrder(null)
    setPreviewItem(null)
    setHoldOrder(null)
    setCodOrder(null)
    setReturnOrder(null)

    // Clear sensitive form values
    setHoldNotes("")
    setCodAction("confirm_remittance")
    setCodUtr("")
    setCodAmount("")
    setCodDiscrepancyReason("")
    setReturnRestock(true)
    setReturnCondition("intact")
    setReturnNotes("")

    // Reset SKU modal
    setShowSkuModal(false)
    setSearchedProduct(null)
    setSkuNoResult(false)

    // Set authentication/access-denied status and message if provided
    if (errStatus === 401 || errStatus === 403) {
      setFetchErrorStatus(errStatus)
      setFetchError(
        errStatus === 401
          ? "Admin session was not recognized. Please sign in again from the admin gate."
          : "Access denied. Administrative privileges are required."
      )
    }
  }

  const fetchOrders = async (
    targetPage = currentPage,
    search = searchTerm,
    status = statusFilter,
    sequenceId?: number
  ) => {
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    const mySeq = sequenceId !== undefined ? sequenceId : ++requestSeqRef.current

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status && status !== "all") params.append("status", status)
      if (search.trim()) params.append("search", search.trim())
      params.append("page", String(targetPage))
      params.append("limit", "20")

      const data = await apiGet(`/api/order/admin/all?${params.toString()}`)

      // If this request was superseded by a newer request, newer session, or unmounted, discard it
      if (
        !isMountedRef.current ||
        mySession !== sessionGenRef.current ||
        mySeq !== requestSeqRef.current ||
        getAdminToken() !== myToken
      ) {
        return
      }

      // Treat success:false or malformed orders response as an error, NOT an empty result
      if (!data || data.success === false || !Array.isArray(data.orders)) {
        throw new Error(data?.message || "Failed to retrieve valid order listing from server.")
      }

      setOrders(data.orders)
      setDisplayedQuery({ status: status || "", search: search.trim(), page: targetPage })
      if (data.pagination) {
        setCurrentPage(data.pagination.page || targetPage)
        setTotalPages(data.pagination.totalPages || 1)
        setTotalCount(data.pagination.totalCount ?? data.orders.length)
      }
      setFetchError(null)
      setFetchErrorStatus(null)
    } catch (err: any) {
      // Obsolete request errors must NEVER be displayed or clear the loading state of a newer request
      if (
        !isMountedRef.current ||
        mySession !== sessionGenRef.current ||
        mySeq !== requestSeqRef.current ||
        getAdminToken() !== myToken
      ) {
        return
      }

      console.error("Failed to fetch admin orders:", err)
      const errStatus = err?.status || (err?.response?.status ?? null)

      // For 401/403, clean up all protected UI and order state
      if (errStatus === 401 || errStatus === 403) {
        clearProtectedOrderState(errStatus)
      } else {
        setFetchErrorStatus(errStatus)
        const errorMessage = err?.message || "Failed to load orders. Please try again."
        setFetchError(errorMessage)
      }
    } finally {
      // Ensure an older request cannot stop the latest request's loading indicator
      if (
        isMountedRef.current &&
        mySession === sessionGenRef.current &&
        mySeq === requestSeqRef.current &&
        getAdminToken() === myToken
      ) {
        setLoading(false)
      }
    }
  }

  const handleSessionChange = (newToken: string | null) => {
    sessionGenRef.current += 1
    requestSeqRef.current += 1
    activeTokenRef.current = newToken

    // Explicitly reset loading indicators
    setActionLoading(false)
    setIsSearchingSku(false)

    // Clear order list & displayed query metadata
    setOrders([])
    setDisplayedQuery(null)

    // Reset pagination & totals
    setTotalPages(1)
    setTotalCount(0)
    setCurrentPage(1)

    // Close all order details and dialogs
    setViewOrder(null)
    setPreviewItem(null)
    setHoldOrder(null)
    setCodOrder(null)
    setReturnOrder(null)

    // Clear sensitive form values
    setHoldNotes("")
    setCodAction("confirm_remittance")
    setCodUtr("")
    setCodAmount("")
    setCodDiscrepancyReason("")
    setReturnRestock(true)
    setReturnCondition("intact")
    setReturnNotes("")

    // Reset SKU modal
    setShowSkuModal(false)
    setSearchedProduct(null)
    setSkuNoResult(false)

    if (newToken === null) {
      // Logout: show existing sign-in state and prevent stale follow-up requests
      setLoading(false)
      setFetchErrorStatus(401)
      setFetchError("Admin session was not recognized. Please sign in again from the admin gate.")
    } else {
      // Token replacement: reset errors and use backend authorization flow with current search & status filters
      setFetchError(null)
      setFetchErrorStatus(null)
      const { search, status } = currentFiltersRef.current
      fetchOrders(1, search, status)
    }
  }

  // Stable callback ref so listener always invokes latest handleSessionChange without re-subscribing
  const handleSessionChangeRef = useRef(handleSessionChange)
  handleSessionChangeRef.current = handleSessionChange

  useEffect(() => {
    isMountedRef.current = true

    // Reconcile current session when subscribing so a change between render and subscription is not missed
    const currentToken = getAdminToken()
    if (activeTokenRef.current !== currentToken) {
      handleSessionChangeRef.current(currentToken)
    }

    const unsubscribe = subscribeAdminSession((newToken) => {
      if (!isMountedRef.current) return
      handleSessionChangeRef.current(newToken)
    })

    return () => {
      isMountedRef.current = false
      unsubscribe()
      sessionGenRef.current += 1
      requestSeqRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (!autoFetch) return

    // Invalidate in-flight and pending requests immediately when search/filter intent changes
    requestSeqRef.current += 1
    const currentSeq = requestSeqRef.current
    const currentSession = sessionGenRef.current
    const currentToken = getAdminToken()

    // Filter/search changes reset pagination correctly
    setCurrentPage(1)

    const timer = setTimeout(() => {
      if (
        isMountedRef.current &&
        currentSession === sessionGenRef.current &&
        currentSeq === requestSeqRef.current &&
        getAdminToken() === currentToken
      ) {
        fetchOrders(1, searchTerm, statusFilter, currentSeq)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      requestSeqRef.current += 1
    }
  }, [searchTerm, statusFilter, debounceMs, autoFetch])

  const handleSkuSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skuQuery.trim()) {
      const mySession = sessionGenRef.current
      const myToken = getAdminToken()
      setIsSearchingSku(true)
      setSkuNoResult(false)
      try {
        const cleanQuery = skuQuery.replace(/^sku[:\s]+/i, "").trim()
        const res = await apiGet(`/api/product/by-sku/${encodeURIComponent(cleanQuery)}`)
        if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
          return
        }
        if (res.success && res.product) {
          setSearchedProduct(res.product)
          setShowSkuModal(true)
        } else {
          setSkuNoResult(true)
        }
      } catch (err: any) {
        if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
          return
        }
        const status = err?.status || err?.response?.status
        if (status === 401 || status === 403) {
          clearProtectedOrderState(status)
        }
        setSkuNoResult(true)
      } finally {
        if (isMountedRef.current && mySession === sessionGenRef.current && getAdminToken() === myToken) {
          setIsSearchingSku(false)
        }
      }
    }
  }

  const handleResolveHoldSubmit = async (action: "clear_hold" | "cancel_order") => {
    if (!holdOrder) return
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    setActionLoading(true)
    try {
      const res: any = await apiPost(`/api/order/admin/${holdOrder._id}/resolve-hold`, {
        action,
        notes: holdNotes.trim(),
      })
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      toast.success(res?.message || "Fulfillment hold resolved")
      setHoldOrder(null)
      setHoldNotes("")
      fetchOrders()
    } catch (err: any) {
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      const status = err?.status || err?.response?.status
      if (status === 401 || status === 403) {
        clearProtectedOrderState(status)
      }
      toast.error(err?.message || "Failed to resolve hold")
    } finally {
      if (isMountedRef.current && mySession === sessionGenRef.current && getAdminToken() === myToken) {
        setActionLoading(false)
      }
    }
  }

  const handleCodReconcileSubmit = async () => {
    if (!codOrder) return
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    setActionLoading(true)
    try {
      const res: any = await apiPost(`/api/order/admin/${codOrder._id}/cod-reconcile`, {
        action: codAction,
        amount: codAmount ? Number(codAmount) : undefined,
        utr: codUtr.trim(),
        discrepancyReason: codDiscrepancyReason.trim(),
      })
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      toast.success(res?.message || "COD remittance reconciled")
      setCodOrder(null)
      setCodUtr("")
      setCodAmount("")
      setCodDiscrepancyReason("")
      fetchOrders()
    } catch (err: any) {
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      const status = err?.status || err?.response?.status
      if (status === 401 || status === 403) {
        clearProtectedOrderState(status)
      }
      toast.error(err?.message || "Failed to reconcile COD remittance")
    } finally {
      if (isMountedRef.current && mySession === sessionGenRef.current && getAdminToken() === myToken) {
        setActionLoading(false)
      }
    }
  }

  const handleConfirmReturnSubmit = async () => {
    if (!returnOrder) return
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    setActionLoading(true)
    try {
      const res: any = await apiPost(`/api/order/admin/${returnOrder._id}/confirm-return`, {
        restock: returnRestock,
        condition: returnCondition,
        notes: returnNotes.trim(),
      })
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      toast.success(res?.message || "Physical return confirmed")
      setReturnOrder(null)
      setReturnNotes("")
      fetchOrders()
    } catch (err: any) {
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      const status = err?.status || err?.response?.status
      if (status === 401 || status === 403) {
        clearProtectedOrderState(status)
      }
      toast.error(err?.message || "Failed to confirm return")
    } finally {
      if (isMountedRef.current && mySession === sessionGenRef.current && getAdminToken() === myToken) {
        setActionLoading(false)
      }
    }
  }

  const handlePageChange = (targetPage: number) => {
    setCurrentPage(targetPage)
    requestSeqRef.current += 1
    const seq = requestSeqRef.current
    return fetchOrders(targetPage, searchTerm, statusFilter, seq)
  }

  const handleRetry = () => {
    requestSeqRef.current += 1
    const seq = requestSeqRef.current
    return fetchOrders(currentPage, searchTerm, statusFilter, seq)
  }

  const updateStatus = async (orderId: string, status: string) => {
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    try {
      const data: any = await apiPut(`/api/order/admin/${orderId}/status`, { status })
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }

      if (status === "cancelled") {
        if (data.finalized) {
          const refundNote = data.refund ? ` · Refund: ${data.refund.status || "initiated"}` : ""
          toast.success(`Order cancelled successfully${refundNote}`)
        } else if (data.courierCancel === "uncertain") {
          toast.warning("Cancellation requested: courier confirmation is pending.")
        } else if (data.courierCancel === "failed") {
          toast.error("Courier rejected cancellation: parcel is already with courier / in transit.")
        } else {
          toast.info(data.message || "Cancellation request recorded.")
        }
      } else {
        toast.success(`Order marked as ${status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`)
      }

      fetchOrders()
    } catch (err: any) {
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      console.error("Failed to update order status:", err)
      const errStatus = err?.status || err?.response?.status
      if (errStatus === 401 || errStatus === 403) {
        clearProtectedOrderState(errStatus)
      }
      toast.error(err?.message || "Failed to update order status")
    }
  }

  const triggerAdminRefund = async (orderId: string) => {
    const mySession = sessionGenRef.current
    const myToken = getAdminToken()
    try {
      const res: any = await apiPost(`/api/order/admin/${orderId}/refund`, { reason: "Refund issued by admin" })
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      toast.success(res?.message || "Refund initiated/reconciled successfully")
      fetchOrders()
    } catch (err: any) {
      if (!isMountedRef.current || mySession !== sessionGenRef.current || getAdminToken() !== myToken) {
        return
      }
      console.error("Failed to issue refund:", err)
      const errStatus = err?.status || err?.response?.status
      if (errStatus === 401 || errStatus === 403) {
        clearProtectedOrderState(errStatus)
      }
      toast.error(err?.message || "Failed to initiate refund")
    }
  }

  const isOutdated = Boolean(fetchError && orders.length > 0 && fetchErrorStatus !== 401 && fetchErrorStatus !== 403)
  const hasQueryMismatch = Boolean(
    isOutdated &&
      displayedQuery &&
      (displayedQuery.status !== (statusFilter || "") ||
        displayedQuery.search !== searchTerm.trim() ||
        displayedQuery.page !== currentPage)
  )

  return {
    orders,
    setOrders,
    loading,
    setLoading,
    fetchError,
    setFetchError,
    fetchErrorStatus,
    setFetchErrorStatus,
    displayedQuery,
    setDisplayedQuery,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    previewItem,
    setPreviewItem,
    viewOrder,
    setViewOrder,
    holdOrder,
    setHoldOrder,
    codOrder,
    setCodOrder,
    returnOrder,
    setReturnOrder,
    actionLoading,
    setActionLoading,
    holdNotes,
    setHoldNotes,
    codAction,
    setCodAction,
    codUtr,
    setCodUtr,
    codAmount,
    setCodAmount,
    codDiscrepancyReason,
    setCodDiscrepancyReason,
    returnRestock,
    setReturnRestock,
    returnCondition,
    setReturnCondition,
    returnNotes,
    setReturnNotes,
    skuQuery,
    setSkuQuery,
    isSearchingSku,
    setIsSearchingSku,
    searchedProduct,
    setSearchedProduct,
    showSkuModal,
    setShowSkuModal,
    skuNoResult,
    setSkuNoResult,
    handleSkuSearch,
    handleResolveHoldSubmit,
    handleCodReconcileSubmit,
    handleConfirmReturnSubmit,
    fetchOrders,
    handlePageChange,
    handleRetry,
    updateStatus,
    triggerAdminRefund,
    clearProtectedOrderState,
    isOutdated,
    hasQueryMismatch,
    requestSeqRef,
    sessionGenRef,
    isMountedRef,
  }
}
