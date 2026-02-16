import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductPreviewCardProps {
    images: string[]
    name: string
    category: string
    price: string
    stock: string
}

export function ProductPreviewCard({ images, name, category, price, stock }: ProductPreviewCardProps) {
    const displayPrice = price ? parseFloat(price) : 0
    const displayImages = images.length > 0 ? images : ["/placeholder.svg"]

    return (
        <div className="group relative w-full">
            <div className="relative w-full mb-4">
                <div className="aspect-[3/4] overflow-hidden bg-muted rounded-sm relative">
                    {displayImages.length > 1 ? (
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {displayImages.map((src, index) => (
                                    <CarouselItem key={index} className="relative aspect-[3/4] w-full h-full">
                                        <Image
                                            src={src}
                                            alt={`${name} - Image ${index + 1}`}
                                            fill
                                            className="object-cover"
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
                            src={displayImages[0]}
                            alt={name || "Product Preview"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex-col gap-1 z-10 max-w-[calc(100%-3rem)] hidden md:flex pointer-events-none">
                        <span className="bg-foreground text-background text-xs px-2 py-1 font-medium rounded-sm whitespace-nowrap inline-block">
                            NEW
                        </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button
                            className="p-2 bg-background/90 hover:bg-background rounded-full transition-colors shadow-sm"
                            disabled
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                        <button
                            className="w-full bg-background/95 hover:bg-background py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors rounded-sm"
                            disabled
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            <div className="block">
                <h3 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {name || "Product Name"}
                </h3>

                {/* Reviews */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-3 h-3"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        (0)
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">₹{displayPrice.toLocaleString()}</span>
                </div>
                {/* Stock Category Helper */}
                <div className="mt-1 text-xs text-muted-foreground flex gap-2">
                    <span>{category || "Category"}</span>
                    <span>•</span>
                    <span>Stock: {stock || "0"}</span>
                </div>
            </div>
        </div>
    )
}
