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
import { MoreHorizontal, Search, Filter, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdminOrder {
  _id: string
  orderId: string
  user?: { name: string; email: string }
  createdAt: string
  pricing: { total: number }
  status: string
  items: any[]
  shiprocket?: { courierName?: string; awbCode?: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

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

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
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
              <TableHead>Courier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>₹{order.pricing.total.toLocaleString('en-IN')}</TableCell>
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
    </div>
  )
}
