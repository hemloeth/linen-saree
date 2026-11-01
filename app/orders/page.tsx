"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Loader2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  HelpCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  _id: string
  orderId: string
  status: string
  createdAt: string
  pricing: {
    subtotal: number
    shipping: number
    discount: number
    total: number
  }
  items: OrderItem[]
  shiprocket?: {
    courierName?: string
    awbCode?: string
    trackingUrl?: string
  }
  payment?: {
    method: string
    status: string
  }
  canCancel?: boolean
  cannotCancelReason?: string | null
  cancellationSummary?: {
    canCancel?: boolean
    cannotCancelReason?: string | null
    reasonCode?: string
    status?: string
    requestedAt?: string | null
    resolvedAt?: string | null
    courierOutcome?: string | null
    reason?: string | null
  }
  refundSummary?: {
    status?: string | null
    amountPaise?: number
    amountRupees?: number
    currency?: string
    initiatedAt?: string | null
    verifiedAt?: string | null
    finalized?: boolean
    paymentMethod?: string
    notice?: string
  }
}

const CANCELLATION_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Need to change shipping address or phone number",
  "Incorrect items in order",
  "Changed my mind",
  "Other"
]

export default function OrdersPage() {
  const { isAuthenticated, isHydrated, user, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  // Cancellation Modal & Per-order action states
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0])
  const [optionalDetails, setOptionalDetails] = useState("")
  const [cancellingIds, setCancellingIds] = useState<Record<string, boolean>>({})
  const [refreshingIds, setRefreshingIds] = useState<Record<string, boolean>>({})
  const [cancelErrors, setCancelErrors] = useState<Record<string, string | null>>({})

  const isMountedRef = useRef(true)
  const currentUserRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Detect account switch: discard old orders
    if (currentUserRef.current !== user?.email) {
      currentUserRef.current = user?.email
      setOrders([])
      setPage(1)
      setTotalPages(1)
      setTotalCount(0)
      setFetchError(null)
    }
  }, [user?.email])

  const fetchOrders = useCallback(async (targetPage = 1, append = false, isBackground = false) => {
    if (!append && !isBackground) {
      setLoading(true)
      setFetchError(null)
    }
    if (append) {
      setLoadingMore(true)
    }

    try {
      const { apiGet } = await import("@/lib/api")
      const data = await apiGet(`/api/order/my-orders?page=${targetPage}&limit=10`)

      if (!isMountedRef.current) return

      if (data.success && Array.isArray(data.orders)) {
        setOrders(prev => {
          if (!append) return data.orders
          const existingIds = new Set(prev.map(o => o._id))
          const newItems = data.orders.filter((o: Order) => !existingIds.has(o._id))
          return [...prev, ...newItems]
        })
        setPage(data.pagination?.page || targetPage)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || data.orders.length)
        setFetchError(null)
      } else {
        throw new Error(data.message || "Invalid order data received.")
      }
    } catch (err: any) {
      if (!isMountedRef.current) return
      console.error("Failed to fetch orders:", err)
      const errorMsg = err?.message || "Failed to load orders. Please check your connection."
      if (!append && orders.length === 0) {
        setFetchError(errorMsg)
      } else {
        toast.error("Could not refresh orders. Showing loaded data.")
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [orders.length])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchOrders(1, false)
    } else if (isHydrated) {
      setLoading(false)
    }
  }, [isHydrated, isAuthenticated, fetchOrders])

  // Single order status refresh (for pending cancellation or refund states)
  const refreshSingleOrder = async (orderId: string) => {
    setRefreshingIds(prev => ({ ...prev, [orderId]: true }))
    try {
      const { apiGet } = await import("@/lib/api")
      const data = await apiGet(`/api/order/${orderId}`)
      if (isMountedRef.current && data.success && data.order) {
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o))
        toast.success("Order status refreshed.")
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        toast.error(err?.message || "Failed to refresh order status.")
      }
    } finally {
      if (isMountedRef.current) {
        setRefreshingIds(prev => ({ ...prev, [orderId]: false }))
      }
    }
  }

  // Window focus revalidation: if any order is pending cancellation or refund, refresh it
  useEffect(() => {
    const handleFocus = () => {
      if (!isAuthenticated || loading || orders.length === 0) return
      const hasPendingWork = orders.some(o =>
        o.cancellationSummary?.status === "requested" ||
        o.refundSummary?.status === "pending" ||
        o.refundSummary?.status === "requested"
      )
      if (hasPendingWork) {
        fetchOrders(1, false, true)
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [isAuthenticated, loading, orders, fetchOrders])

  // Cancellation submission handler
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return
    const orderId = orderToCancel._id

    setCancellingIds(prev => ({ ...prev, [orderId]: true }))
    setCancelErrors(prev => ({ ...prev, [orderId]: null }))

    try {
      const { apiPost } = await import("@/lib/api")
      const response = await apiPost(`/api/order/${orderId}/cancel`, {
        reason: selectedReason,
        details: optionalDetails.trim(),
      })

      if (!isMountedRef.current) return

      if (response.success && response.order) {
        // Update authoritative order in place
        setOrders(prev => prev.map(o => o._id === orderId ? response.order : o))

        if (response.finalized) {
          const refundNote = response.refund?.amountRupees
            ? ` A refund of ₹${response.refund.amountRupees.toLocaleString('en-IN')} has been initiated.`
            : ""
          toast.success(`Order #${orderToCancel.orderId} cancelled successfully.${refundNote}`)
        } else if (response.confirmationPending) {
          toast.info(`Cancellation requested for Order #${orderToCancel.orderId}. Awaiting courier verification.`)
        } else {
          toast.info(response.message || "Cancellation request processed.")
        }

        setOrderToCancel(null)
        setSelectedReason(CANCELLATION_REASONS[0])
        setOptionalDetails("")
      } else {
        throw new Error(response.message || "Unable to complete cancellation.")
      }
    } catch (err: any) {
      if (!isMountedRef.current) return
      console.error("Cancellation error:", err)
      const errorMsg = err?.message || "Failed to cancel order. Please refresh and try again."
      setCancelErrors(prev => ({ ...prev, [orderId]: errorMsg }))
      toast.error(errorMsg)
      // Re-fetch authoritative state before encouraging retry
      refreshSingleOrder(orderId)
    } finally {
      if (isMountedRef.current) {
        setCancellingIds(prev => ({ ...prev, [orderId]: false }))
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-blue-600" />
      case 'placed':
      case 'confirmed':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'returned':
        return <RotateCcw className="w-5 h-5 text-orange-600" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800'
      case 'placed':
      case 'confirmed':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return "Online Payment"
    if (method.toLowerCase() === "cod") return "Cash on Delivery"
    if (method.toLowerCase() === "card") return "Prepaid (Card)"
    if (method.toLowerCase() === "upi") return "Prepaid (UPI)"
    return `Prepaid (${method.toUpperCase()})`
  }

  const getRefundBadge = (status?: string | null) => {
    switch (status) {
      case "processed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">✓ Refund Processed</span>
      case "pending":
      case "requested":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">⏳ Refund Processing</span>
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">⚠ Refund Action Required</span>
      default:
        return null
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div
          className="min-h-[60vh] flex items-center justify-center"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div
          className="min-h-[60vh] flex items-center justify-center"
          style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
        >
          <div className="text-center px-4">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Please log in</h3>
            <p className="text-muted-foreground mb-6">Log in to view and manage your orders</p>
            <Link href="/account/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300">
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div
        className="container mx-auto px-4 pb-16"
        style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track shipments, view cancellation details and monitor refund status</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID (e.g. LS-...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-sm"
            />
          </div>
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} of {totalCount} {totalCount === 1 ? "order" : "orders"}
            </div>
          )}
        </div>

        {/* Fetch Failure Error Banner */}
        {fetchError && orders.length === 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center my-8">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load orders</h3>
            <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
            {fetchError.toLowerCase().includes("session expired") || fetchError.toLowerCase().includes("not authorized") ? (
              <Button onClick={() => { logout(); router.push("/account/login"); }} className="gap-2">
                Log In Again
              </Button>
            ) : (
              <Button onClick={() => fetchOrders(1, false)} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            )}
          </div>
        )}

        {/* Order Cards List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isCancelling = !!cancellingIds[order._id]
            const isRefreshing = !!refreshingIds[order._id]
            const orderError = cancelErrors[order._id]

            // Authoritative eligibility flags provided by backend
            const canCancelOrder = order.canCancel ?? (
              ["placed", "confirmed", "processing"].includes(order.status) &&
              order.cancellationSummary?.status !== "requested" &&
              order.cancellationSummary?.status !== "completed"
            )

            const isCancellationRequested = order.cancellationSummary?.status === "requested"
            const isCourierUncertain = isCancellationRequested && order.cancellationSummary?.courierOutcome === "uncertain"
            const isCourierRejected = order.cancellationSummary?.courierOutcome === "failed"

            return (
              <div key={order._id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md">
                {/* Header */}
                <div className="bg-secondary/60 px-6 py-4 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground font-semibold">
                          Order #{order.orderId}
                        </span>
                        {order.payment?.method && (
                          <span className="text-xs text-muted-foreground">
                            {getPaymentMethodDisplay(order.payment.method)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <span className="text-xs text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      {/* Quick refresh action for pending states */}
                      {(isCancellationRequested || order.refundSummary?.status === "pending") && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => refreshSingleOrder(order._id)}
                          disabled={isRefreshing}
                          title="Refresh current status"
                          className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                          <span className="hidden sm:inline">Refresh</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress / Status Notices */}
                {isCancellationRequested && (
                  <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        <strong>Cancellation Requested:</strong> {isCourierUncertain
                          ? "We are verifying dispatch status with our courier partner. Your order is on hold."
                          : "Your cancellation request is being processed."}
                      </span>
                    </div>
                  </div>
                )}

                {isCourierRejected && (
                  <div className="px-6 py-2.5 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Cancellation Unavailable:</strong> This parcel has already been dispatched with the courier and cannot be stopped. You may initiate a return upon delivery.
                    </span>
                  </div>
                )}

                {/* Per-order error feedback */}
                {orderError && (
                  <div className="px-6 py-2 bg-destructive/10 text-xs text-destructive border-b border-destructive/20 flex items-center justify-between">
                    <span>{orderError}</span>
                    <button
                      onClick={() => setCancelErrors(prev => ({ ...prev, [order._id]: null }))}
                      className="text-destructive font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Items List */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {item.image ? (
                            <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-border/50" />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-base font-semibold text-foreground">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Status Progress Block */}
                {order.refundSummary && (
                  <div className="px-6 py-3.5 bg-secondary/30 border-t border-border/80">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Refund:
                        </span>
                        {getRefundBadge(order.refundSummary.status)}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        Refund Amount: ₹{(order.refundSummary.amountRupees || order.pricing.total).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {order.refundSummary.notice && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {order.refundSummary.notice}
                      </p>
                    )}
                    {order.refundSummary.verifiedAt && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Gateway processed on {new Date(order.refundSummary.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer & Actions */}
                <div className="bg-secondary/40 px-6 py-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {order.shiprocket?.trackingUrl && (
                        <a
                          href={order.shiprocket.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium text-xs inline-flex items-center gap-1 underline underline-offset-4"
                        >
                          Track Shipment <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                      {order.shiprocket?.courierName && (
                        <span className="text-xs text-muted-foreground">
                          via {order.shiprocket.courierName}
                        </span>
                      )}

                      {/* Cancel Order Action */}
                      {canCancelOrder && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrderToCancel(order)
                            setSelectedReason(CANCELLATION_REASONS[0])
                            setOptionalDetails("")
                          }}
                          disabled={isCancelling}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-8"
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Order"
                          )}
                        </Button>
                      )}

                      {!canCancelOrder && order.cannotCancelReason && order.status !== "cancelled" && order.status !== "delivered" && (
                        <span className="text-[11px] text-muted-foreground italic" title={order.cannotCancelReason}>
                          {order.cannotCancelReason}
                        </span>
                      )}
                    </div>

                    <div className="text-right self-end sm:self-auto">
                      <div className="text-xs text-muted-foreground">Total Amount</div>
                      <div className="text-xl font-bold text-foreground">
                        ₹{order.pricing.total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Load More Pagination */}
        {page < totalPages && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchOrders(page + 1, true)}
              disabled={loadingMore}
              className="min-w-[160px] gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load More Orders ({orders.length} of {totalCount})</>
              )}
            </Button>
          </div>
        )}

        {/* Empty Search or Empty Orders State */}
        {filteredOrders.length === 0 && !loading && !fetchError && (
          <div className="text-center py-16 bg-card rounded-xl border border-border p-8 my-8">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No matching orders found" : "No orders yet"}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              {searchTerm
                ? `No orders matching "${searchTerm}" in your account.`
                : "Explore our handcrafted handloom collection and place your first order today."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            ) : (
              <Link href="/collections" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all inline-block">
                Start Shopping
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Accessible Cancellation Dialog */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Cancel Order #{orderToCancel?.orderId}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Please let us know why you wish to cancel this order.
            </DialogDescription>
          </DialogHeader>

          {orderToCancel && (
            <div className="space-y-4 py-2">
              {/* Commercial & Refund Impact Notice */}
              <div className="p-3 bg-secondary rounded-lg text-xs space-y-1.5 border border-border">
                <div className="font-semibold text-foreground">Payment & Refund Policy:</div>
                {orderToCancel.payment?.method === "cod" ? (
                  <p className="text-muted-foreground leading-relaxed">
                    This is a Cash on Delivery order. No payment was collected, so no monetary refund is required. Stock will be restored to store inventory.
                  </p>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    A full refund of <strong>₹{orderToCancel.pricing.total.toLocaleString('en-IN')}</strong> will be initiated to your original payment method ({getPaymentMethodDisplay(orderToCancel.payment?.method)}). Bank processing typically reflects in 5-7 business days.
                  </p>
                )}
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for cancellation <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  {CANCELLATION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Additional Details */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Additional Details <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={optionalDetails}
                  onChange={(e) => setOptionalDetails(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell us more about your request (up to 500 characters)..."
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                />
                <div className="text-[11px] text-muted-foreground text-right mt-0.5">
                  {optionalDetails.length}/500
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOrderToCancel(null)}
              disabled={orderToCancel ? !!cancellingIds[orderToCancel._id] : false}
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={orderToCancel ? !!cancellingIds[orderToCancel._id] : false}
              className="gap-2"
            >
              {orderToCancel && cancellingIds[orderToCancel._id] ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
