"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { useCart } from "@/context/cart-context"

export function CartToast() {
    const { toastProduct, showToast } = useCart()

    if (!toastProduct) return null

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${showToast
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
        >
            <div className="bg-background border border-border shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw] sm:min-w-[340px]">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                    <Image
                        src={toastProduct.images?.[0] || toastProduct.image || "/placeholder.svg"}
                        alt={toastProduct.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Added to cart</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{toastProduct.name}</p>
                </div>
                <span className="text-sm font-bold text-foreground flex-shrink-0">₹{toastProduct.price.toLocaleString()}</span>
            </div>
        </div>
    )
}
