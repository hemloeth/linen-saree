import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import { StarRating } from "@/components/common/star-rating"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { resolveMediaUrl } from "@/lib/media"

interface ProductPreviewCardProps {
    images: string[]
    name: string
    sku?: string
    category: string
    price: string
    regularPrice?: string
    stock: string
    color?: string
    tags?: string
}

export function ProductPreviewCard({ images, name, sku, category, price, regularPrice, stock, color, tags }: ProductPreviewCardProps) {
    const displayPrice = price ? parseFloat(price) : 0
    const displayRegular = regularPrice ? parseFloat(regularPrice) : null
    const displayImages = images.length > 0 ? images : ["/placeholder.svg"]

    return (
        <div className="group relative w-full">
            <div className="relative w-full mb-3 md:mb-4">
                <div className="aspect-[4/5] overflow-hidden bg-muted rounded-sm relative">
                    {displayImages.length > 1 ? (
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {displayImages.map((src, index) => (
                                    <CarouselItem key={index} className="relative aspect-[4/5] w-full h-full">
                                        <Image
                                            src={resolveMediaUrl(src)}
                                            alt={`${name} - Image ${index + 1}`}
                                            fill
                                            className="object-cover object-top"
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {/* Small Navigation Arrows inside the image area */}
                            <div className="hidden group-hover:block transition-opacity duration-200">
                                <CarouselPrevious className="left-2 bg-background/50 hover:bg-background/80 border-none h-8 w-8 text-foreground/80" />
                                <CarouselNext className="right-2 bg-background/50 hover:bg-background/80 border-none h-8 w-8 text-foreground/80" />
                            </div>
                        </Carousel>
                    ) : (
                        <Image
                            src={resolveMediaUrl(displayImages[0])}
                            alt={name || "Product Preview"}
                            fill
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                    )}

                    {/* Badge - Removed NEW */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2 z-20 pointer-events-none">
                    </div>

                    {/* Quick Actions (Wishlist) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                        <button
                            className="p-2 bg-background/95 hover:bg-background rounded-full transition-all shadow-sm active:scale-95"
                            disabled
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="block">
                <h3 className="font-medium text-xs md:text-sm leading-tight mb-1 md:mb-2 transition-colors line-clamp-2">
                    {name || "Product Name"}
                </h3>


                {/* Reviews - Always visible */}
                <div className="flex items-center gap-1 mb-1.5 md:mb-2">
                    <StarRating
                        rating={0}
                        size="sm"
                    />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground">
                        (0)
                    </span>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-3 md:mb-4">
                    <span className="font-bold text-xs md:text-base">₹{displayPrice.toLocaleString()}</span>
                    {displayRegular && displayRegular > displayPrice && (
                        <>
                            <span className="text-[9px] md:text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                                ₹{displayRegular.toLocaleString()}
                            </span>
                            <span className="text-red-600 text-[9px] md:text-[10px] font-bold">
                                -{Math.round(((displayRegular - displayPrice) / displayRegular) * 100)}%
                            </span>
                        </>
                    )}
                </div>

                {/* Persistent Action Buttons - Asymmetric Layout */}
                <div className="flex gap-1.5 md:gap-2 mb-4">
                    <button
                        className="w-10 md:w-12 bg-primary text-primary-foreground py-2 sm:py-2.5 flex items-center justify-center transition-all rounded-sm active:scale-95 shadow-sm"
                        disabled
                    >
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                        className="flex-1 bg-background border border-primary text-primary py-2 sm:py-2.5 px-3 text-[10px] md:text-xs font-bold transition-all rounded-sm active:scale-95 shadow-sm uppercase tracking-wider"
                        disabled
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    )
}
