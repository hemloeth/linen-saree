"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose()
                            }}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
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
            <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card shrink-0 sticky top-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {sidebarContent}
            </aside>
        </>
    )
}
