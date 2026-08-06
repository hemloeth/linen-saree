"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { PageTransition } from "@/components/admin/page-transition"
import { CategoryProvider } from "@/context/category-context"
import { ProductProvider } from "@/context/product-context"
import { BlogProvider } from "@/context/blog-context"
import { apiGet } from "@/lib/api"
import { Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isAuthorizing, setIsAuthorizing] = useState(true)
    const [authError, setAuthError] = useState<string | null>(null)

    useEffect(() => {
        const verifyAdminSession = async () => {
            const userStr = localStorage.getItem("auth_user")

            // 1. Check local credentials existence
            if (!userStr) {
                console.log("[Admin Guard] Missing administrator account, redirecting to login.");
                router.push("/admin")
                return
            }

            try {
                const user = JSON.parse(userStr)
                if (user.role !== "admin") {
                    throw new Error("Account does not possess administrator privileges.")
                }

                // 2. Perform live token verification against the secure backend
                const res = await apiGet<{ success: boolean; user: any }>("/api/admin-auth/verify-token")

                if (res.success) {
                    setIsAuthorizing(false)
                } else {
                    throw new Error("Backend verification failed.")
                }
            } catch (err: any) {
                console.error("[Admin Guard Error]:", err)
                
                // Clear potentially compromised/expired storage
                localStorage.removeItem("auth_user")
                
                setAuthError(err.message || "Session expired. Please log in again.")
                toast.error(err.message || "Administrative session expired. Please log in again.")
                
                setTimeout(() => {
                    router.push("/admin")
                }, 2000)
            }
        }

        verifyAdminSession()
    }, [router])

    if (authError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4 animate-bounce">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <h1 className="text-xl font-serif font-bold text-primary mb-2">Access Denied</h1>
                <p className="text-sm text-muted-foreground max-w-xs">{authError}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8B7355] font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Redirecting to portal...
                </div>
            </div>
        )
    }

    if (isAuthorizing) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-center overflow-hidden">
                {/* Visual Premium Accents */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5DED6] opacity-30 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B7355] opacity-10 blur-[120px]" />
                
                <div className="relative z-10 space-y-6">
                    {/* Golden luxury loader ring */}
                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-[#E5DED6]" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#8B7355] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                        <ShieldAlert className="h-6 w-6 text-[#8B7355]/60 animate-pulse" />
                    </div>
                    
                    <div className="space-y-1">
                        <h2 className="text-lg font-serif font-semibold text-primary tracking-wide">
                            Authorizing Session
                        </h2>
                        <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">
                            Establishing Secure Encryption
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <CategoryProvider>
            <ProductProvider>
                <BlogProvider>
                    <div className="flex min-h-screen bg-muted/40" data-lenis-prevent>
                        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        <div className="flex flex-1 flex-col min-w-0 lg:pl-52">
                            <div className="sticky top-0 z-30 w-full">
                                <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                            </div>
                            <main className="flex-1 p-4 md:p-6 w-full">
                                <PageTransition>
                                    {children}
                                </PageTransition>
                            </main>
                        </div>
                    </div>
                </BlogProvider>
            </ProductProvider>
        </CategoryProvider>
    )
}
