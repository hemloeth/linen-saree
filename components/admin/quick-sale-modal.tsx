"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Percent, IndianRupee, Save, X } from "lucide-react"

interface QuickSaleModalProps {
    product: any | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, updates: any) => Promise<void>
}

export function QuickSaleModal({ product, isOpen, onClose, onSave }: QuickSaleModalProps) {
    const [salePrice, setSalePrice] = useState<string>("")
    const [discountPercent, setDiscountPercent] = useState<number>(0)
    const [isSaving, setIsSaving] = useState(false)

    const regularPrice = product?.originalPrice || product?.regularPrice || 0

    // Initialize values when product changes
    useEffect(() => {
        if (product && isOpen) {
            const currentPrice = product.price || regularPrice
            setSalePrice(currentPrice.toString())
            
            if (regularPrice > 0 && currentPrice < regularPrice) {
                const percent = Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
                setDiscountPercent(percent)
            } else {
                setDiscountPercent(0)
            }
        }
    }, [product, isOpen, regularPrice])

    const calculateFromPrice = (price: string) => {
        const numPrice = parseFloat(price)
        setSalePrice(price)
        if (regularPrice > 0 && !isNaN(numPrice) && numPrice < regularPrice) {
            setDiscountPercent(Math.round(((regularPrice - numPrice) / regularPrice) * 100))
        } else {
            setDiscountPercent(0)
        }
    }

    const applyDiscount = (percent: number) => {
        if (regularPrice > 0) {
            const newPrice = Math.round(regularPrice * (1 - percent / 100))
            setSalePrice(newPrice.toString())
            setDiscountPercent(percent)
        }
    }

    const handleSave = async () => {
        if (!product) return
        
        setIsSaving(true)
        try {
            await onSave(product.id || product._id, {
                isOnSale: true,
                price: parseFloat(salePrice)
            })
            onClose()
        } catch (error) {
            console.error("Failed to save sale price", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] border-primary/10 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-primary">
                        <Percent className="w-5 h-5" />
                        Quick Sale Editor
                    </DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                        {product.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    {/* MRP Display */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-dashed">
                        <span className="text-sm font-medium">Regular Price (MRP)</span>
                        <span className="font-bold text-lg">₹{regularPrice.toLocaleString()}</span>
                    </div>

                    {/* Sale Price Input */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="salePrice" className="text-sm font-bold">New Sale Price</Label>
                            {discountPercent > 0 && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold animate-in fade-in zoom-in duration-300">
                                    {discountPercent}% DISCOUNT
                                </Badge>
                            )}
                        </div>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="salePrice"
                                type="number"
                                value={salePrice}
                                onChange={(e) => calculateFromPrice(e.target.value)}
                                className="pl-9 h-12 text-lg font-semibold border-primary/20 focus-visible:ring-primary"
                                placeholder="Enter sale price"
                            />
                        </div>
                    </div>

                    {/* Quick Discount Presets */}
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Quick Percentages
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                            {[10, 20, 30, 50].map((percent) => (
                                <Button
                                    key={percent}
                                    variant={discountPercent === percent ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => applyDiscount(percent)}
                                    className={`h-10 font-bold transition-all ${
                                        discountPercent === percent 
                                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md scale-105" 
                                        : "hover:border-orange-500 hover:text-orange-500"
                                    }`}
                                >
                                    {percent}%
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    {product.isOnSale && (
                        <Button 
                            variant="outline" 
                            onClick={async () => {
                                setIsSaving(true)
                                try {
                                    await onSave(product.id || product._id, { isOnSale: false, price: regularPrice })
                                    onClose()
                                } finally {
                                    setIsSaving(false)
                                }
                            }}
                            disabled={isSaving}
                            className="text-destructive hover:text-white hover:bg-destructive"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Stop Sale
                        </Button>
                    )}
                    <div className="flex flex-1 gap-2">
                        <Button variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || !salePrice || parseFloat(salePrice) >= regularPrice} 
                            className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg active:scale-95 transition-all"
                        >
                            {isSaving ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {product.isOnSale ? "Update Sale" : "Start Sale"}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
