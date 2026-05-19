"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, KeyRound, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiPost } from "@/lib/api"
import { toast } from "sonner"

export default function AdminAuthPage() {
    const router = useRouter()
    
    // Auth States
    const [step, setStep] = useState<"email" | "otp">("email")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    
    // UI Loading & Cooldown States
    const [isLoading, setIsLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [error, setError] = useState<string | null>(null)
    
    // Input Refs for multi-box OTP entry
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    // Load any existing session on mount
    useEffect(() => {
        const token = localStorage.getItem("auth_token")
        const userStr = localStorage.getItem("auth_user")
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.role === "admin") {
                    router.push("/admin/dashboard")
                }
            } catch {
                localStorage.removeItem("auth_token")
                localStorage.removeItem("auth_user")
            }
        }
    }, [router])

    // Countdown Timer logic
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => {
            setResendCooldown(prev => prev - 1)
        }, 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    // Step 1: Submit Email to trigger OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const res = await apiPost<{ success: boolean; message: string }>("/api/admin-auth/send-otp", { email })
            if (res.success) {
                toast.success("Verification code sent successfully")
                setStep("otp")
                setResendCooldown(60) // 60 seconds resend limit
                
                // Focus first box on transition
                setTimeout(() => {
                    otpRefs.current[0]?.focus()
                }, 100)
            } else {
                setError(res.message || "Failed to send verification code.")
            }
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Submit OTP Code for Verification
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpCode = otp.join("")
        if (otpCode.length < 6) {
            setError("Please enter the full 6-digit verification code.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await apiPost<{
                success: boolean
                token: string
                user: { _id: string; name: string; email: string; role: string }
                message: string
            }>("/api/admin-auth/verify-otp", { email, otp: otpCode })

            if (data.success && data.token) {
                localStorage.setItem("auth_token", data.token)
                localStorage.setItem("auth_user", JSON.stringify(data.user))
                toast.success("Authenticated successfully")
                router.push("/admin/dashboard")
            } else {
                setError(data.message || "Invalid verification code.")
            }
        } catch (err: any) {
            setError(err.message || "Verification failed. Please check your code.")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle OTP character input
    const handleOtpChange = (index: number, value: string) => {
        // Only accept numbers
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Clear error when typing
        if (error) setError(null)

        // Move to next input if filled
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    // Handle backspaces in OTP boxes
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // Focus previous box and clear it
                const newOtp = [...otp]
                newOtp[index - 1] = ""
                setOtp(newOtp)
                otpRefs.current[index - 1]?.focus()
            } else {
                const newOtp = [...otp]
                newOtp[index] = ""
                setOtp(newOtp)
            }
        }
    }

    // Handle paste inside OTP boxes
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").trim()
        if (!/^\d{6}$/.test(pastedData)) return

        const digits = pastedData.split("")
        setOtp(digits)
        otpRefs.current[5]?.focus()
    }

    // Resend OTP trigger
    const handleResend = async () => {
        if (resendCooldown > 0 || isLoading) return
        setIsLoading(true)
        setError(null)

        try {
            const res = await apiPost<{ success: boolean; message: string }>("/api/admin-auth/send-otp", { email })
            if (res.success) {
                toast.success("A new verification code has been sent.")
                setResendCooldown(60)
                setOtp(Array(6).fill(""))
                otpRefs.current[0]?.focus()
            }
        } catch (err: any) {
            setError(err.message || "Failed to resend code.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 overflow-hidden">
            {/* Elegant Background Accents */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5DED6] opacity-30 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B7355] opacity-10 blur-[120px]" />

            <Card className="relative z-10 w-full max-w-md border-border bg-white shadow-xl shadow-muted/50 rounded-2xl overflow-hidden transition-all duration-300">
                {/* Visual Header */}
                <div className="h-2 bg-primary w-full bg-gradient-to-r from-[#C4A77D] via-[#8B7355] to-[#C4A77D]" />
                
                <CardHeader className="space-y-2 text-center pt-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F2EB] text-[#8B7355]">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-3xl font-serif font-bold text-primary tracking-wide">
                        Control Center
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm font-sans">
                        {step === "email" 
                            ? "Enter your email to receive a secure access key" 
                            : "Enter the 6-digit key sent to your inbox"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6 px-8 pb-8 pt-4">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-destructive/5 text-destructive text-xs font-semibold p-4 rounded-xl border border-destructive/10 animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {step === "email" ? (
                        /* ================== Step 1: Email Form ================== */
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                    Administrator Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B7355]/60" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@linensaree.com"
                                        className="pl-10 h-12 rounded-lg border-border hover:border-primary/50 focus:border-primary transition-colors text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button 
                                className="w-full h-12 rounded-lg bg-[#8B7355] hover:bg-[#725E45] text-white font-medium text-sm transition-all duration-300 shadow-md shadow-[#8B7355]/20 flex items-center justify-center gap-2 group" 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying Authorized Access...
                                    </>
                                ) : (
                                    <>
                                        Request Access Key
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        /* ================== Step 2: OTP Form ================== */
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="grid gap-3 text-center">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block">
                                    Verification Code
                                </Label>
                                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            maxLength={1}
                                            pattern="\d*"
                                            inputMode="numeric"
                                            ref={el => { otpRefs.current[idx] = el }}
                                            className="w-11 h-13 text-center text-2xl font-semibold border border-border rounded-lg bg-[#FDFBF7] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            value={digit}
                                            onChange={e => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(idx, e)}
                                            onPaste={handleOtpPaste}
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Verification code sent to <strong className="text-primary font-medium">{email}</strong>
                                </p>
                            </div>

                            <Button 
                                className="w-full h-12 rounded-lg bg-[#8B7355] hover:bg-[#725E45] text-white font-medium text-sm transition-all duration-300 shadow-md shadow-[#8B7355]/20 flex items-center justify-center gap-2" 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Authorizing Admin Session...
                                    </>
                                ) : (
                                    <>
                                        Confirm Verification Code
                                    </>
                                )}
                            </Button>

                            {/* Back and Resend Options */}
                            <div className="flex items-center justify-between border-t border-border/50 pt-4 text-sm mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs"
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Change Email
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className={`font-semibold text-xs transition-colors ${
                                        resendCooldown > 0 || isLoading
                                            ? "text-muted-foreground/60 cursor-not-allowed"
                                            : "text-[#8B7355] hover:text-[#725E45] underline"
                                    }`}
                                    disabled={resendCooldown > 0 || isLoading}
                                >
                                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="bg-[#FDFBF7] border-t border-border/40 py-4 flex justify-center text-xs text-muted-foreground">
                    <Link href="/" className="hover:underline transition-colors hover:text-primary flex items-center gap-1.5 font-medium">
                        Return to Public Storefront
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
