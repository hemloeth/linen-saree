"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, X, Minus, Plus, Trash2 } from "lucide-react"
import type { Product } from "@/lib/products"
import { useCart } from "@/context/cart-context"

interface CheckoutProductMediaProps {
  product: Product
  quantity: number
}

type MediaItem = {
  type: 'image' | 'video'
  src: string
  alt?: string
}

export function CheckoutProductMedia({ product, quantity }: CheckoutProductMediaProps) {
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { updateQuantity, removeFromCart } = useCart()

  // Combine images and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...product.images.map(img => ({ type: 'image' as const, src: img, alt: product.name })),
    ...(product.videos || []).map(video => ({ type: 'video' as const, src: video, alt: `${product.name} video` }))
  ]

  const handleMediaClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="flex gap-4">
        <Link href={`/product/${product.slug}`} className="relative w-16 h-20 flex-shrink-0 bg-muted block">
          {mediaItems[0]?.type === 'image' ? (
            <Image
              src={mediaItems[0]?.src || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              <video
                src={mediaItems[0]?.src}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
            <p className="text-sm font-medium line-clamp-2">{product.name}</p>
          </Link>
          <p className="text-xs text-muted-foreground">{product.color}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <p className="font-medium">
            ₹{(product.price * quantity).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (quantity <= 1) {
                  removeFromCart(product.id)
                } else {
                  updateQuantity(product.id, quantity - 1)
                }
              }}
              className="w-6 h-6 flex items-center justify-center border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors"
            >
              {quantity <= 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </button>
            <span className="text-sm text-primary font-medium min-w-[16px] text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-6 h-6 flex items-center justify-center border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">{product.name}</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-4">
                {/* Thumbnails */}
                <div className="flex flex-col gap-2 w-20">
                  {mediaItems.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMedia(index)}
                      className={`relative w-16 h-20 flex-shrink-0 border-2 transition-colors ${selectedMedia === index ? "border-primary" : "border-transparent"
                        }`}
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={media.src || "/placeholder.svg"}
                          alt={media.alt || `${product.name} view ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={media.src}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Main Media */}
                <div className="flex-1 relative aspect-[4/5] max-h-[60vh] bg-muted">
                  {mediaItems[selectedMedia]?.type === 'image' ? (
                    <Image
                      src={mediaItems[selectedMedia]?.src || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={mediaItems[selectedMedia]?.src}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
