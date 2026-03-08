"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Customer = {
    id: number
    name: string
    email: string
    phone?: string
    totalOrders: number
    totalSpent: number
    status: "active" | "inactive" | "vip"
}

const mockCustomers: Customer[] = [
    {
        id: 1,
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 98765 43210",
        totalOrders: 8,
        totalSpent: 32450,
        status: "vip",
    },
    {
        id: 2,
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        phone: "+91 99887 66554",
        totalOrders: 3,
        totalSpent: 9450,
        status: "active",
    },
    {
        id: 3,
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        phone: "+91 91234 56789",
        totalOrders: 1,
        totalSpent: 4150,
        status: "active",
    },
    {
        id: 4,
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        phone: "+91 97654 32109",
        totalOrders: 0,
        totalSpent: 0,
        status: "inactive",
    },
]

export default function CustomersPage() {
    const stats = useMemo(() => {
        const total = mockCustomers.length
        const active = mockCustomers.filter((c) => c.status !== "inactive").length
        const vip = mockCustomers.filter((c) => c.status === "vip").length
        const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0)

        return { total, active, vip, totalRevenue }
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Customers</h2>
                    <p className="text-muted-foreground">
                        View your customer list, their orders and total spend.
                    </p>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{stats.vip}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">₹{stats.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter + table */}
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-base">Customer List</CardTitle>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-full md:w-64">
                            <Label htmlFor="customer-search" className="sr-only">
                                Search customers
                            </Label>
                            <Input
                                id="customer-search"
                                placeholder="Search by name or email"
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="py-2 px-3 text-left font-medium">Name</th>
                                <th className="py-2 px-3 text-left font-medium">Email</th>
                                <th className="py-2 px-3 text-left font-medium">Phone</th>
                                <th className="py-2 px-3 text-right font-medium">Orders</th>
                                <th className="py-2 px-3 text-right font-medium">Total Spent</th>
                                <th className="py-2 px-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCustomers.map((customer) => (
                                <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="py-2 px-3">
                                        <div className="font-medium">{customer.name}</div>
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className="text-muted-foreground">{customer.email}</span>
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className="text-muted-foreground">{customer.phone || "—"}</span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        {customer.totalOrders}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        ₹{customer.totalSpent.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3">
                                        <span
                                            className={
                                                customer.status === "vip"
                                                    ? "inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-medium text-yellow-800"
                                                    : customer.status === "active"
                                                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800"
                                                        : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                                            }
                                        >
                                            {customer.status === "vip"
                                                ? "VIP"
                                                : customer.status === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}

