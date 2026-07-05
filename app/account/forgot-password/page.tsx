"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { apiPost } from "@/lib/api"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"

let toastId = 0

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    
    // State
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    
    // UI state
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const addToast = (title: string, message: string) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, title, message }])
    }

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Please enter your email address")
            return
        }

        setIsLoading(true)
        try {
            await apiPost("/api/user/forgot-password", { email })
            addToast("OTP Sent", "Check your email for the verification code")
            setStep(2)
        } catch (err: any) {
            setError(err.message || "Failed to send reset code")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!otp.trim() || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP")
            return
        }

        setIsLoading(true)
        try {
            await apiPost("/api/user/verify-otp", { email, otp })
            addToast("Verified", "OTP verified successfully")
            setStep(3)
        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            await apiPost("/api/user/reset-password", { email, otp, newPassword })
            addToast("Success", "Password reset successfully! You can now log in.")
            setTimeout(() => {
                router.push("/account/login")
            }, 2000)
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />
            <AdminToast toasts={toasts} onDismiss={dismissToast} />

            <div className="pt-[96px] lg:pt-[104px] flex-grow flex flex-col justify-center pb-20">
                <section className="px-6 lg:px-10">
                    <div className="max-w-[460px] mx-auto border border-border rounded-xl p-8 bg-card shadow-sm relative mt-8">
                        {/* Back Button */}
                        {step === 1 ? (
                            <button 
                                onClick={() => router.push("/account/login")}
                                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    setStep(step === 3 ? 2 : 1)
                                    setError("")
                                }}
                                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}

                        <div className="mt-8 mb-8 text-center">
                            <h1 className="font-serif text-2xl mb-2">
                                {step === 1 && "Forgot Password"}
                                {step === 2 && "Enter Verification Code"}
                                {step === 3 && "Create New Password"}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {step === 1 && "Enter your email address to receive a password reset code."}
                                {step === 2 && `We've sent a 6-digit code to ${email}.`}
                                {step === 3 && "Your new password must be different from previously used passwords."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded text-center">
                                {error}
                            </div>
                        )}

                        {/* Step 1 Form */}
                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full bg-primary hover:bg-primary/90 py-6 text-sm uppercase tracking-wide rounded-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {isLoading ? "Sending..." : "Send Reset Code"}
                                </Button>
                            </form>
                        )}

                        {/* Step 2 Form */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">6-Digit Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter OTP"
                                        className="w-full px-4 py-3 border border-border rounded-md bg-background text-sm tracking-widest text-center text-lg focus:outline-none focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full bg-primary hover:bg-primary/90 py-6 text-sm uppercase tracking-wide rounded-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {isLoading ? "Verifying..." : "Verify Code"}
                                </Button>
                                <div className="text-center mt-4">
                                    <button 
                                        type="button" 
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3 Form */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            className="w-full px-4 py-3 border border-border rounded-md bg-background text-sm pr-12 focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full px-4 py-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !newPassword || !confirmPassword}
                                    className="w-full bg-primary hover:bg-primary/90 py-6 text-sm uppercase tracking-wide rounded-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    )
}
