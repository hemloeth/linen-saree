import React from "react"
import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { AuthProvider } from "@/context/auth-context"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { CartToast } from "@/components/cart/cart-toast"
import WhatsAppFloat from "@/components/common/whatsapp-float"
import { ClientOnly } from "@/components/common/client-only"
import SmoothScroll from "@/components/common/smooth-scroll"
import { ProductProvider } from "@/context/product-context"
import { fetchProductsFromDB } from "@/lib/products"
import { Toaster } from "sonner"
import './globals.css'

// Removed force-dynamic to allow Next.js static rendering and caching

const _cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
})

const _montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"]
})

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 'https://linensarees.com';
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return new URL(url);
}

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: 'The Handloomer | Authentic Handcrafted Pure Linen Sarees',
  description: 'Discover the exquisite collection of authentic handwoven pure linen and handloom sarees. Handcrafted elegance for the modern woman by The Handloomer.',
  generator: 'v0.app',
  icons: {
    icon: '/faveicon.jpg',
    apple: '/faveicon.jpg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch products on the Server to preserve SEO
  const initialProducts = await fetchProductsFromDB()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SmoothScroll>
          <AuthProvider>
            <ProductProvider initialProducts={initialProducts}>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <ClientOnly>
                    <CartToast />
                    <CartSidebar />
                    <WhatsAppFloat />
                  </ClientOnly>
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </SmoothScroll>
        <Analytics />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
