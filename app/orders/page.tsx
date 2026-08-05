"use client"

import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Clock, Search, Loader2 } from 'lucide-react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { resolveMediaUrl } from "@/lib/media"

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
}

export default function OrdersPage() {
  const { isAuthenticated, isHydrated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchOrders()
    } else if (isHydrated) {
      setLoading(false)
    }
  }, [isHydrated, isAuthenticated])

  const fetchOrders = async () => {
    try {
      const { apiGet } = await import("@/lib/api")
      const data = await apiGet('/api/order/my-orders')
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
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
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return "Online Payment";
    if (method.toLowerCase() === "cod") return "Cash on Delivery";
    if (method.toLowerCase() === "card") return "Prepaid (Card)";
    if (method.toLowerCase() === "upi") return "Prepaid (UPI)";
    return `Prepaid (${method})`;
  }

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Please log in</h3>
            <p className="text-muted-foreground mb-6">Log in to view your orders</p>
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
      <div className="container mx-auto px-4 py-12 pt-[96px] lg:pt-[104px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="bg-secondary px-6 py-4 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
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
                  <div className="text-sm text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.image ? (
                          <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        )}
                        <div>
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary px-6 py-4 border-t border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex space-x-4 mb-4 md:mb-0">
                    {order.shiprocket?.trackingUrl && (
                      <a
                        href={order.shiprocket.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Track Shipment
                      </a>
                    )}
                    {order.shiprocket?.courierName && (
                      <span className="text-sm text-muted-foreground">
                        via {order.shiprocket.courierName}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-xl font-bold text-foreground">
                      ₹{order.pricing.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try a different search" : "Start shopping to see your orders here"}
            </p>
            <Link href="/collections" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
