"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

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

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitStatus("success")
      setFormData({ name: "", phone: "", email: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[104px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Contact Us
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Information */}
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Get in Touch
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-12">
              Have questions about our sarees, need styling advice, or want to learn more about our artisans? 
              We're here to help you find the perfect saree for any occasion.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-medium mb-2">Email Us</h3>
                  <p className="text-muted-foreground">linensaree001@gmail.com</p>
                  <p className="text-muted-foreground">support@linensaree.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-medium mb-2">Call Us</h3>
                  <p className="text-muted-foreground">+91-9264151111</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-medium mb-2">Visit Us</h3>
                  <p className="text-muted-foreground">
                    Bhagalpur<br />
                     Bihar<br />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-medium mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Saturday: 10:00 AM - 7:00 PM<br />
                    Sunday: 11:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <h2 className="font-serif text-2xl lg:text-3xl font-light mb-8">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-sans text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block font-sans text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-sans text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-sans text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-vertical"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-base"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                {submitStatus === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">
                      Sorry, there was an error sending your message. Please try again.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}