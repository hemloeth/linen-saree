"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Customer = {
    _id: string
    name: string
    email: string
    phone?: string
    totalOrders: number
    totalSpent: number
    status: "active" | "inactive" | "vip"
    createdAt: string
    lastOrderDate: string | null
}

type CustomerSummary = {
    total: number
    active: number
    vip: number
    totalRevenue: number
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [summary, setSummary] = useState<CustomerSummary>({ total: 0, active: 0, vip: 0, totalRevenue: 0 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTimeout, setSearchTimeout] = useState<any>(null)

    useEffect(() => {
        fetchCustomers()
    }, [page])

    // Debounced search
    useEffect(() => {
        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            setPage(1)
            fetchCustomers()
        }, 400)
        setSearchTimeout(timeout)
        return () => clearTimeout(timeout)
    }, [searchTerm])

    const fetchCustomers = async () => {
        try {
            const { apiGet } = await import("@/lib/api")
            const query = `?page=${page}&limit=20${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`
            const data = await apiGet(`/api/admin/customers${query}`)

            if (data.success) {
                setCustomers(data.customers)
                setSummary(data.summary)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

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
                        <div className="text-2xl font-semibold">{summary.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{summary.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{summary.vip}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">₹{summary.totalRevenue.toLocaleString("en-IN")}</div>
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
                                placeholder="Search by name, email or phone"
                                className="w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th className="py-2 px-3 text-left font-medium">Joined</th>
                                <th className="py-2 px-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? "No customers found" : "No customers yet"}
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="border-b last:border-0 hover:bg-muted/50">
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
                                            ₹{customer.totalSpent.toLocaleString("en-IN")}
                                        </td>
                                        <td className="py-2 px-3 text-muted-foreground text-xs">
                                            {new Date(customer.createdAt).toLocaleDateString("en-IN")}
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
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
