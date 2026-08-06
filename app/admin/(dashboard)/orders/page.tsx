"use client"

import { useEffect, useState } from "react"
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
import { apiGet } from "@/lib/api"

interface AdminOrder {
  _id: string
  orderId: string
  user?: { name: string; email: string }
  createdAt: string
  pricing: { total: number }
  status: string
  items: { name: string; quantity: number; sku?: string; price: number; image?: string }[]
  shiprocket?: { courierName?: string; awbCode?: string }
  payment?: { method: string; status: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [previewItem, setPreviewItem] = useState<{ name: string; quantity: number; sku?: string; price: number; image?: string } | null>(null)

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
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const { apiGet } = await import("@/lib/api")
      const query = statusFilter ? `?status=${statusFilter}` : ""
      const data = await apiGet(`/api/order/admin/all${query}`)
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { apiPut } = await import("@/lib/api")
      await apiPut(`/api/order/admin/${orderId}/status`, { status })
      fetchOrders() // Refresh list
    } catch (err) {
      console.error("Failed to update order status:", err)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (loading) {
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
          <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Orders</h2>
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

      <div className="rounded-md border bg-card">
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
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter ? "No matching orders" : "No orders yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium font-mono text-xs">{order.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{order.user?.email || ""}</div>
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {order.payment?.method === "cod" ? "COD" : "Prepaid"}
                      </span>
                      {order.payment?.method && order.payment.method !== "cod" && (
                        <span className="text-xs text-muted-foreground capitalize">
                          ({order.payment.method})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{order.shiprocket?.courierName || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {formatStatus(order.status)}
                    </Badge>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  )
}
