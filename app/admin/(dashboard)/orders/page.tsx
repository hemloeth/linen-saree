"use client"

import { useEffect, useState, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Filter, Loader2, X, Package, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { resolveMediaUrl } from "@/lib/media"
import Link from "next/link"
import { apiGet, apiPost } from "@/lib/api"
import { toast } from "sonner"

interface AdminOrder {
  _id: string
  orderId: string
  user?: { name: string; email: string; phone?: string }
  shippingAddress?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    landmark?: string
    city: string
    state: string
    pincode: string
  }
  createdAt: string
  pricing: { subtotal?: number; shipping?: number; discount?: number; couponCode?: string; total: number }
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchErrorStatus, setFetchErrorStatus] = useState<number | null>(null)
  const [displayedQuery, setDisplayedQuery] = useState<{ status: string; search: string; page: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const requestSeqRef = useRef(0)
  const isMountedRef = useRef(true)
  const [previewItem, setPreviewItem] = useState<{ name: string; quantity: number; sku?: string; price: number; image?: string } | null>(null)
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null)
  const [holdOrder, setHoldOrder] = useState<AdminOrder | null>(null)
  const [codOrder, setCodOrder] = useState<AdminOrder | null>(null)
  const [returnOrder, setReturnOrder] = useState<AdminOrder | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [holdNotes, setHoldNotes] = useState("")
  const [codAction, setCodAction] = useState<"confirm_remittance" | "record_discrepancy">("confirm_remittance")
  const [codUtr, setCodUtr] = useState("")
  const [codAmount, setCodAmount] = useState("")
  const [codDiscrepancyReason, setCodDiscrepancyReason] = useState("")
  const [returnRestock, setReturnRestock] = useState(true)
  const [returnCondition, setReturnCondition] = useState<"intact" | "damaged">("intact")
  const [returnNotes, setReturnNotes] = useState("")

  // Resolve the real customer name from the shipping address (falls back to account user)
  const getCustomerName = (order: AdminOrder) => {
    const sa = order.shippingAddress
    if (sa) {
      const full = `${sa.firstName || ""} ${sa.lastName || ""}`.trim()
      if (full) return full
    }
    return order.user?.name || "—"
  }

  // Payment label derived from BOTH method and status (fixes "fake prepaid")
  const getPaymentLabel = (order: AdminOrder) => {
    const method = order.payment?.method
    const status = order.payment?.status
    if (method === "cod") {
      const rem = order.codAccounting?.remittanceStatus;
      let sub = "To collect";
      let color = "text-foreground";
      if (rem === "remitted") {
        sub = `Remitted${order.codAccounting?.utr ? " (" + order.codAccounting.utr + ")" : ""}`;
        color = "text-green-600";
      } else if (rem === "discrepancy") {
        sub = "Remittance Discrepancy";
        color = "text-destructive";
      } else if (order.status === "delivered" || order.codAccounting?.collectedAtDelivery) {
        sub = "Cash Collected · Remittance Pending";
        color = "text-amber-600";
      }
      return { main: "COD", sub, color };
    }
    if (status === "paid") {
      return { main: "Prepaid", sub: `${method ? method.toUpperCase() : ""} · Paid`, color: "text-green-600" }
    }
    if (status === "failed") {
      return { main: "Payment Failed", sub: method ? `(${method})` : "", color: "text-destructive" }
    }
    if (status === "refunded") {
      return { main: "Refunded", sub: method ? `(${method})` : "", color: "text-muted-foreground" }
    }
    return { main: "Payment Pending", sub: method ? `(${method})` : "", color: "text-amber-600" }
  }

  // SKU Search States
  const [skuQuery, setSkuQuery] = useState("")
  const [isSearchingSku, setIsSearchingSku] = useState(false)
  const [searchedProduct, setSearchedProduct] = useState<any>(null)
  const [showSkuModal, setShowSkuModal] = useState(false)
  const [skuNoResult, setSkuNoResult] = useState(false)

  const handleSkuSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && skuQuery.trim()) {
          setIsSearchingSku(true)
          setSkuNoResult(false)
          try {
              // Clean the query: gracefully remove "SKU: ", "SKU ", etc. if the user copied the whole thing
              const cleanQuery = skuQuery.replace(/^sku[:\s]+/i, '').trim();

              const res = await apiGet(`/api/product/by-sku/${encodeURIComponent(cleanQuery)}`)
              if (res.success && res.product) {
                  setSearchedProduct(res.product)
                  setShowSkuModal(true)
              } else {
                  setSkuNoResult(true)
              }
          } catch (err) {
              console.error("SKU Search Error:", err)
              setSkuNoResult(true)
          } finally {
              setIsSearchingSku(false)
          }
      }
  }

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestSeqRef.current += 1;
    };
  }, []);

  useEffect(() => {
    // Invalidate in-flight and pending requests immediately when search/filter intent changes
    requestSeqRef.current += 1;
    const currentSeq = requestSeqRef.current;

    // Filter/search changes reset pagination correctly
    setCurrentPage(1);

    const timer = setTimeout(() => {
      fetchOrders(1, searchTerm, statusFilter, currentSeq);
    }, 300);

    return () => {
      clearTimeout(timer);
      requestSeqRef.current += 1;
    };
  }, [searchTerm, statusFilter]);


  const handleResolveHoldSubmit = async (action: "clear_hold" | "cancel_order") => {
    if (!holdOrder) return;
    setActionLoading(true);
    try {
      const res: any = await apiPost(`/api/order/admin/${holdOrder._id}/resolve-hold`, {
        action,
        notes: holdNotes.trim(),
      });
      toast.success(res?.message || "Fulfillment hold resolved");
      setHoldOrder(null);
      setHoldNotes("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve hold");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCodReconcileSubmit = async () => {
    if (!codOrder) return;
    setActionLoading(true);
    try {
      const res: any = await apiPost(`/api/order/admin/${codOrder._id}/cod-reconcile`, {
        action: codAction,
        amount: codAmount ? Number(codAmount) : undefined,
        utr: codUtr.trim(),
        discrepancyReason: codDiscrepancyReason.trim(),
      });
      toast.success(res?.message || "COD remittance reconciled");
      setCodOrder(null);
      setCodUtr("");
      setCodAmount("");
      setCodDiscrepancyReason("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reconcile COD remittance");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReturnSubmit = async () => {
    if (!returnOrder) return;
    setActionLoading(true);
    try {
      const res: any = await apiPost(`/api/order/admin/${returnOrder._id}/confirm-return`, {
        restock: returnRestock,
        condition: returnCondition,
        notes: returnNotes.trim(),
      });
      toast.success(res?.message || "Physical return confirmed");
      setReturnOrder(null);
      setReturnNotes("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm return");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOrders = async (
    targetPage = currentPage,
    search = searchTerm,
    status = statusFilter,
    sequenceId?: number
  ) => {
    const mySeq = sequenceId !== undefined ? sequenceId : ++requestSeqRef.current;

    try {
      setLoading(true);
      const { apiGet } = await import("@/lib/api");
      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      if (search.trim()) params.append("search", search.trim());
      params.append("page", String(targetPage));
      params.append("limit", "20");

      const data = await apiGet(`/api/order/admin/all?${params.toString()}`);

      // If this request was superseded by a newer request or unmounted, discard it completely
      if (!isMountedRef.current || mySeq !== requestSeqRef.current) {
        return;
      }

      // Treat success:false or malformed orders response as an error, NOT an empty result
      if (!data || data.success === false || !Array.isArray(data.orders)) {
        throw new Error(data?.message || "Failed to retrieve valid order listing from server.");
      }

      setOrders(data.orders);
      setDisplayedQuery({ status: status || "", search: search.trim(), page: targetPage });
      if (data.pagination) {
        setCurrentPage(data.pagination.page || targetPage);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.totalCount ?? data.orders.length);
      }
      setFetchError(null);
      setFetchErrorStatus(null);
    } catch (err: any) {
      // Obsolete request errors must NEVER be displayed or clear the loading state of a newer request
      if (!isMountedRef.current || mySeq !== requestSeqRef.current) {
        return;
      }

      console.error("Failed to fetch admin orders:", err);
      const errStatus = err?.status || (err?.response?.status ?? null);
      setFetchErrorStatus(errStatus);

      const errorMessage =
        errStatus === 401
          ? "Admin session was not recognized. Please sign in again from the admin gate."
          : errStatus === 403
          ? "Access denied. Administrative privileges are required."
          : err?.message || "Failed to load orders. Please try again.";

      setFetchError(errorMessage);

      // For 401/403, hide protected rows immediately
      if (errStatus === 401 || errStatus === 403) {
        setOrders([]);
        setDisplayedQuery(null);
      }
    } finally {
      // Ensure an older request cannot stop the latest request's loading indicator
      if (isMountedRef.current && mySeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (targetPage: number) => {
    setCurrentPage(targetPage);
    requestSeqRef.current += 1;
    const seq = requestSeqRef.current;
    fetchOrders(targetPage, searchTerm, statusFilter, seq);
  };

  const handleRetry = () => {
    requestSeqRef.current += 1;
    const seq = requestSeqRef.current;
    fetchOrders(currentPage, searchTerm, statusFilter, seq);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { apiPut } = await import("@/lib/api")
      const data: any = await apiPut(`/api/order/admin/${orderId}/status`, { status })

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
        toast.success(`Order marked as ${formatStatus(status)}`)
      }

      fetchOrders() // Refresh list
    } catch (err: any) {
      console.error("Failed to update order status:", err)
      toast.error(err?.message || "Failed to update order status")
    }
  }

  const triggerAdminRefund = async (orderId: string) => {
    try {
      const res: any = await apiPost(`/api/order/admin/${orderId}/refund`, { reason: "Refund issued by admin" })
      toast.success(res?.message || "Refund initiated/reconciled successfully")
      fetchOrders()
    } catch (err: any) {
      console.error("Failed to issue refund:", err)
      toast.error(err?.message || "Failed to initiate refund")
    }
  }

  const filteredOrders = orders

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
      case "confirmed":
      case "processing": return "default";
      case "shipped":
      case "in_transit":
      case "out_for_delivery": return "secondary";
      case "delivered": return "outline";
      case "cancelled":
      case "returned": return "destructive";
      default: return "default";
    }
  }

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const isOutdated = Boolean(fetchError && orders.length > 0 && fetchErrorStatus !== 401 && fetchErrorStatus !== 403);
  const hasQueryMismatch = Boolean(
    isOutdated &&
    displayedQuery &&
    (displayedQuery.status !== (statusFilter || "") ||
     displayedQuery.search !== searchTerm.trim() ||
     displayedQuery.page !== currentPage)
  );

  if (loading && orders.length === 0 && !fetchError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Orders</h2>
            {loading && orders.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Updating...
              </span>
            )}
            {isOutdated && (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-xs">
                Outdated Results
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
            <option value="hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
              placeholder="Paste SKU and press Enter..." 
              className="pl-8 bg-muted/30 border-muted hover:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
              value={skuQuery}
              onChange={(e) => {
                  setSkuQuery(e.target.value)
                  if (skuNoResult) setSkuNoResult(false)
              }}
              onKeyDown={handleSkuSearch}
          />
          {isSearchingSku && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-primary animate-spin" />
          )}
          {skuNoResult && (
              <span className="absolute -bottom-5 left-2 text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                  No product found
              </span>
          )}
        </div>
      </div>

      {fetchError && (
        <div
          role="alert"
          className={`p-4 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            fetchErrorStatus === 401 || fetchErrorStatus === 403
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="text-sm">
              <p className="font-semibold">{fetchError}</p>
              {isOutdated && (
                <p className="text-xs mt-1 opacity-90">
                  {hasQueryMismatch
                    ? `Note: The rows below are previous results (Page ${displayedQuery?.page || 1}${displayedQuery?.status ? `, Status: ${displayedQuery.status}` : ""}${displayedQuery?.search ? `, Search: "${displayedQuery.search}"` : ""}) and do not match your current selection.`
                    : "Previously loaded orders are shown below, but may be outdated due to the refresh failure."}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {fetchErrorStatus === 401 || fetchErrorStatus === 403 ? (
              <Link href="/admin/login">
                <Button size="sm" variant="outline">Sign In</Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={handleRetry}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              fetchError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-destructive">{fetchError}</p>
                      {fetchErrorStatus === 401 || fetchErrorStatus === 403 ? (
                        <Link href="/admin/login">
                          <Button size="sm" variant="outline">Sign In Again</Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={handleRetry}
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter ? "No matching orders" : "No orders yet"}
                  </TableCell>
                </TableRow>
              )
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium font-mono text-xs whitespace-nowrap">{order.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getCustomerName(order)}</div>
                      {order.shippingAddress?.phone && (
                        <div className="text-xs text-muted-foreground">{order.shippingAddress.phone}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {order.shippingAddress?.email || order.user?.email || ""}
                      </div>
                      {order.shippingAddress && (
                        <div className="text-[11px] text-muted-foreground/80 truncate max-w-[180px]" title={`${order.shippingAddress.address}${order.shippingAddress.city ? ", " + order.shippingAddress.city : ""}`}>
                          {[order.shippingAddress.address, order.shippingAddress.city].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 max-w-[160px] max-h-[120px] overflow-y-auto hide-scrollbar">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-2 items-center border-b border-border/50 pb-1 last:border-0 last:pb-0">
                          {item.image && (
                            <div 
                              className="w-10 h-10 flex-shrink-0 rounded bg-muted overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewItem(item)}
                            >
                              <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-xs leading-tight" title={item.name}>
                              <span className="text-primary font-bold">{item.quantity}x</span> {item.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                              <span>{item.sku ? `SKU: ${item.sku}` : ''}</span>
                              <span>₹{item.price?.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>₹{order.pricing.total.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    {(() => {
                      const label = getPaymentLabel(order)
                      return (
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${label.color}`}>{label.main}</span>
                          {label.sub && (
                            <span className="text-xs text-muted-foreground">{label.sub}</span>
                          )}
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="text-xs">{order.shiprocket?.courierName || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {formatStatus(order.status)}
                      </Badge>
                      {order.cancellation?.status === "requested" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                          Cancel Req ({order.cancellation.courierOutcome || "pending"})
                        </span>
                      )}
                      {order.fulfillmentHold?.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium" title={order.fulfillmentHold.reason}>
                          Hold: {order.fulfillmentHold.reason?.slice(0, 25)}...
                        </span>
                      )}
                      {order.refund?.status && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Refund: {order.refund.status}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewOrder(order)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updateStatus(order._id, "confirmed")}>
                          Mark Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(order._id, "processing")}>
                          Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(order._id, "shipped")}>
                          Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(order._id, "delivered")}>
                          Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(order._id, "cancelled")}
                          className="text-destructive"
                        >
                          Cancel Order
                        </DropdownMenuItem>
                        {order.payment?.status === "paid" && (order.status === "cancelled" || order.refund?.status === "failed") && (
                          <DropdownMenuItem
                            onClick={() => triggerAdminRefund(order._id)}
                            className="text-blue-600 font-medium"
                          >
                            Reconcile / Retry Refund
                          </DropdownMenuItem>
                        )}
                        {order.fulfillmentHold?.active && (
                          <DropdownMenuItem
                            onClick={() => setHoldOrder(order)}
                            className="text-red-600 font-medium"
                          >
                            Resolve Hold
                          </DropdownMenuItem>
                        )}
                        {order.payment?.method === "cod" && (order.status === "delivered" || order.codAccounting?.collectedAtDelivery || order.codAccounting?.remittanceStatus === "pending") && order.codAccounting?.remittanceStatus !== "remitted" && (
                          <DropdownMenuItem
                            onClick={() => setCodOrder(order)}
                            className="text-amber-700 font-medium"
                          >
                            Reconcile COD Remittance
                          </DropdownMenuItem>
                        )}
                        {(order.status === "returned" || order.reservation?.state === "return_pending") && !order.returnInfo?.stockRestored && (
                          <DropdownMenuItem
                            onClick={() => setReturnOrder(order)}
                            className="text-purple-600 font-medium"
                          >
                            Confirm Return & Restock
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 px-2">
          <div className="text-sm text-muted-foreground">
            Showing {orders.length} of {totalCount} orders (Page {currentPage} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {previewItem && previewItem.image && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative max-w-sm w-full rounded-none overflow-hidden shadow-2xl bg-white border-none" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-[3/4] bg-muted w-full">
              <img src={resolveMediaUrl(previewItem.image)} alt={previewItem.name} className="w-full h-full object-cover cursor-default" />
              <button 
                className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white rounded-full p-2 hover:bg-black/80 transition-colors z-10 cursor-pointer"
                onClick={() => setPreviewItem(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setViewOrder(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-lg shadow-2xl border border-border"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors z-10 cursor-pointer"
              onClick={() => setViewOrder(null)}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">{viewOrder.orderId}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewOrder.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <Badge variant={getStatusColor(viewOrder.status) as "default" | "secondary" | "destructive" | "outline"}>
                  {formatStatus(viewOrder.status)}
                </Badge>
              </div>

              {/* Customer + Shipping */}
              <div className="grid md:grid-cols-2 gap-6 border-y py-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Customer</h3>
                  <div className="text-sm font-medium">{getCustomerName(viewOrder)}</div>
                  {viewOrder.shippingAddress?.phone && (
                    <div className="text-sm">{viewOrder.shippingAddress.phone}</div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {viewOrder.shippingAddress?.email || viewOrder.user?.email || ""}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Shipping Address</h3>
                  {viewOrder.shippingAddress ? (
                    <address className="not-italic text-sm text-foreground leading-relaxed">
                      {[viewOrder.shippingAddress.address, viewOrder.shippingAddress.landmark]
                        .filter(Boolean).join(", ") && (
                        <>{[viewOrder.shippingAddress.address, viewOrder.shippingAddress.landmark].filter(Boolean).join(", ")}<br /></>
                      )}
                      {[viewOrder.shippingAddress.city, viewOrder.shippingAddress.state]
                        .filter(Boolean).join(", ")} {viewOrder.shippingAddress.pincode}
                    </address>
                  ) : (
                    <div className="text-sm text-muted-foreground">No address on file</div>
                  )}
                </div>
              </div>

              {/* Payment + Courier */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment</h3>
                  {(() => {
                    const label = getPaymentLabel(viewOrder)
                    return (
                      <div className="text-sm">
                        <span className={`font-medium ${label.color}`}>{label.main}</span>
                        {label.sub && <span className="text-muted-foreground"> · {label.sub}</span>}
                        {viewOrder.payment?.razorpayPaymentId && (
                          <div className="text-xs text-muted-foreground mt-1 font-mono break-all">
                            Pay ID: {viewOrder.payment.razorpayPaymentId}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Courier</h3>
                  <div className="text-sm">
                    {viewOrder.shiprocket?.courierName || "—"}
                    {viewOrder.shiprocket?.awbCode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        AWB: {viewOrder.shiprocket.awbCode}
                        {viewOrder.shiprocket.trackingUrl && (
                          <>
                            {" "}
                            <a href={viewOrder.shiprocket.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                              Track <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Items</h3>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 border-b border-border/50 pb-2 last:border-0">
                      {item.image && (
                        <div className="w-12 h-12 flex-shrink-0 rounded bg-muted overflow-hidden">
                          <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.quantity}x {item.name}</div>
                        {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}
                      </div>
                      <div className="text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-1.5 text-sm">
                {typeof viewOrder.pricing.subtotal === "number" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{viewOrder.pricing.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {typeof viewOrder.pricing.shipping === "number" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{viewOrder.pricing.shipping === 0 ? "Free" : `₹${viewOrder.pricing.shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                )}
                {typeof viewOrder.pricing.discount === "number" && viewOrder.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount {viewOrder.pricing.couponCode ? `(${viewOrder.pricing.couponCode})` : ""}</span>
                    <span className="text-primary">-₹{viewOrder.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-1.5 border-t">
                  <span>Total</span>
                  <span>₹{viewOrder.pricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Product Quick-View Modal */}
      {showSkuModal && searchedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  className="relative w-full max-w-2xl bg-card rounded-none shadow-2xl overflow-hidden border-none flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
              >
                  <button 
                      className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors z-10 cursor-pointer"
                      onClick={() => setShowSkuModal(false)}
                  >
                      <X className="w-4 h-4" />
                  </button>
                  
                  <div className="w-full md:w-2/5 aspect-square md:aspect-auto md:min-h-[400px] bg-muted relative">
                      <img 
                          src={resolveMediaUrl(searchedProduct.mainImage || searchedProduct.image)} 
                          alt={searchedProduct.name} 
                          className="w-full h-full object-cover" 
                      />
                  </div>
                  
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                              SKU: {searchedProduct.sku || "N/A"}
                          </span>
                          {searchedProduct.isOnSale && (
                              <span className="text-xs font-bold bg-orange-500/10 text-orange-600 px-2 py-1 rounded">Sale</span>
                          )}
                      </div>
                      
                      <h2 className="text-2xl font-serif font-bold text-primary leading-tight mb-2">
                          {searchedProduct.name}
                      </h2>
                      
                      <div className="flex items-end gap-3 mb-6">
                          <div className="text-3xl font-semibold">
                              ₹{searchedProduct.price?.toLocaleString('en-IN')}
                          </div>
                          {searchedProduct.regularPrice > searchedProduct.price && (
                              <div className="text-lg text-muted-foreground line-through mb-1">
                                  ₹{searchedProduct.regularPrice.toLocaleString('en-IN')}
                              </div>
                          )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-8 border-y py-4 border-border/60">
                          <div>
                              <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Category</span>
                              <span className="font-medium capitalize">{searchedProduct.category || "—"}</span>
                          </div>
                          <div>
                              <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Inventory</span>
                              <span className={`font-medium flex items-center gap-1.5 ${searchedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div className={`w-2 h-2 rounded-full ${searchedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                  {searchedProduct.stock > 0 ? `${searchedProduct.stock} in stock` : 'Out of stock'}
                              </span>
                          </div>
                      </div>
                      
                      <div className="flex gap-3 mt-auto">
                          <Link href={`/admin/edit-product/${searchedProduct.slug}`} className="flex-1" onClick={() => setShowSkuModal(false)}>
                              <Button className="w-full gap-2">
                                  <Package className="w-4 h-4" />
                                  Edit Product
                              </Button>
                          </Link>
                          <Link href={`/product/${searchedProduct.slug}`} target="_blank" onClick={() => setShowSkuModal(false)}>
                              <Button variant="outline" size="icon" title="View on Storefront">
                                  <ExternalLink className="w-4 h-4" />
                              </Button>
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Resolve Hold Modal */}
      {holdOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setHoldOrder(null)}>
          <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-foreground">Resolve Fulfillment Hold</h3>
            <p className="text-xs text-muted-foreground">Order #{holdOrder.orderId}: {holdOrder.fulfillmentHold?.reason || "Active hold"}</p>
            <textarea
              className="w-full text-xs p-2 border rounded bg-background"
              placeholder="Resolution notes (e.g. verified stock allocation / customer consent)..."
              rows={3}
              value={holdNotes}
              onChange={e => setHoldNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setHoldOrder(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" disabled={actionLoading} onClick={() => handleResolveHoldSubmit("cancel_order")}>Cancel Order</Button>
              <Button size="sm" disabled={actionLoading} onClick={() => handleResolveHoldSubmit("clear_hold")}>Clear Hold</Button>
            </div>
          </div>
        </div>
      )}

      {/* COD Reconcile Modal */}
      {codOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setCodOrder(null)}>
          <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-foreground">Reconcile COD Remittance</h3>
            <p className="text-xs text-muted-foreground">Order #{codOrder.orderId} · Amount Due: ₹{codOrder.pricing.total.toLocaleString('en-IN')}</p>
            <div className="flex gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={codAction === "confirm_remittance"} onChange={() => setCodAction("confirm_remittance")} />
                Confirm Remittance
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={codAction === "record_discrepancy"} onChange={() => setCodAction("record_discrepancy")} />
                Record Discrepancy
              </label>
            </div>
            {codAction === "confirm_remittance" ? (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1">Bank UTR Reference:</label>
                  <Input placeholder="e.g. CMS12345678" value={codUtr} onChange={e => setCodUtr(e.target.value)} />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Remitted Amount (₹, optional - defaults to full):</label>
                  <Input placeholder={String(codOrder.pricing.total)} value={codAmount} onChange={e => setCodAmount(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Discrepancy Reason:</label>
                <textarea className="w-full text-xs p-2 border rounded bg-background" rows={3} value={codDiscrepancyReason} onChange={e => setCodDiscrepancyReason(e.target.value)} placeholder="e.g. Short remittance by courier or fake delivery claim" />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setCodOrder(null)}>Cancel</Button>
              <Button size="sm" disabled={actionLoading} onClick={handleCodReconcileSubmit}>Save Reconciliation</Button>
            </div>
          </div>
        </div>
      )}

      {/* Physical Return Confirmation Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setReturnOrder(null)}>
          <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-foreground">Confirm Physical Return & Restock</h3>
            <p className="text-xs text-muted-foreground">Order #{returnOrder.orderId} · Returned Items Verification</p>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Parcel Condition:</label>
                <select className="w-full p-2 border rounded bg-background" value={returnCondition} onChange={(e: any) => { setReturnCondition(e.target.value); if (e.target.value === "damaged") setReturnRestock(false); }}>
                  <option value="intact">Intact / Resellable (Restock item)</option>
                  <option value="damaged">Damaged / Non-restockable (Do not restock)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="restockCheck" checked={returnRestock} onChange={e => setReturnRestock(e.target.checked)} />
                <label htmlFor="restockCheck" className="cursor-pointer">Restore product inventory count</label>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Inspection Notes:</label>
                <textarea className="w-full p-2 border rounded bg-background" rows={2} value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="e.g. Tags intact, inspected by warehouse team" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setReturnOrder(null)}>Cancel</Button>
              <Button size="sm" disabled={actionLoading} onClick={handleConfirmReturnSubmit}>Confirm Return</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
