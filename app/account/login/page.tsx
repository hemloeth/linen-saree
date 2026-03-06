"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"

let toastId = 0

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const { login, signup, isAuthenticated, isHydrated } = useAuth()
    const router = useRouter()

    // Login form
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [loginError, setLoginError] = useState("")
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    // Signup form
    const [signupName, setSignupName] = useState("")
    const [signupEmail, setSignupEmail] = useState("")
    const [signupPhone, setSignupPhone] = useState("")
    const [signupPassword, setSignupPassword] = useState("")
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
    const [signupError, setSignupError] = useState("")
    const [showSignupPassword, setShowSignupPassword] = useState(false)
    const [signupErrors, setSignupErrors] = useState<Record<string, string>>({})
    const [isRegistering, setIsRegistering] = useState(false)
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const addToast = (title: string, message: string) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, title, message }])
    }

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    // Redirect if already logged in and not registering/logging in
    useEffect(() => {
        if (isHydrated && isAuthenticated && !isRegistering && !isLoggingIn) {
            router.push("/")
        }
    }, [isHydrated, isAuthenticated, isRegistering, isLoggingIn, router])

    if (isHydrated && isAuthenticated && !isRegistering && !isLoggingIn) {
        return null
    }

    if (!isHydrated) {
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError("")

        if (!loginEmail || !loginPassword) {
            setLoginError("Please fill in all fields")
            return
        }

        setIsLoggingIn(true)
        try {
            const result = await login(loginEmail, loginPassword)
            if (result.success) {
                addToast("Login Successful", "Welcome back!")
                setTimeout(() => {
                    router.push("/")
                }, 1500) // Delay redirect to let user see toast
            } else {
                setLoginError(result.error || "Login failed")
            }
        } finally {
            setIsLoggingIn(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setSignupError("")
        const errors: Record<string, string> = {}

        if (!signupName.trim()) errors.name = "Name is required"
        if (!signupEmail.trim()) errors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errors.email = "Enter a valid email"

        if (!signupPhone) errors.phone = "Phone number is required"
        else if (signupPhone.length !== 10) errors.phone = "Enter a valid 10-digit phone number"
        else if (!/^[6-9]/.test(signupPhone)) errors.phone = "Phone must start with 6, 7, 8, or 9"

        if (!signupPassword) errors.password = "Password is required"
        else if (signupPassword.length < 6) errors.password = "Password must be at least 6 characters"

        if (signupPassword !== signupConfirmPassword) errors.confirmPassword = "Passwords do not match"

        if (Object.keys(errors).length > 0) {
            setSignupErrors(errors)
            return
        }

        setSignupErrors({})
        setIsRegistering(true)
        try {
            const result = await signup(signupName, signupEmail, signupPhone, signupPassword)
            if (result.success) {
                addToast("Account Created", "You have successfully registered!")
                setTimeout(() => {
                    router.push("/")
                }, 1500) // Delay redirect to let user see toast
            } else {
                setSignupError(result.error || "Signup failed")
            }
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <AdminToast toasts={toasts} onDismiss={dismissToast} />

            <div className="pt-[96px] lg:pt-[104px]">
                <section className="py-12 lg:py-16 px-4 lg:px-8">
                    <div className="max-w-[460px] mx-auto">
                        <h1 className="font-serif text-3xl text-center mb-8">My Account</h1>

                        {/* Tabs */}
                        <div className="flex border-b border-border mb-8">
                            <button
                                onClick={() => { setActiveTab("login"); setLoginError(""); }}
                                className={`flex-1 pb-3 text-sm font-medium tracking-wide uppercase transition-colors relative ${activeTab === "login"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Login
                                {activeTab === "login" && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => { setActiveTab("signup"); setSignupError(""); setSignupErrors({}); }}
                                className={`flex-1 pb-3 text-sm font-medium tracking-wide uppercase transition-colors relative ${activeTab === "signup"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Sign Up
                                {activeTab === "signup" && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        </div>

                        {/* Login Form */}
                        {activeTab === "login" && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                {loginError && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                                        {loginError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showLoginPassword ? "text" : "password"}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-3 border border-border bg-background text-sm pr-12 focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full bg-primary hover:bg-primary/90 py-6 text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoggingIn ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Don{"'"}t have an account?{" "}
                                    <button type="button" onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-medium">
                                        Create one
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* Signup Form */}
                        {activeTab === "signup" && (
                            <form onSubmit={handleSignup} className="space-y-5">
                                {signupError && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                                        {signupError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={signupName}
                                        onChange={(e) => { setSignupName(e.target.value); if (signupErrors.name) setSignupErrors(p => ({ ...p, name: '' })); }}
                                        placeholder="Your full name"
                                        className={`w-full px-4 py-3 border bg-background text-sm focus:outline-none focus:border-primary transition-colors ${signupErrors.name ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    {signupErrors.name && <p className="text-xs text-red-500 mt-1">{signupErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={signupEmail}
                                        onChange={(e) => { setSignupEmail(e.target.value); if (signupErrors.email) setSignupErrors(p => ({ ...p, email: '' })); }}
                                        placeholder="you@example.com"
                                        className={`w-full px-4 py-3 border bg-background text-sm focus:outline-none focus:border-primary transition-colors ${signupErrors.email ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    {signupErrors.email && <p className="text-xs text-red-500 mt-1">{signupErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={signupPhone}
                                        inputMode="numeric"
                                        maxLength={10}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setSignupPhone(digits)
                                            if (signupErrors.phone) setSignupErrors(p => ({ ...p, phone: '' }))
                                        }}
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                                e.preventDefault()
                                            }
                                        }}
                                        placeholder="10-digit mobile number"
                                        className={`w-full px-4 py-3 border bg-background text-sm focus:outline-none focus:border-primary transition-colors ${signupErrors.phone ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    {signupErrors.phone && <p className="text-xs text-red-500 mt-1">{signupErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showSignupPassword ? "text" : "password"}
                                            value={signupPassword}
                                            onChange={(e) => { setSignupPassword(e.target.value); if (signupErrors.password) setSignupErrors(p => ({ ...p, password: '' })); }}
                                            placeholder="At least 6 characters"
                                            className={`w-full px-4 py-3 border bg-background text-sm pr-12 focus:outline-none focus:border-primary transition-colors ${signupErrors.password ? 'border-red-500' : 'border-border'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {signupErrors.password && <p className="text-xs text-red-500 mt-1">{signupErrors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={signupConfirmPassword}
                                        onChange={(e) => { setSignupConfirmPassword(e.target.value); if (signupErrors.confirmPassword) setSignupErrors(p => ({ ...p, confirmPassword: '' })); }}
                                        placeholder="Re-enter your password"
                                        className={`w-full px-4 py-3 border bg-background text-sm focus:outline-none focus:border-primary transition-colors ${signupErrors.confirmPassword ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    {signupErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{signupErrors.confirmPassword}</p>}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isRegistering}
                                    className="w-full bg-primary hover:bg-primary/90 py-6 text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isRegistering ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Registering...
                                        </div>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => setActiveTab("login")} className="text-primary hover:underline font-medium">
                                        Sign in
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    )
}
