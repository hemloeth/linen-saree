"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, LogOut, Check, Pencil, Package, Heart, Gift, ChevronRight } from "lucide-react"

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
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="text-muted-foreground font-medium tracking-wide">Loading Profile...</div>
          </div>
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

  // Get user initials
  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div 
        className="flex-1 px-4 md:px-8 pb-16"
        style={{ paddingTop: 'calc(var(--header-offset, 120px) + 2rem)' }}
      >
        <div className="max-w-[1100px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 pb-8 border-b border-border/40 gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center text-3xl font-serif shadow-inner">
                {initials}
              </div>
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl tracking-wide text-foreground mb-2">My Account</h1>
                <p className="text-muted-foreground">Welcome back, <span className="font-medium text-foreground">{user.name}</span>!</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>

          {/* Success Toast */}
          {saveSuccess && (
            <div className="mb-8 p-4 text-sm text-green-700 bg-green-50 border border-green-200 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="w-6 h-6 bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              Profile updated successfully
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Quick Links */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="font-serif text-xl mb-4">Quick Links</h2>
              
              <Link href="/orders" className="block group">
                <div className="flex items-center p-4 border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Package className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">My Orders</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Track & manage shipments</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </Link>
              
              <Link href="/wishlist" className="block group">
                <div className="flex items-center p-4 border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Heart className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Wishlist</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">View your saved items</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/track-order" className="block group">
                <div className="flex items-center p-4 border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Gift className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Track Order</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time shipment status</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            </div>

            {/* Right Column: Profile Info */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-border/50 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 sm:px-8 py-6 bg-muted/20 border-b border-border/50">
                  <div>
                    <h2 className="font-serif text-xl">Personal Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your details and contact info</p>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="gap-2 px-6"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => { setIsEditing(false); setEditName(user.name); setEditPhone(user.phone); }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="gap-2 px-6 w-full sm:w-auto"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                  {/* Name Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 sm:pt-2">
                      <User className="w-4 h-4" /> Full Name
                    </div>
                    <div className="sm:col-span-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full max-w-md px-4 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-base font-medium sm:pt-1.5">{user.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border/40 w-full" />

                  {/* Email Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 sm:pt-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-base font-medium sm:pt-1.5 text-foreground/80">{user.email}</p>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground mt-2">Email address cannot be changed.</p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border/40 w-full" />

                  {/* Phone Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 sm:pt-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </div>
                    <div className="sm:col-span-2">
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
                          className="w-full max-w-md px-4 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="10-digit number"
                        />
                      ) : (
                        <p className="text-base font-medium sm:pt-1.5">{user.phone || <span className="text-muted-foreground italic text-sm">Not provided</span>}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
