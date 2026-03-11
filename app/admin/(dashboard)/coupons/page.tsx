"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type CouponType = "percentage" | "fixed"

interface Coupon {
    _id: string
    code: string
    discountType: CouponType
    discountValue: number
    minPurchase?: number
    expiryDate?: string
    usageLimit?: number
    usageLimitPerUser: number
    usedCount: number
    isActive: boolean
    createdAt: string
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [code, setCode] = useState("")
    const [type, setType] = useState<CouponType>("percentage")
    const [value, setValue] = useState("")
    const [minOrder, setMinOrder] = useState("")
    const [usageLimit, setUsageLimit] = useState("")
    const [usageLimitPerUser, setUsageLimitPerUser] = useState("1")
    const [expiresAt, setExpiresAt] = useState("")

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        try {
            const res = await apiGet("/api/coupon")
            setCoupons(res.coupons || [])
        } catch (error) {
            console.error("Failed to load coupons", error)
            toast.error("Failed to load coupons")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code || !value || !expiresAt) {
            toast.error("Code, value, and expiry date are required")
            return
        }

        setSubmitting(true)
        try {
            const newCoupon = {
                code: code.toUpperCase().trim(),
                discountType: type,
                discountValue: parseFloat(value),
                minPurchase: minOrder ? parseFloat(minOrder) : 0,
                usageLimit: usageLimit ? parseInt(usageLimit) : 100,
                usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : 1,
                expiryDate: new Date(expiresAt).toISOString(),
                isActive: true,
            }

            await apiPost("/api/coupon", newCoupon)
            toast.success("Coupon created successfully")

            setCode("")
            setType("percentage")
            setValue("")
            setMinOrder("")
            setUsageLimit("")
            setUsageLimitPerUser("1")
            setExpiresAt("")

            fetchCoupons()
        } catch (error: any) {
            toast.error(error.message || "Failed to create coupon")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await apiPut(`/api/coupon/${id}`, { isActive: !currentStatus })
            setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c))
            toast.success(`Coupon marked as ${!currentStatus ? 'Active' : 'Inactive'}`)
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const deleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return
        try {
            await apiDelete(`/api/coupon/${id}`)
            setCoupons(coupons.filter(c => c._id !== id))
            toast.success("Coupon deleted")
        } catch (error) {
            toast.error("Failed to delete coupon")
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Coupons</h2>
                    <p className="text-muted-foreground">
                        Create and manage discount coupons for your customers.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-base">Add Coupon</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-code">Code</Label>
                                    <Input
                                        id="coupon-code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="e.g. SUMMER50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-type">Discount Type</Label>
                                    <Select
                                        value={type}
                                        onValueChange={(v) => setType(v as CouponType)}
                                    >
                                        <SelectTrigger id="coupon-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (% off)</SelectItem>
                                            <SelectItem value="fixed">Fixed cart discount (₹)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-value">
                                        {type === "percentage" ? "Discount Percentage (%)" : "Discount Amount (₹)"}
                                    </Label>
                                    <Input
                                        id="coupon-value"
                                        type="number"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={type === "percentage" ? "10" : "500"}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-expiry">Expiry Date</Label>
                                    <Input
                                        id="coupon-expiry"
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-min-order">Minimum Order Amount (₹)</Label>
                                    <Input
                                        id="coupon-min-order"
                                        type="number"
                                        step="0.01"
                                        value={minOrder}
                                        onChange={(e) => setMinOrder(e.target.value)}
                                        placeholder="e.g. 1500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-usage-limit">Total Usage Limit</Label>
                                    <Input
                                        id="coupon-usage-limit"
                                        type="number"
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.value)}
                                        placeholder="e.g. 100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coupon-user-limit">Per-User Limit</Label>
                                    <Input
                                        id="coupon-user-limit"
                                        type="number"
                                        min="1"
                                        value={usageLimitPerUser}
                                        onChange={(e) => setUsageLimitPerUser(e.target.value)}
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Coupon
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Existing Coupons</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {coupons.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No coupons created yet. Add your first coupon above.
                        </p>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b text-left text-xs text-muted-foreground whitespace-nowrap">
                                    <th className="py-3 px-4 font-medium">Code</th>
                                    <th className="py-3 px-4 font-medium">Type</th>
                                    <th className="py-3 px-4 text-right font-medium">Value</th>
                                    <th className="py-3 px-4 text-right font-medium">Min Order</th>
                                    <th className="py-3 px-4 text-center font-medium">Limits</th>
                                    <th className="py-3 px-4 font-medium">Expiry</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr
                                        key={coupon._id}
                                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-bold text-primary">
                                            {coupon.code}
                                        </td>
                                        <td className="py-3 px-4 capitalize">
                                            {coupon.discountType}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {coupon.discountType === "percentage"
                                                ? `${coupon.discountValue}%`
                                                : `₹${coupon.discountValue.toLocaleString()}`}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {coupon.minPurchase ? `₹${coupon.minPurchase.toLocaleString()}` : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex flex-col text-xs space-y-1">
                                                <span>Total: {coupon.usedCount} / {coupon.usageLimit || "∞"}</span>
                                                <span className="text-muted-foreground">Per User: {coupon.usageLimitPerUser}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(coupon.expiryDate || "").toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleActive(coupon._id, coupon.isActive)}
                                                className={
                                                    coupon.isActive
                                                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-200 transition-colors"
                                                        : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                                                }
                                            >
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => deleteCoupon(coupon._id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
