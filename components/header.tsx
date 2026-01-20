"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search, ShoppingBag, User, Heart, ChevronDown } from "lucide-react"
import { useCart } from "@/context/cart-context"
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
  { name: "Handloom", href: "/collections/handloom" },
  { name: "Bridal", href: "/collections/banarasi-silk" },
  { name: "Sale", href: "/collections/sale" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { totalItems, setIsCartOpen, isHydrated } = useCart()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top Bar */}
      <div className="bg-foreground text-background text-center py-2 px-4 text-xs tracking-wide">
        Free Shipping on orders above ₹2999 | Hassle-Free Returns within 7 Days
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
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
            <nav className="hidden lg:flex items-center gap-6 ml-8">
              {navLinks.slice(0, 3).map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={link.href}
                    className="text-sm font-sans tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
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
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.slice(3).map((link) => (
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
              <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="hidden sm:block p-2 hover:bg-muted rounded-full transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/account" className="hidden sm:block p-2 hover:bg-muted rounded-full transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
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
          "lg:hidden fixed inset-x-0 top-[104px] bg-background border-b border-border transition-all duration-300 overflow-hidden",
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "text-lg font-sans tracking-wide text-foreground/80 hover:text-foreground transition-colors py-2 block",
                  link.name === "Sale" && "text-destructive"
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
    </header>
  )
}
