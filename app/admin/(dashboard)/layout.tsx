import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-muted/40">
            <AdminSidebar />
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <AdminHeader />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
