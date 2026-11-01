"use client"

import Link from "next/link"
import { Bell, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearAdminToken } from "@/lib/api"

interface AdminHeaderProps {
    onMenuClick: () => void
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export function AdminHeader({ onMenuClick, isCollapsed, onToggleCollapse }: AdminHeaderProps) {
    const handleLogout = () => {
        localStorage.removeItem("auth_user")
        clearAdminToken()
        window.location.href = "/admin"
    }

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-3 md:px-4">
            {/* Mobile menu trigger */}
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            {/* Desktop sidebar collapse/expand trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="flex flex-1 items-center gap-4">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-serif text-primary">The Handloomer</span>
                    <span className="hidden sm:inline text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
                </Link>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border bg-muted cursor-pointer">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.open("/contact", "_blank")} className="cursor-pointer">
                            Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium cursor-pointer">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
