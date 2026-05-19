"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()

    const sidebarContent = (
        <>
            <div className="flex h-16 items-center justify-between border-b px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold" onClick={onClose}>
                    <span className="text-xl font-serif text-primary">Linen Saree Admin</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close sidebar</span>
                </Button>
            </div>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid items-start px-4 text-sm font-medium gap-8">
                    {sidebarSections.map((section) => (
                        <div key={section.label} className="grid gap-1">
                            <h3 className="px-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 mb-2">
                                {section.label}
                            </h3>
                            <div className="grid gap-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) onClose()
                                            }}
                                            className={cn(
                                                "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:text-primary",
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
                                            <item.icon className="relative z-10 h-4 w-4" />
                                            <span className="relative z-10">{item.title}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-colors"
                    onClick={() => {
                        localStorage.removeItem("auth_token")
                        localStorage.removeItem("auth_user")
                        window.location.href = "/admin"
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar (Permanent) */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 h-screen w-64 flex-col border-r bg-card shrink-0 z-40" suppressHydrationWarning>
                {sidebarContent}
            </aside>

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

            {/* Mobile Sidebar (Drawer) */}
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
                        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card lg:hidden"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    )
}
