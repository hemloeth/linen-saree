import { Package, Truck, CheckCircle, Clock, Search } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function OrdersPage() {
  // Mock order data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 2499,
      items: [
        { name: 'Banarasi Silk Saree - Pink', quantity: 1, price: 2499 }
      ]
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-18',
      status: 'shipped',
      total: 1899,
      items: [
        { name: 'Pure Linen Saree - Blue', quantity: 1, price: 1899 }
      ]
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-20',
      status: 'processing',
      total: 3299,
      items: [
        { name: 'Handloom Cotton Saree - Green', quantity: 1, price: 1649 },
        { name: 'Embroidered Saree - Maroon', quantity: 1, price: 1650 }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />
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
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 pt-[96px] lg:pt-[104px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              />
            </div>
            <select className="px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background">
              <option value="">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              {/* Order Header */}
              <div className="bg-secondary px-6 py-4 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order #{order.id}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        <div>
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div className="bg-secondary px-6 py-4 border-t border-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex space-x-4 mb-4 md:mb-0">
                    <button className="text-primary hover:text-primary/80 font-medium text-sm">
                      View Details
                    </button>
                    <button className="text-primary hover:text-primary/80 font-medium text-sm">
                      Track Order
                    </button>
                    {order.status === 'delivered' && (
                      <button className="text-primary hover:text-primary/80 font-medium text-sm">
                        Reorder
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-xl font-bold text-foreground">
                      ₹{order.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no orders) */}
        {orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300">
              Start Shopping
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}