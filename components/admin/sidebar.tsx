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

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Festive Banner",
        href: "/admin/festive-banner",
        icon: Images,
    },
    {
        title: "Sale Banner",
        href: "/admin/festive-sale",
        icon: TicketPercent,
    },
    {
        title: "Category Banners",
        href: "/admin/category-banners",
        icon: LayoutDashboard,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Media",
        href: "/admin/media",
        icon: Images,
    },
    {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        title: "Coupons",
        href: "/admin/coupons",
        icon: TicketPercent,
    },
    {
        title: "Blog",
        href: "/admin/blog",
        icon: FileText,
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
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Hero Section",
        href: "/admin/hero",
        icon: Images,
    },
]

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()

    const sidebarContent = (
        <>
            <div className="flex h-16 items-center justify-between border-b px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold" onClick={onClose}>
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
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium gap-0.5">
                    {sidebarItems.map((item) => {
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
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <Link href="/admin/login">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Link>
                </Button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar (Permanent) */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 h-screen w-64 flex-col border-r bg-card shrink-0 z-40">
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
