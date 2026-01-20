import { Scale, FileText, Shield, AlertTriangle, Clock, Users } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Linen Sarees",
  description: "Read our terms of service and understand the conditions for using our website and purchasing our handcrafted sarees.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Terms of Service
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Please read these terms carefully before using our services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Introduction */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Introduction</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              Welcome to Linen Sarees. These Terms of Service ("Terms") govern your use of our website located at linensaree.com and our services.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
            </p>
          </div>
        </section>

        {/* Account Terms */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Account Terms</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              • You must be 18 years or older to use this service
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • You must provide accurate and complete information when creating an account
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • You are responsible for maintaining the security of your account and password
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • You are responsible for all activities that occur under your account
            </p>
          </div>
        </section>

        {/* Orders and Payments */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Orders and Payments</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              • All orders are subject to acceptance and availability
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • Prices are subject to change without notice
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • Payment must be received before order processing
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • We accept various payment methods as displayed at checkout
            </p>
          </div>
        </section>

        {/* Shipping and Delivery */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Shipping and Delivery</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              • Delivery times are estimates and not guaranteed
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • Risk of loss passes to you upon delivery to the carrier
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • Additional charges may apply for remote locations
            </p>
          </div>
        </section>

        {/* Returns and Refunds */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Returns and Refunds</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              Returns and refunds are governed by our Return Policy. Please refer to our detailed return policy page for complete information about eligibility, process, and timelines.
            </p>
          </div>
        </section>

        {/* Prohibited Uses */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Prohibited Uses</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              You may not use our service:
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • For any unlawful purpose or to solicit others to perform unlawful acts
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • To infringe upon or violate our intellectual property rights or the intellectual property rights of others
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Limitation of Liability</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              In no case shall Linen Sarees, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Changes to Terms</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h3 className="font-serif text-2xl font-light mb-4">Questions About These Terms?</h3>
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Us
              </a>
              <a 
                href="mailto:linensaree001@gmail.com" 
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center pt-8 border-t border-border">
          <p className="font-sans text-sm text-muted-foreground">
            Last updated: January 21, 2026
          </p>
        </div>
      </div>
    </div>
  )
}