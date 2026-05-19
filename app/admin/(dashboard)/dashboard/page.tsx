"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/admin/stats-card"
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
    revenue: { total: number; thisMonth: number; growth: number }
    orders: { total: number; active: number; thisMonth: number; growth: number }
    customers: { total: number; newThisMonth: number }
    products: { total: number; lowStock: number; outOfStock: number }
}

interface RecentOrder {
    _id: string
    orderId: string
    status: string
    pricing: { total: number }
    createdAt: string
    user?: { name: string; email: string }
    items: any[]
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [salesData, setSalesData] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const { apiGet } = await import("@/lib/api")

            const [statsRes, revenueRes, salesRes, ordersRes] = await Promise.all([
                apiGet("/api/admin/stats"),
                apiGet("/api/admin/revenue-chart"),
                apiGet("/api/admin/sales-chart"),
                apiGet("/api/admin/recent-orders"),
            ])

            if (statsRes.success) setStats(statsRes.stats)
            if (revenueRes.success) setRevenueData(revenueRes.chartData)
            if (salesRes.success) setSalesData(salesRes.chartData)
            if (ordersRes.success) setRecentOrders(ordersRes.orders)
        } catch (err) {
            console.error("Failed to load dashboard:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString("en-IN")}`

    const formatGrowth = (growth: number) =>
        `${growth >= 0 ? "+" : ""}${growth}% from last month`

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "text-green-600"
            case "shipped": case "in_transit": return "text-blue-600"
            case "cancelled": return "text-red-600"
            default: return "text-yellow-600"
        }
    }

    const formatStatus = (s: string) =>
        s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary font-serif">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your store&apos;s performance.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.revenue.total || 0)}
                    description={formatGrowth(stats?.revenue.growth || 0)}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Orders"
                    value={String(stats?.orders.total || 0)}
                    description={`${stats?.orders.active || 0} active orders`}
                    icon={ShoppingBag}
                />
                <StatsCard
                    title="Customers"
                    value={String(stats?.customers.total || 0)}
                    description={`+${stats?.customers.newThisMonth || 0} this month`}
                    icon={Users}
                />
                <StatsCard
                    title="Products"
                    value={String(stats?.products.total || 0)}
                    description={`${stats?.products.lowStock || 0} low stock · ${stats?.products.outOfStock || 0} out`}
                    icon={Package}
                />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>
                            Monthly revenue for the last 12 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B7355" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B7355" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DED6" />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#8B7355"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                            Sales volume for the last 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={salesData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Bar
                                    dataKey="sales"
                                    fill="#C4A77D"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest 5 orders placed on your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs text-muted-foreground">{order.orderId}</span>
                                            <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {order.user?.name || "Unknown"} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(order.pricing.total)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
