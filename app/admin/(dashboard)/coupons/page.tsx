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

type CouponType = "percentage" | "fixed"

interface Coupon {
    id: number
    code: string
    type: CouponType
    value: number
    minOrder?: number
    maxDiscount?: number
    productSkus?: string
    productCategories?: string
    allowedEmails?: string
    usageLimitPerCoupon?: number
    usageLimitPerUser?: number
    expiresAt?: string
    active: boolean
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])

    const [code, setCode] = useState("")
    const [type, setType] = useState<CouponType>("percentage")
    const [value, setValue] = useState("")
    const [minOrder, setMinOrder] = useState("")
    const [maxDiscount, setMaxDiscount] = useState("")
    const [productSkus, setProductSkus] = useState("")
    const [productCategories, setProductCategories] = useState("")
    const [allowedEmails, setAllowedEmails] = useState("")
    const [usageLimitPerCoupon, setUsageLimitPerCoupon] = useState("")
    const [usageLimitPerUser, setUsageLimitPerUser] = useState("")
    const [expiresAt, setExpiresAt] = useState("")

    const [activeTab, setActiveTab] = useState<"general" | "restriction" | "limits">("general")

    useEffect(() => {
        if (typeof window === "undefined") return
        try {
            const existing = window.localStorage.getItem("adminCoupons")
            const parsed = existing ? JSON.parse(existing) : []
            if (Array.isArray(parsed)) {
                setCoupons(parsed)
            }
        } catch (err) {
            console.error("Failed to load coupons from localStorage", err)
        }
    }, [])

    const saveCoupons = (next: Coupon[]) => {
        setCoupons(next)
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem("adminCoupons", JSON.stringify(next))
            } catch (err) {
                console.error("Failed to save coupons to localStorage", err)
            }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!code || !value) return

        const newCoupon: Coupon = {
            id: Date.now(),
            code: code.toUpperCase().trim(),
            type,
            value: parseFloat(value),
            minOrder: minOrder ? parseFloat(minOrder) : undefined,
            maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
            productSkus: productSkus || undefined,
            productCategories: productCategories || undefined,
            allowedEmails: allowedEmails || undefined,
            usageLimitPerCoupon: usageLimitPerCoupon ? parseInt(usageLimitPerCoupon) : undefined,
            usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : undefined,
            expiresAt: expiresAt || undefined,
            active: true,
        }

        const next = [...coupons, newCoupon]
        saveCoupons(next)

        setCode("")
        setType("percentage")
        setValue("")
        setMinOrder("")
        setMaxDiscount("")
        setProductSkus("")
        setProductCategories("")
        setAllowedEmails("")
        setUsageLimitPerCoupon("")
        setUsageLimitPerUser("")
        setExpiresAt("")
    }

    const toggleActive = (id: number) => {
        const next = coupons.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
        )
        saveCoupons(next)
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
                <CardHeader className="pb-3 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">Add Coupon</CardTitle>
                    <div className="inline-flex rounded-full bg-muted p-1 text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab("general")}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === "general"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            General
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("restriction")}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === "restriction"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Usage restriction
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("limits")}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === "limits"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Usage limits
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === "general" && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-code">Code</Label>
                                        <Input
                                            id="coupon-code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="e.g. LINEN10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-type">Discount type</Label>
                                        <Select
                                            value={type}
                                            onValueChange={(v) =>
                                                setType(v as CouponType)
                                            }
                                        >
                                            <SelectTrigger id="coupon-type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    Percentage (% off)
                                                </SelectItem>
                                                <SelectItem value="fixed">
                                                    Fixed cart discount (₹)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-value">
                                            {type === "percentage"
                                                ? "Coupon amount (%)"
                                                : "Coupon amount (₹)"}
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
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-expiry">
                                            Coupon expiry date (optional)
                                        </Label>
                                        <Input
                                            id="coupon-expiry"
                                            type="date"
                                            value={expiresAt}
                                            onChange={(e) =>
                                                setExpiresAt(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "restriction" && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-min-order">
                                            Minimum order amount
                                        </Label>
                                        <Input
                                            id="coupon-min-order"
                                            type="number"
                                            step="0.01"
                                            value={minOrder}
                                            onChange={(e) => setMinOrder(e.target.value)}
                                            placeholder="e.g. 1500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-max-discount">
                                            Maximum discount amount (optional)
                                        </Label>
                                        <Input
                                            id="coupon-max-discount"
                                            type="number"
                                            step="0.01"
                                            value={maxDiscount}
                                            onChange={(e) => setMaxDiscount(e.target.value)}
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-skus">
                                            Products (SKU list)
                                        </Label>
                                        <Input
                                            id="coupon-skus"
                                            value={productSkus}
                                            onChange={(e) =>
                                                setProductSkus(e.target.value)
                                            }
                                            placeholder="e.g. LS-001, LS-002"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-categories">
                                            Product categories
                                        </Label>
                                        <Input
                                            id="coupon-categories"
                                            value={productCategories}
                                            onChange={(e) =>
                                                setProductCategories(e.target.value)
                                            }
                                            placeholder="e.g. Pure Linen, Bridal Collection"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-emails">
                                            Allowed emails
                                        </Label>
                                        <Input
                                            id="coupon-emails"
                                            value={allowedEmails}
                                            onChange={(e) =>
                                                setAllowedEmails(e.target.value)
                                            }
                                            placeholder="e.g. user@example.com, @company.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "limits" && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-usage-limit">
                                            Usage limit per coupon
                                        </Label>
                                        <Input
                                            id="coupon-usage-limit"
                                            type="number"
                                            value={usageLimitPerCoupon}
                                            onChange={(e) =>
                                                setUsageLimitPerCoupon(e.target.value)
                                            }
                                            placeholder="e.g. 100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="coupon-usage-per-user">
                                            Usage limit per user
                                        </Label>
                                        <Input
                                            id="coupon-usage-per-user"
                                            type="number"
                                            value={usageLimitPerUser}
                                            onChange={(e) =>
                                                setUsageLimitPerUser(e.target.value)
                                            }
                                            placeholder="e.g. 1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button type="submit">
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
                                <tr className="border-b text-xs text-muted-foreground">
                                    <th className="py-2 px-3 text-left font-medium">
                                        Code
                                    </th>
                                    <th className="py-2 px-3 text-left font-medium">
                                        Type
                                    </th>
                                    <th className="py-2 px-3 text-right font-medium">
                                        Value
                                    </th>
                                    <th className="py-2 px-3 text-right font-medium">
                                        Min Order
                                    </th>
                                    <th className="py-2 px-3 text-right font-medium">
                                        Max Discount
                                    </th>
                                    <th className="py-2 px-3 text-left font-medium">
                                        Expiry
                                    </th>
                                    <th className="py-2 px-3 text-left font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr
                                        key={coupon.id}
                                        className="border-b last:border-0 hover:bg-muted/40"
                                    >
                                        <td className="py-2 px-3 font-medium">
                                            {coupon.code}
                                        </td>
                                        <td className="py-2 px-3">
                                            {coupon.type === "percentage"
                                                ? "Percentage"
                                                : "Fixed Amount"}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            {coupon.type === "percentage"
                                                ? `${coupon.value}%`
                                                : `₹${coupon.value.toLocaleString()}`}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            {coupon.minOrder
                                                ? `₹${coupon.minOrder.toLocaleString()}`
                                                : "—"}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            {coupon.maxDiscount
                                                ? `₹${coupon.maxDiscount.toLocaleString()}`
                                                : "—"}
                                        </td>
                                        <td className="py-2 px-3">
                                            {coupon.expiresAt
                                                ? new Date(
                                                    coupon.expiresAt
                                                ).toLocaleDateString()
                                                : "No expiry"}
                                        </td>
                                        <td className="py-2 px-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleActive(coupon.id)
                                                }
                                                className={
                                                    coupon.active
                                                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800"
                                                        : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                                                }
                                            >
                                                {coupon.active
                                                    ? "Active"
                                                    : "Inactive"}
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

