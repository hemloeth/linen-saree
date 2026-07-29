"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, LogOut, Check, Pencil, Package, Heart, Gift } from "lucide-react"

export default function AccountPage() {
  const { user, isAuthenticated, isHydrated, logout, updateProfile } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setEditName(user.name)
      setEditPhone(user.phone)
    }
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/account/login")
    }
  }, [isHydrated, isAuthenticated, router])

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-[96px] lg:pt-[104px] min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </main>
    )
  }

  const handleSave = () => {
    updateProfile({ name: editName, phone: editPhone })
    setIsEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleLogout = () => {
    logout()
    router.push("/account/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-[96px] lg:pt-[104px]">
        <section className="py-12 lg:py-16 px-2">
          <div className="max-w-[700px] mx-auto">
            <h1 className="font-serif text-3xl text-center mb-2">My Account</h1>
            <p className="text-center text-muted-foreground mb-10">Welcome back, {user.name}!</p>

            {/* Success Toast */}
            {saveSuccess && (
              <div className="mb-6 p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile updated successfully
              </div>
            )}

            {/* Profile Card */}
            <div className="border border-border rounded-lg overflow-hidden mb-8">
              <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
                <h2 className="font-medium">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsEditing(false); setEditName(user.name); setEditPhone(user.phone); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      onClick={handleSave}
                      className="bg-primary hover:bg-primary/90 h-8 px-4 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-border">
                {/* Name */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-border bg-background text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm font-medium">{user.name}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editPhone}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault()
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-border bg-background text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm font-medium">{user.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Link href="/orders" className="group">
                <div className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">My Orders</h3>
                  <p className="text-xs text-muted-foreground mt-1">Track your orders</p>
                </div>
              </Link>
              <Link href="/wishlist" className="group">
                <div className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Wishlist</h3>
                  <p className="text-xs text-muted-foreground mt-1">Saved items</p>
                </div>
              </Link>
              <Link href="/track-order" className="group">
                <div className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Track Order</h3>
                  <p className="text-xs text-muted-foreground mt-1">Shipment status</p>
                </div>
              </Link>
            </div>

            {/* Logout */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
