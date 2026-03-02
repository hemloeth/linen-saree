"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { CategoryProvider } from "@/context/category-context"
import { ProductProvider } from "@/context/product-context"
import { BlogProvider } from "@/context/blog-context"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <CategoryProvider>
            <ProductProvider>
                <BlogProvider>
                    <div className="flex min-h-screen bg-muted/40" data-lenis-prevent>
                        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
                            <div className="sticky top-0 z-30 w-full">
                                <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                            </div>
                            <main className="flex-1 p-4 md:p-6 w-full object-contain">
                                {children}
                            </main>
                        </div>
                    </div>
                </BlogProvider>
            </ProductProvider>
        </CategoryProvider>
    )
}
