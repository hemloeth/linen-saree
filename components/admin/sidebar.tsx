"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Images, FileText, Users, TicketPercent, X } from "lucide-react"
import { cn } from "@/lib/utils"
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
                title: "Marketing Collections",
                href: "/admin/marketing-collections",
                icon: Images,
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

// Motion constants (Supabase-like: thin panel glide, no bounce)
const RAIL_WIDTH = 56      // collapsed icon rail
const PANEL_WIDTH = 240    // expanded overlay panel
const EASE = [0.2, 0, 0, 1] as const
const DURATION = 0.2
const OPEN_DELAY = 100     // ms of hover before expanding
const CLOSE_DELAY = 180    // ms after leaving before collapsing

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const prefersReducedMotion = useReducedMotion()

    const [hoverOpen, setHoverOpen] = useState(false)
    const [focusOpen, setFocusOpen] = useState(false)

    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const dismissedRef = useRef(false) // Escape temporarily locks the panel closed

    const expanded = hoverOpen || focusOpen
    const instant = prefersReducedMotion ? 0 : DURATION

    // Shared animation variants; `custom` = 0 when reduced motion is preferred
    const container = {
        open: { width: PANEL_WIDTH, boxShadow: "4px 0 12px -6px rgba(0,0,0,0.15)", transition: { duration: instant, ease: EASE } },
        closed: { width: RAIL_WIDTH, boxShadow: "0 0 0 0 rgba(0,0,0,0)", transition: { duration: instant, ease: EASE } },
    }
    const labelMotion = {
        open: { opacity: 1, x: 0, pointerEvents: "auto" as const, transition: { duration: instant, ease: EASE } },
        closed: { opacity: 0, x: prefersReducedMotion ? 0 : 4, pointerEvents: "none" as const, transition: { duration: instant, ease: EASE } },
    }
    const motionCustom = prefersReducedMotion ? 0 : 1

    const clearTimers = useCallback(() => {
        if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null }
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    }, [])

    useEffect(() => clearTimers, [clearTimers])

    const handleEnter = () => {
        // Rail + panel are one continuous hover area — entering cancels any close
        clearTimers()
        if (dismissedRef.current) return
        if (!expanded) {
            openTimer.current = setTimeout(() => setHoverOpen(true), OPEN_DELAY)
        } else {
            // Already open (e.g. focus) — make sure hover keeps it open too
            setHoverOpen(true)
        }
    }

    const handleLeave = () => {
        clearTimers()
        dismissedRef.current = false // re-arm hover for the next entry
        closeTimer.current = setTimeout(() => setHoverOpen(false), CLOSE_DELAY)
    }

    const handleEscaped = (e: React.KeyboardEvent) => {
        if (e.key !== "Escape") return
        dismissedRef.current = true
        clearTimers()
        setHoverOpen(false)
        setFocusOpen(false)
        ;(e.currentTarget as HTMLElement).querySelector<HTMLElement>("a, button")?.focus()
    }

    const handleBlur = (e: React.FocusEvent) => {
        // Keep expanded while focus moves within the sidebar
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setFocusOpen(false)
        }
    }

    const renderContent = (forceOpen: boolean) => {
        const show = forceOpen || expanded
        return (
        <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-4">
                <nav id="admin-nav" className={cn("flex flex-col items-start text-sm font-medium", expanded ? "gap-6" : "gap-2")} style={{ width: PANEL_WIDTH - 8 }} onMouseLeave={handleLeave}>
                    {sidebarSections.map((section) => (
                        <div key={section.label} className="w-full grid gap-0.5 px-2">
                            <motion.h3
                                className={cn("px-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 whitespace-nowrap overflow-hidden", expanded ? "mb-2" : "mb-0")}
                                variants={labelMotion}
                                initial={show ? "open" : "closed"}
                                animate={show ? "open" : "closed"}
                                custom={motionCustom}
                            >
                                {section.label}
                            </motion.h3>
                            <div className="grid gap-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-label={item.title}
                                            aria-current={isActive ? "page" : undefined}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) onClose()
                                            }}
                                            className={cn(
                                                "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:text-primary overflow-hidden",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active-pill"
                                                    className="absolute inset-0 rounded-lg bg-muted"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 350,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active-bar"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 350,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                            <item.icon className="relative z-10 h-4 w-4 shrink-0" />
                                            <motion.span
                                                className="relative z-10 whitespace-nowrap overflow-hidden"
                                                variants={labelMotion}
                                                initial={show ? "open" : "closed"}
                                                animate={show ? "open" : "closed"}
                                                custom={motionCustom}
                                            >
                                                {item.title}
                                            </motion.span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t p-2 flex justify-center">
                <Button
                    variant="outline"
                    aria-label="Logout"
                    className={cn(
                        "justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-colors shrink-0",
                        show ? "w-full" : "h-9 w-9 p-0 justify-center"
                    )}
                    onClick={() => {
                        localStorage.removeItem("auth_user")
                        window.location.href = "/admin"
                    }}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <motion.span
                        className="whitespace-nowrap overflow-hidden"
                        variants={labelMotion}
                        initial={show ? "open" : "closed"}
                        animate={show ? "open" : "closed"}
                        custom={motionCustom}
                    >
                        Logout
                    </motion.span>
                </Button>
            </div>
        </>
        )
    }

    return (
        <>
            {/* Desktop Sidebar — collapsed rail that expands OVER content on hover */}
            <motion.aside
                initial={false}
                animate={expanded ? "open" : "closed"}
                variants={container}
                className="hidden lg:flex fixed top-16 bottom-0 left-0 flex-col border-r bg-card shrink-0 z-40 overflow-hidden"
                onMouseEnter={handleEnter}
                onFocus={handleEnter}
                onBlur={handleBlur}
                onKeyDown={handleEscaped}
                data-lenis-prevent
                suppressHydrationWarning
            >
                {renderContent(false)}
            </motion.aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar (Drawer) — unchanged behavior */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card lg:hidden overflow-hidden"
                    >
                        <div className="flex h-12 shrink-0 items-center justify-end border-b px-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                aria-label="Close sidebar"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        {renderContent(true)}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    )
}
