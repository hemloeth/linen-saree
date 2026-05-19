"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ArrowRight, ShieldCheck, ArrowLeft, Star } from "lucide-react"
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
        <div className="relative flex min-h-screen items-center justify-center bg-[#FAF7F2] px-4 py-12 overflow-hidden font-sans">
            {/* Ultra-Premium Moving Background Blobs */}
            <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#E6DFD5] to-transparent opacity-40 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-30%] right-[-20%] w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[#C4B29E] to-transparent opacity-20 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />
            
            {/* Fine Grid Pattern Overlay for Luxury Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b735505_1px,transparent_1px),linear-gradient(to_bottom,#8b735505_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[500px]"
            >
                {/* Custom Luxury Card Container */}
                <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-[0_24px_80px_rgba(27,21,16,0.06)] rounded-[32px] overflow-hidden px-8 py-10 md:px-12 md:py-12 relative">
                    
                    {/* Golden Brand Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#C4A77D] via-[#8B7355] to-[#C4A77D]" />

                    {/* Logo/Crest Header */}
                    <div className="text-center space-y-4 mb-8">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C4A77D]/30 bg-[#F5F2EB]/80 text-[#8B7355] shadow-inner relative group"
                        >
                            <span className="absolute inset-0 rounded-full border border-dashed border-[#C4A77D]/20 animate-spin" style={{ animationDuration: '20s' }}></span>
                            <Star className="h-6 w-6 fill-[#C4A77D]/10 stroke-[#8B7355] transition-transform duration-700 group-hover:rotate-180" />
                        </motion.div>
                        
                        <div className="space-y-1">
                            <h1 className="text-sm uppercase tracking-[0.25em] font-bold text-[#8B7355]/80">
                                Linen Saree
                            </h1>
                            <h2 className="text-3xl font-serif font-semibold text-[#1A1510] tracking-wide">
                                Gateway Control
                            </h2>
                        </div>
                        
                        <p className="text-xs text-[#8B7355]/70 max-w-[320px] mx-auto leading-relaxed">
                            {step === "email" 
                                ? "Authenticate administrative session with a secure dynamic key" 
                                : "Please verify the 6-digit access key dispatched to your inbox"}
                        </p>
                    </div>

                    {/* Animated Form Area */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[#DF5B5B]/5 text-[#DF5B5B] text-xs font-semibold p-4 rounded-xl border border-[#DF5B5B]/10 mb-6 text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {step === "email" ? (
                            /* ================== Step 1: Email Form ================== */
                            <motion.form 
                                key="email-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                onSubmit={handleSendOTP} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7355]/80 block px-1">
                                        Administrative Credentials
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7355]/50 group-focus-within:text-[#8B7355] transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@linensaree.com"
                                            className="pl-11 pr-4 h-13 rounded-xl border-[#8B7355]/15 bg-white/50 hover:border-[#8B7355]/40 focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 transition-all text-sm font-sans"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                
                                <Button 
                                    className="w-full h-13 rounded-xl bg-gradient-to-r from-[#8B7355] via-[#C4A77D] to-[#8B7355] hover:opacity-95 text-white font-medium tracking-[0.15em] text-xs uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(139,115,85,0.2)] flex items-center justify-center gap-2 group cursor-pointer hover:shadow-[0_12px_35px_rgba(139,115,85,0.35)] hover:-translate-y-0.5 active:translate-y-0" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            Verifying Credentials...
                                        </>
                                    ) : (
                                        <>
                                            Request Access Key
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            /* ================== Step 2: OTP Form ================== */
                            <motion.form 
                                key="otp-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                onSubmit={handleVerifyOTP} 
                                className="space-y-6"
                            >
                                <div className="space-y-4 text-center">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B7355]/80 block px-1">
                                        Verification Keycard
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
                                                className="w-11 h-14 text-center text-2xl font-serif font-bold border border-[#8B7355]/15 rounded-xl bg-white/50 focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 focus:outline-none transition-all"
                                                value={digit}
                                                onChange={e => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                onPaste={handleOtpPaste}
                                                disabled={isLoading}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-[#8B7355]/70 mt-2 font-sans">
                                        Keycard sent to <strong className="text-[#1A1510] font-medium">{email}</strong>
                                    </p>
                                </div>

                                <Button 
                                    className="w-full h-13 rounded-xl bg-gradient-to-r from-[#8B7355] via-[#C4A77D] to-[#8B7355] hover:opacity-95 text-white font-medium tracking-[0.15em] text-xs uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(139,115,85,0.2)] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_12px_35px_rgba(139,115,85,0.35)] hover:-translate-y-0.5 active:translate-y-0" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            Authorizing Entry...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Verification Code
                                        </>
                                    )}
                                </Button>

                                {/* Back and Resend Options */}
                                <div className="flex items-center justify-between border-t border-[#8B7355]/10 pt-5 text-sm mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="flex items-center gap-1.5 text-[#8B7355]/60 hover:text-[#8B7355] transition-colors text-xs font-semibold tracking-wider uppercase cursor-pointer"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Modify Email
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className={`font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                                            resendCooldown > 0 || isLoading
                                                ? "text-[#8B7355]/30 cursor-not-allowed"
                                                : "text-[#8B7355] hover:text-[#725E45] underline decoration-dashed"
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

                {/* Elegant Footer Area */}
                <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8B7355]/70 hover:text-[#8B7355] transition-colors tracking-widest uppercase font-semibold">
                        Return to Public Storefront
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

