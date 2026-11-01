"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    LogOut,
    Plus,
    Images,
    FileText,
    Users,
    TicketPercent,
    X,
    Sparkles,
    Star,
    Tag
} from "lucide-react"
import { cn } from "@/lib/utils"
import { clearAdminToken } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
}

const sidebarSections = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/admin/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Orders",
                href: "/admin/orders",
                icon: ShoppingCart,
            },
            {
                title: "Customers",
                href: "/admin/customers",
                icon: Users,
            },
        ]
    },
    {
        label: "Catalog",
        items: [
            {
                title: "Products",
                href: "/admin/products",
                icon: Package,
            },
            {
                title: "Categories",
                href: "/admin/categories",
                icon: Package,
            },
            {
                title: "Add Product",
                href: "/admin/add-product",
                icon: Plus,
            },
        ]
    },
    {
        label: "Promotions & UI",
        items: [
            {
                title: "Hero Section",
                href: "/admin/hero",
                icon: Images,
            },
            {
                title: "Homepage Banners",
                href: "/admin/marketing-collections",
                icon: Images,
            },
            {
                title: "Festive Collection",
                href: "/admin/marketing-collections?tab=festive",
                icon: Sparkles,
            },
            {
                title: "Big Sale Banner",
                href: "/admin/marketing-collections?tab=big-sale",
                icon: Tag,
            },
            {
                title: "Dress Like a Star",
                href: "/admin/marketing-collections?tab=celebrity",
                icon: Star,
            },
            {
                title: "Category Banners",
                href: "/admin/category-banners",
                icon: LayoutDashboard,
            },
        ]
    },
    {
        label: "Marketing & Content",
        items: [
            {
                title: "Blog",
                href: "/admin/blog",
                icon: FileText,
            },
            {
                title: "Coupons",
                href: "/admin/coupons",
                icon: TicketPercent,
            },
            {
                title: "Media",
                href: "/admin/media",
                icon: Images,
            },
        ]
    },
]

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const [currentSearch, setCurrentSearch] = useState("")
    const [isHovered, setIsHovered] = useState(false)
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentSearch(window.location.search)
        }
    }, [pathname])

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = setTimeout(() => {
            setIsHovered(false)
        }, 220)
    }

    const isItemActive = (href: string) => {
        const [itemPath, itemQuery] = href.split('?')
        if (itemPath !== pathname) return false

        if (itemQuery) {
            const itemParams = new URLSearchParams(itemQuery)
            const activeParams = new URLSearchParams(currentSearch)
            return itemParams.get('tab') === activeParams.get('tab')
        } else {
            const activeParams = new URLSearchParams(currentSearch)
            const tab = activeParams.get('tab')
            if (tab && ['festive', 'big-sale', 'celebrity'].includes(tab)) return false
            return true
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("auth_user")
        clearAdminToken()
        window.location.href = "/admin"
    }

    const renderNav = (isMobile: boolean = false) => {
        const expanded = isMobile || isHovered

        return (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden py-4 px-2.5 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <nav className="space-y-5">
                    {sidebarSections.map((section) => (
                        <div key={section.label} className="space-y-1">
                            {expanded ? (
                                <h3 className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70 select-none animate-in fade-in duration-150 whitespace-nowrap">
                                    {section.label}
                                </h3>
                            ) : (
                                <div className="h-2" />
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = isItemActive(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-label={item.title}
                                            aria-current={isActive ? "page" : undefined}
                                            title={!expanded ? item.title : undefined}
                                            onClick={() => {
                                                if (isMobile) onClose()
                                            }}
                                            className={cn(
                                                "group relative flex items-center rounded-lg text-sm font-medium transition-colors select-none",
                                                !expanded
                                                    ? "justify-center p-2.5 h-10 w-11 mx-auto"
                                                    : "gap-3.5 px-3.5 py-2.5",
                                                isActive
                                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                                    : "text-muted-foreground hover:bg-muted/90 hover:text-foreground active:scale-[0.98]"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            )} />
                                            {expanded && (
                                                <span className="truncate whitespace-nowrap animate-in fade-in duration-150">
                                                    {item.title}
                                                </span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Controls: Logout */}
                <div className="pt-4 border-t">
                    <Button
                        variant="outline"
                        aria-label="Logout"
                        className={cn(
                            "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-colors cursor-pointer w-full",
                            !expanded ? "p-0 h-10 w-11 mx-auto justify-center" : "justify-start gap-2.5 px-3.5"
                        )}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut className="h-4.5 w-4.5 shrink-0" />
                        {expanded && <span className="animate-in fade-in duration-150">Logout</span>}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Desktop Collapsible Hover Sidebar: rail by default (w-16), expands to fat (280px) over content on hover */}
            <aside
                className={cn(
                    "hidden lg:flex fixed top-16 bottom-0 left-0 flex-col border-r bg-card z-40 transition-all duration-200 ease-out overflow-hidden",
                    isHovered ? "w-[280px] shadow-2xl" : "w-16 shadow-none"
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-lenis-prevent
            >
                {renderNav(false)}
            </aside>

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Slide-Over Drawer: fat 280px width */}
            {isOpen && (
                <aside
                    className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r bg-card lg:hidden shadow-2xl animate-in slide-in-from-left duration-200"
                    data-lenis-prevent
                >
                    <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-serif font-bold text-primary">The Handloomer</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            aria-label="Close sidebar"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4.5 w-4.5" />
                        </Button>
                    </div>
                    {renderNav(true)}
                </aside>
            )}
        </>
    )
}
