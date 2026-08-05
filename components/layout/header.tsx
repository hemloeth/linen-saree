"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search, ShoppingBag, User, Heart, ChevronDown } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useAuth } from "@/context/auth-context"
import { SearchModal } from "@/components/search/search-modal"
import { TrustBadgesCompact } from "@/components/common/trust-badges"
import { cn } from "@/lib/utils"
import { apiGet } from "@/lib/api"

type NavLink = {
  name: string
  href: string
  submenu?: { name: string; href: string }[]
}

  {
    name: "Categories",
    href: "/categories",
    submenu: [] // Handled dynamically in the component
  },
  {
    name: "New Arrivals",
    href: "/categories/new-arrivals",
  },
  {
    name: "Collections",
    href: "/collections",
    submenu: [] // Handled dynamically in the component
  },
  { name: "Video Collection", href: "/video-collection" },
  { name: "Blog", href: "/blog" },
  { name: "Handloom", href: "/categories/handloom" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "Sale", href: "/categories/sale" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const toggleExpandedMenu = (menuName: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }))
  }
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [marketingCollections, setMarketingCollections] = useState<any[]>([])
  const [headerCategories, setHeaderCategories] = useState<any[]>([])
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)
  const { totalItems, setIsCartOpen, isHydrated } = useCart()
  const { totalItems: wishlistItems, isHydrated: wishlistHydrated } = useWishlist()
  const { isAuthenticated, isHydrated: authHydrated, user, logout } = useAuth()

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await apiGet('/api/marketing-collections')
        if (response.success && response.data) {
          // Only include the 3 main marketing collections (exclude 'none')
          const filtered = response.data.filter((col: any) => col.key !== 'none')
          setMarketingCollections(filtered)
        }
      } catch (error: any) {
        console.warn("Failed to fetch marketing collections, using default fallback. Message:", error.message || error)
      }
    }
    fetchCollections()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiGet('/api/category/allcategory')
        if (response.categories) {
          setHeaderCategories(response.categories)
        }
      } catch (error) {
        console.warn("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

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

  // Track header height dynamically for other components to use
  useEffect(() => {
    const headerEl = document.getElementById('main-header')
    if (!headerEl) return

    const updateHeight = () => {
      document.documentElement.style.setProperty('--header-offset', `${headerEl.offsetHeight}px`)
    }

    // Initial set
    updateHeight()

    // Observe size changes (e.g. closing announcement bar or resizing window)
    const observer = new ResizeObserver(updateHeight)
    observer.observe(headerEl)

    return () => observer.disconnect()
  }, [])

  return (
    <header id="main-header" className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top Bar */}
      {isAnnouncementVisible && (
        <div className="bg-foreground text-background overflow-hidden relative">
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-2 pr-8 sm:pr-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 text-center sm:text-left">
              <div className="text-[10px] sm:text-xs tracking-wide leading-tight">
                Free Shipping on orders above ₹999 | Hassle-Free Returns within 7 Days
              </div>
              <TrustBadgesCompact className="hidden md:flex text-background/90" />
            </div>
            {/* Mobile Trust Badges - Hidden on very small screens or made even more compact */}
            <div className="md:hidden pt-1.5 border-t border-background/20 mt-1.5 overflow-hidden">
              <TrustBadgesCompact className="text-background/90 justify-center gap-2" />
            </div>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="absolute right-2 top-2 sm:top-1/2 sm:-translate-y-1/2 p-1 text-background/60 hover:text-background transition-colors"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
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
                src="/logo.jpg"
                alt="Linen Sarees"
                width={80}
                height={40}
                className="h-8 lg:h-10 w-auto object-contain mix-blend-multiply"
                priority
              />
            </Link>

            {/* Desktop Navigation Left */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 ml-8">
              {navLinks.slice(0, 4).map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => ((link.submenu?.length ?? 0) > 0 || link.name === "Collections" || link.name === "Categories") && setActiveSubmenu(link.name)}
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
                    {((link.submenu?.length ?? 0) > 0 || link.name === "Collections" || link.name === "Categories") && <ChevronDown className="w-3 h-3" />}
                  </Link>

                  {/* Submenu */}
                  {link.name === "Collections" && activeSubmenu === "Collections" && (
                    <div className="absolute top-full left-0 pt-2 w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-background border border-border shadow-xl rounded-md overflow-hidden">
                        <div className="p-2 space-y-1">
                          {marketingCollections.map((col) => (
                            <Link
                              key={col.key}
                              href={`/collections/${col.key}`}
                              className="group/item flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 rounded-sm transition-all duration-200"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground group-hover/item:text-primary transition-colors">
                                  {col.name}
                                </span>
                                {col.tagline && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {col.tagline}
                                  </span>
                                )}
                              </div>
                              <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {link.name === "Categories" && activeSubmenu === "Categories" && (
                    <div className="absolute top-full left-0 pt-2 w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-background border border-border shadow-xl rounded-md overflow-hidden">
                        <div className="p-2 space-y-1">
                          <Link
                            href="/categories"
                            className="group/item flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 rounded-sm transition-all duration-200 font-medium text-foreground"
                          >
                            All Categories
                          </Link>
                          {headerCategories.map((cat) => {
                            const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                            return (
                              <Link
                                key={cat._id || slug}
                                href={`/categories/${slug}`}
                                className="group/item flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 rounded-sm transition-all duration-200"
                              >
                                <span className="font-medium text-foreground group-hover/item:text-primary transition-colors">
                                  {cat.name}
                                </span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {link.submenu && link.name !== "Collections" && link.name !== "Categories" && activeSubmenu === link.name && (
                    <div className="absolute top-full left-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-background border border-border shadow-lg py-2 min-w-[200px] rounded-md">
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


          {/* Right Side - Navigation and Icons */}
          <div className="flex items-center gap-1 sm:gap-4 relative z-20">
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
            <div className="flex items-center gap-0.5 sm:gap-2">
              <button
                className="hidden sm:flex p-2 hover:bg-muted rounded-full transition-colors group relative"
                aria-label="Search (Ctrl+K)"
                onClick={() => setIsSearchOpen(true)}
                title="Search (Ctrl+K)"
                suppressHydrationWarning
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative" aria-label="Wishlist" suppressHydrationWarning>
                <Heart className="w-5 h-5" />
                {wishlistHydrated && wishlistItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs flex items-center justify-center rounded-full">
                    {wishlistItems}
                  </span>
                )}
              </Link>
              <div className="relative group">
                <Link href={authHydrated && isAuthenticated ? "/account" : "/account/login"} className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors flex items-center" aria-label="Account" suppressHydrationWarning>
                  <User className="w-5 h-5" />
                </Link>
                {/* Desktop dropdown - only show on hover for larger screens */}
                <div className="hidden sm:block absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-background border border-border shadow-lg py-2 min-w-[160px]">
                    {authHydrated && isAuthenticated ? (
                      <>
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
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => { logout(); window.location.href = '/account/login'; }}
                          className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account/login"
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          href="/account/login"
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative"
                aria-label="Cart"
                onClick={() => setIsCartOpen(true)}
                suppressHydrationWarning
              >
                <ShoppingBag className="w-5 h-5" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs flex items-center justify-center rounded-full">
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
          "lg:hidden fixed inset-x-0 bg-background border-b border-border transition-all duration-300 flex flex-col",
          isMenuOpen ? "max-h-[calc(100dvh-var(--header-offset,120px))] h-[calc(100dvh-var(--header-offset,120px))] opacity-100" : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
        )}
        style={{ top: 'var(--header-offset, 120px)' }}
      >
        {/* Primary Navigation Area */}
        <div className="flex-1 overflow-y-auto pb-4">
          <nav className="px-4 pt-6 flex flex-col gap-1">


            {/* Main Navigation Links */}
            {navLinks.map((link) => {
              const hasSubmenu = (link.submenu?.length ?? 0) > 0 || link.name === "Collections" || link.name === "Categories"
              const isExpanded = !!expandedMenus[link.name]

              return (
                <div key={link.name} className="border-b border-border/50 last:border-0">
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleExpandedMenu(link.name)}
                      className="w-full flex items-center justify-between py-4 text-base font-sans tracking-wide text-foreground hover:text-primary transition-colors"
                    >
                      <span className={cn(
                        link.name === "Sale" && "text-destructive",
                        link.name === "Best Sellers" && "text-primary font-medium"
                      )}>
                        {link.name}
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "block py-4 text-base font-sans tracking-wide text-foreground hover:text-primary transition-colors",
                        link.name === "Sale" && "text-destructive",
                        link.name === "Best Sellers" && "text-primary font-medium"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* Submenu Accordion */}
                  {hasSubmenu && (
                    <div className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        <div className="pb-4 pl-4 space-y-1 border-l-2 border-border/50 ml-2 mb-2">
                          {link.name === "Collections" ? (
                            marketingCollections.map((col) => (
                              <Link
                                key={col.key}
                                href={`/collections/${col.key}`}
                                className="block py-2.5 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {col.name}
                              </Link>
                            ))
                          ) : link.name === "Categories" ? (
                            <>
                              <Link
                                href="/categories"
                                className="block py-2.5 px-3 rounded-md text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                All Categories
                              </Link>
                              {headerCategories.map((cat) => {
                                const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                                return (
                                  <Link
                                    key={cat._id || slug}
                                    href={`/categories/${slug}`}
                                    className="block py-2.5 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {cat.name}
                                  </Link>
                                )
                              })}
                            </>
                          ) : (
                            link.submenu?.map((sublink) => (
                              <Link
                                key={sublink.name}
                                href={sublink.href}
                                className="block py-2.5 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sublink.name}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>


      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
