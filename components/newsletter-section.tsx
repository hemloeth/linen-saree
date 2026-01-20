"use client"

import React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    setEmail("")
  }

  return (
    <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 text-center">
        <p className="font-sans text-sm tracking-[0.3em] uppercase opacity-70 mb-4">
          Stay Connected
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
          Join Our Journey
        </h2>
        <p className="font-sans text-lg opacity-80 leading-relaxed mb-10 max-w-xl mx-auto">
          Subscribe to receive exclusive previews of new collections, styling tips, and special offers.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-transparent border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 font-sans text-sm focus:outline-none focus:border-primary-foreground transition-colors"
            required
          />
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-3 bg-primary-foreground text-primary px-8 py-4 font-sans text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Subscribe
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  )
}
