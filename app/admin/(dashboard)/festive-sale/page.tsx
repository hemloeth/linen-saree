"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FestiveSalePage() {
    const router = useRouter()
    useEffect(() => {
        router.replace("/admin/marketing-collections?tab=big-sale")
    }, [router])

    return (
        <div className="flex h-[400px] flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Redirecting to Big Sale banner settings...</p>
        </div>
    )
}
