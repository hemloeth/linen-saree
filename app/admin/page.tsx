"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiPost } from "@/lib/api"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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
        <div className="relative flex min-h-screen items-center justify-center bg-[#FAF9F5] px-4 py-12 font-sans text-[#1A1A1A]">
            
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px]"
            >
                {/* Minimalist, Clean Luxury Box Container */}
                <div className="bg-white border border-[#EBE8E2] rounded-2xl shadow-[0_4px_30px_rgba(26,21,16,0.015)] p-8 md:p-10 relative">
                    
                    {/* Minimal Brand Title */}
                    <div className="text-center space-y-3 mb-8">
                        <div className="space-y-1">
                            <h1 className="text-[11px] uppercase tracking-[0.35em] font-medium text-[#8F8C84]">
                                Linen Saree
                            </h1>
                            <h2 className="text-2xl font-serif font-light text-[#1A1A1A] tracking-normal">
                                Administrative Gate
                            </h2>
                        </div>
                        
                        <p className="text-[11px] text-[#8F8C84] leading-relaxed max-w-[280px] mx-auto">
                            {step === "email" 
                                ? "Enter your email credentials below to request access." 
                                : "A 6-digit dynamic key has been dispatched to your inbox."}
                        </p>
                    </div>

                    {/* Simple Error Banner */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#DF5B5B]/5 text-[#DF5B5B] text-[11px] p-3 rounded-lg border border-[#DF5B5B]/10 mb-6 text-center font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Clean Static Forms */}
                    <AnimatePresence mode="wait">
                        {step === "email" ? (
                            /* ================== Step 1: Email Form ================== */
                            <motion.form 
                                key="email-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSendOTP} 
                                className="space-y-6"
                            >
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8F8C84] block px-0.5">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8F8C84]/60" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@linensaree.com"
                                            className="pl-10 pr-4 h-12 rounded-lg border-[#E5E2DC] bg-white hover:border-[#8F8C84]/60 focus:border-[#1A1A1A] focus:ring-0 focus-visible:ring-0 transition-colors text-sm font-sans"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                
                                <Button 
                                    className="w-full h-12 rounded-lg bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white font-medium tracking-[0.2em] text-[10px] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.99]" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                            Requesting Access...
                                        </>
                                    ) : (
                                        <>
                                            Request Access Key
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            /* ================== Step 2: OTP Form ================== */
                            <motion.form 
                                key="otp-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleVerifyOTP} 
                                className="space-y-6"
                            >
                                <div className="space-y-3 text-center">
                                    <Label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8F8C84] block">
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
                                                className="w-11 h-12 text-center text-xl font-sans font-light border border-[#E5E2DC] rounded-lg bg-white focus:border-[#1A1A1A] focus:ring-0 focus:outline-none transition-colors"
                                                value={digit}
                                                onChange={e => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                onPaste={handleOtpPaste}
                                                disabled={isLoading}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-[#8F8C84] mt-2 font-sans">
                                        Sent to <strong className="text-[#1A1A1A] font-medium">{email}</strong>
                                    </p>
                                </div>

                                <Button 
                                    className="w-full h-12 rounded-lg bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white font-medium tracking-[0.2em] text-[10px] uppercase transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-[0.99]" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                            Verifying Key...
                                        </>
                                    ) : (
                                        <>
                                            Verify Access Key
                                        </>
                                    )}
                                </Button>

                                {/* Back and Resend Options */}
                                <div className="flex items-center justify-between border-t border-[#F0EDE8] pt-4 text-xs mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="flex items-center gap-1 text-[#8F8C84] hover:text-[#1A1A1A] transition-colors text-[10px] font-medium tracking-wider uppercase cursor-pointer"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        Modify Email
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className={`font-semibold text-[10px] tracking-wider uppercase transition-colors cursor-pointer ${
                                            resendCooldown > 0 || isLoading
                                                ? "text-[#8F8C84]/40 cursor-not-allowed"
                                                : "text-[#8F8C84] hover:text-[#1A1A1A] underline decoration-dotted"
                                        }`}
                                        disabled={resendCooldown > 0 || isLoading}
                                    >
                                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-1 text-[10px] text-[#8F8C84] hover:text-[#1A1A1A] transition-colors tracking-widest uppercase font-semibold">
                        Return to Storefront
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}


