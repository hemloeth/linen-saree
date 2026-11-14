"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "", message: "" });
    }, 700);
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Assistance & Enquiries
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Have questions about an order, custom draping advice, or wholesale queries? We are here to help.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            {/* Quick Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-semibold text-pine-950">
                  Get in Touch
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Our artisan support team is available Monday to Saturday, 10:00 AM – 7:00 PM IST.
                </p>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4 rounded-xl border border-pine-950/10 bg-linen/40 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine-900 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm0 16.4a7.4 7.4 0 0 1-3.8-1l-.3-.2-2.8.7.7-2.7-.2-.3A7.4 7.4 0 1 1 12 19.4Zm4-5.5c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.7c-.2-.4.2-.4.6-1.3.1-.1 0-.4 0-.5l-.7-1.5c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.4-.2.2-.8.8-.8 2s.8 2.4.9 2.6c.1.1 1.6 2.5 4 3.5.6.2 1 .4 1.4.5.6.2 1.1.2 1.6.1.5-.1 1.3-.5 1.5-1 .2-.6.2-1 .1-1.1l-.5-.3Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-pine-950">WhatsApp Concierge</h3>
                    <p className="text-xs text-muted">Instant assistance with sarees, video calls, & orders</p>
                    <a
                      href="https://wa.me/919264151111"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block cursor-pointer text-xs font-semibold text-pine-900 hover:underline"
                    >
                      +91 92641 51111 ↗
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-pine-950/10 bg-linen/40 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine-900 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-pine-950">Email Support</h3>
                    <p className="text-xs text-muted">For corporate, bulk, or shipping inquiries</p>
                    <a
                      href="mailto:support@linensaree.com"
                      className="mt-1 inline-block cursor-pointer text-xs font-semibold text-pine-900 hover:underline"
                    >
                      support@linensaree.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-pine-950/10 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-display text-xl font-semibold text-pine-950">
                Send Us a Message
              </h3>
              <p className="mt-1 text-xs text-muted">
                Fill out the details below and we will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-xl bg-pine-50 p-6 text-center text-pine-900">
                  <p className="font-semibold">Thank you for reaching out!</p>
                  <p className="mt-1 text-xs text-pine-800">
                    Your message has been received. Our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-pine-950">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="mt-1.5 h-11 w-full rounded-md border border-hairline bg-linen/30 px-3.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-pine-950">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1.5 h-11 w-full rounded-md border border-hairline bg-linen/30 px-3.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-pine-950">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="mt-1.5 h-11 w-full rounded-md border border-hairline bg-linen/30 px-3.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-pine-950">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you are looking for or questions about your order..."
                      className="mt-1.5 w-full rounded-md border border-hairline bg-linen/30 p-3.5 text-sm text-ink outline-none transition-colors focus:border-pine-900 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full cursor-pointer rounded-md bg-pine-900 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950 disabled:opacity-60"
                  >
                    {isSubmitting ? "Transmitting..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

