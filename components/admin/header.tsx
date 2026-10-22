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

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-3 md:px-4">
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border bg-muted">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
