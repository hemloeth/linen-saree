"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search, ShoppingBag, User, Heart, ChevronDown } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { SearchModal } from "@/components/search-modal"
import { cn } from "@/lib/utils"

const navLinks = [
  { 
    name: "New Arrivals", 
    href: "/collections/new-arrivals",
  },
  { 
    name: "Collections", 
    href: "/collections",
    submenu: [
      { name: "Pure Linen", href: "/collections/pure-linen" },
      { name: "Banarasi Silk", href: "/collections/banarasi-silk" },
      { name: "Handloom", href: "/collections/handloom" },
      { name: "Silk Linen", href: "/collections/silk-linen" },
      { name: "Embroidery", href: "/collections/embroidery" },
      { name: "Cotton Linen", href: "/collections/cotton-linen" },
    ]
  },
  { name: "Video Collection", href: "/video-collection" },
  { name: "Blog", href: "/blog" },
  { name: "Handloom", href: "/collections/handloom" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "Sale", href: "/collections/sale" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems, setIsCartOpen, isHydrated } = useCart()
  const { totalItems: wishlistItems, isHydrated: wishlistHydrated } = useWishlist()

  // Handle keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top Bar */}
      <div className="bg-foreground text-background text-center py-2 px-4 text-xs tracking-wide">
        Free Shipping on orders above ₹999 | Hassle-Free Returns within 7 Days
      </div>
      
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Left Side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/linen-saree-logo.png"
                alt="Linen Sarees"
                width={80}
                height={40}
                className="h-8 lg:h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation Left */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 ml-8">
              {navLinks.slice(0, 4).map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-sans tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1",
                      link.name === "Best Sellers" && "text-primary hover:text-primary/80 font-medium"
                    )}
                  >
                    {link.name}
                    {link.submenu && <ChevronDown className="w-3 h-3" />}
                  </Link>
                  
                  {/* Submenu */}
                  {link.submenu && activeSubmenu === link.name && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="bg-background border border-border shadow-lg py-4 min-w-[200px]">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.name}
                            href={sublink.href}
                            className="block px-6 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Center - Brand Name */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="font-serif text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
              Linen Sarees
            </span>
          </Link>

          {/* Right Side - Navigation and Icons */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation Right */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {navLinks.slice(4).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-sans tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors",
                    link.name === "Sale" && "text-destructive hover:text-destructive/80"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                className="p-2 hover:bg-muted rounded-full transition-colors group relative" 
                aria-label="Search (Ctrl+K)"
                onClick={() => setIsSearchOpen(true)}
                title="Search (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="p-2 hover:bg-muted rounded-full transition-colors relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistHydrated && wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                    {wishlistItems}
                  </span>
                )}
              </Link>
              <div className="relative group">
                <Link href="/account" className="p-2 hover:bg-muted rounded-full transition-colors flex items-center" aria-label="Account">
                  <User className="w-5 h-5" />
                </Link>
                {/* Desktop dropdown - only show on hover for larger screens */}
                <div className="hidden sm:block absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-background border border-border shadow-lg py-2 min-w-[160px]">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/track-order"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
              <button 
                className="p-2 hover:bg-muted rounded-full transition-colors relative" 
                aria-label="Cart"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-5 h-5" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-[96px] bg-background border-b border-border transition-all duration-300 overflow-hidden",
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-6 flex flex-col gap-2">
          {/* Mobile Search */}
          <button
            onClick={() => {
              setIsSearchOpen(true)
              setIsMenuOpen(false)
            }}
            className="flex items-center gap-3 text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2"
          >
            <Search className="w-5 h-5" />
            Search Products
          </button>

          {/* Mobile Account Links */}
          <div className="border-t border-border pt-4 mt-2">
            <Link
              href="/account"
              className="text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              My Account
            </Link>
            <Link
              href="/orders"
              className="text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              My Orders
            </Link>
            <Link
              href="/track-order"
              className="text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              href="/wishlist"
              className="text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
            </Link>
          </div>
          
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block",
                  link.name === "Sale" && "text-destructive",
                  link.name === "Best Sellers" && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
              {link.submenu && (
                <div className="pl-4 border-l border-border ml-2">
                  {link.submenu.map((sublink) => (
                    <Link
                      key={sublink.name}
                      href={sublink.href}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {sublink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
