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
                    <div className="flex h-screen overflow-hidden bg-muted/40" data-lenis-prevent>
                        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                            <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                            <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-4rem)]">
                                {children}
                            </main>
                        </div>
                    </div>
                </BlogProvider>
            </ProductProvider>
        </CategoryProvider>
    )
}
