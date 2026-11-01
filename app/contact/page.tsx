"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { apiPost } from "@/lib/api"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const data = await apiPost('/api/contact', formData)
      if (data && data.success) {
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", email: "", message: "" })
      } else {
        setSubmitStatus("error")
        setErrorMessage(data?.message || "Failed to transmit message.")
      }
    } catch (error: any) {
      setSubmitStatus("error")
      setErrorMessage(error?.message || "Failed to transmit inquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />

      <main
        className="flex-1 max-w-[1300px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16"
        style={{ paddingTop: 'calc(var(--header-offset, 140px) + 2rem)' }}
      >
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Direct Atelier Coordinates */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-muted-foreground block mb-2">
                Client Concierge
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-[1.1]">
                Direct Inquiries & Dialogue
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light max-w-md">
              Whether you are curating a wedding trousseau, inquiring about custom weave lengths, or seeking drape styling advice, our master atelier concierge is at your service.
            </p>

            <div className="space-y-6 pt-4 border-t border-border/80">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground block mb-1">
                  Concierge Email
                </span>
                <a
                  href="mailto:support@handloomer.com"
                  className="text-sm sm:text-base font-normal text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border"
                >
                  support@handloomer.com
                </a>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground block mb-1">
                  Direct WhatsApp & Call
                </span>
                <a
                  href="https://wa.me/919264151111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base font-normal text-foreground hover:text-primary transition-colors"
                >
                  +91 92641 51111
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground block mb-1">
                    Atelier Origin
                  </span>
                  <p className="text-xs text-foreground/85 leading-snug">
                    Bhagalpur & Banaras Looms, India
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground block mb-1">
                    Operating Hours
                  </span>
                  <p className="text-xs text-foreground/85 leading-snug">
                    Mon — Sat, 10:00 — 19:00 IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Minimalist Border-Bottom Form */}
          <div className="lg:col-span-7 bg-card/40 border border-border/60 p-8 sm:p-12 lg:p-14">
            <div className="mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                Send an Inquiry
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                We typically respond within 24 business hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-[11px] font-mono tracking-wider uppercase text-muted-foreground mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your name"
                  className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors rounded-none"
                />
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-mono tracking-wider uppercase text-muted-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors rounded-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[11px] font-mono tracking-wider uppercase text-muted-foreground mb-2"
                  >
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors rounded-none"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-[11px] font-mono tracking-wider uppercase text-muted-foreground mb-2"
                >
                  Inquiry Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about the drape, collection, or question..."
                  className="w-full bg-transparent border-b border-border py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors resize-none rounded-none"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-between gap-4 px-8 py-3.5 bg-foreground text-background text-xs font-mono tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer rounded-none group"
                >
                  <span>{isSubmitting ? "Transmitting..." : "Send Message"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Status Notifications */}
              {submitStatus === "success" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Thank you. Your inquiry has been received. Our concierge will be in touch shortly.</span>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || "Unable to send message. Please reach us directly via WhatsApp."}</span>
                </div>
              )}
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
