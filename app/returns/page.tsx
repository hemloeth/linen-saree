import { RotateCcw, Clock, CheckCircle, Mail, Phone, Package, Truck, AlertTriangle } from "lucide-react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Returns & Exchanges - Linen Sarees",
  description: "Easy returns and exchanges policy. Learn about our return process, eligibility, and refund information.",
}

export default function ReturnsPage() {
  const returnProcess = [
    {
      step: "1",
      title: "Contact Us",
      description: "Call us at +91 92641-51111 (10 AM to 6 PM, Monday through Saturday) to initiate your return"
    },
    {
      step: "2", 
      title: "Return Approval",
      description: "We'll verify your order details and confirm eligibility within the 7-day return window"
    },
    {
      step: "3",
      title: "Package & Send",
      description: "Pack the item in original condition with all tags and packaging intact"
    },
    {
      step: "4",
      title: "Quality Check",
      description: "Once received, we'll inspect the item for original condition and completeness"
    },
    {
      step: "5",
      title: "Refund Processing",
      description: "Choose your preferred refund method - voucher, product exchange, or bank refund"
    }
  ]

  const refundOptions = [
    {
      title: "Store Voucher",
      description: "Get equivalent amount as store credit for future purchases",
      icon: <Package className="w-6 h-6 text-primary" />
    },
    {
      title: "Product Exchange",
      description: "Exchange for another product of equivalent value",
      icon: <RotateCcw className="w-6 h-6 text-primary" />
    },
    {
      title: "Bank Refund",
      description: "Direct refund to your bank account or original payment method",
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[104px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Refund & Returns Policy
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Easy returns within 7 days with flexible refund options
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Policy Overview */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">7-Day Return Policy</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  Our refund and returns policy lasts 7 days from your purchase date. If 7 days have passed since your purchase, we cannot offer you a full refund or exchange.
                </p>
                <p>
                  If you are not satisfied with your www.linensaree.com online purchase, you may return the goods within 7 working days of the original purchase date.
                </p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 lg:p-12">
              <h3 className="font-serif text-2xl font-light mb-6">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Return Window</span>
                  <span className="font-sans text-muted-foreground">7 Days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Processing Time</span>
                  <span className="font-sans text-muted-foreground">15 Days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Return Courier Fee</span>
                  <span className="font-sans text-muted-foreground">₹120 per product</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-sans font-medium">Contact Hours</span>
                  <span className="font-sans text-muted-foreground">10 AM - 6 PM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility Requirements */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Return Requirements</h2>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 lg:p-12">
            <h3 className="font-serif text-xl font-medium mb-6">To be eligible for a return, your item must meet these conditions:</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Item must be unused and in original condition</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Must be in original packaging</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Price tags and other tags must be intact</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Receipt or proof of purchase required</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Returned within 7 working days</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-muted-foreground">Contact us before sending the item back</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Options */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Choose Your Refund Method
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              You decide how you'd like to receive your refund - we're flexible with what works for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {refundOptions.map((option, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  {option.icon}
                </div>
                <h3 className="font-serif text-xl font-medium mb-4">{option.title}</h3>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Return Process */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              How to Return Your Order
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our simple 5-step return process - complete within 15 days from notification
            </p>
          </div>

          <div className="space-y-8">
            {returnProcess.map((step, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-xl font-light text-primary">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl lg:text-2xl font-medium mb-3">{step.title}</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Important Information</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="font-serif text-xl font-medium mb-6">Restocking Fee</h3>
              <p className="font-sans text-muted-foreground leading-relaxed mb-4">
                Customers returning products not in their original condition may be subject to a restocking fee of up to 50% of the total amount of the original purchase price.
              </p>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                This policy helps maintain product quality and deters misuse. The vast majority of customers will never be affected by this fee.
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="font-serif text-xl font-medium mb-6">Return Shipping</h3>
              <p className="font-sans text-muted-foreground leading-relaxed mb-4">
                Return courier fees of ₹120 per product apply for all returns.
              </p>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                This covers the cost of secure packaging and courier services to ensure your return reaches us safely.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Information */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Shipping Information</h2>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="font-serif text-xl font-medium mb-6">Domestic Shipping (India)</h3>
                <div className="space-y-4 font-sans text-muted-foreground">
                  <p>• <strong>Prepaid Orders:</strong> Free shipping</p>
                  <p>• <strong>Cash on Delivery:</strong> ₹100 shipping charge (non-refundable)</p>
                  <p>• <strong>Delivery Time:</strong> 3-7 business days (standard)</p>
                  <p>• <strong>High Demand Items:</strong> 10-15 working days</p>
                  <p>• <strong>Courier Partners:</strong> Blue Dart, Delhivery</p>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium mb-6">International Shipping</h3>
                <div className="space-y-4 font-sans text-muted-foreground">
                  <p>• Shipping charges apply based on order weight</p>
                  <p>• Customs duties and local taxes paid by customer</p>
                  <p>• Duty amount depends on destination country policies</p>
                  <p>• <strong>Note:</strong> Returns not available for international orders</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Attempts */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Delivery Process
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Understanding our delivery attempts and confirmation process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-xl font-light text-primary">1st</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-4">First Attempt</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                Initial delivery attempt. COD orders require customer confirmation before dispatch.
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-xl font-light text-primary">2nd</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-4">Second Attempt</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                If first attempt fails, second attempt made upon customer confirmation.
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-xl font-light text-primary">3rd</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-4">Final Attempt</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                Third attempt requires customer to bear extra shipping charges.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-muted/30 rounded-2xl p-8">
            <h3 className="font-serif text-xl font-medium mb-4">Order Cancellation Policy</h3>
            <div className="space-y-3 font-sans text-muted-foreground text-sm">
              <p>• COD orders: Cancelled if no response within 3 days of first confirmation attempt</p>
              <p>• Prepaid orders: If cancelled after dispatch, ₹150 shipping charges will be deducted from refund</p>
              <p>• Delayed orders: We'll contact you if delivery is delayed beyond 2 weeks from estimated time</p>
            </div>
          </div>
        </section>

        {/* Contact for Returns */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Need Help with Returns?
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Contact us for questions related to refunds and returns. Our team is here to help make the process smooth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+91 92641-51111" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call: +91 92641-51111
              </a>
              <a 
                href="mailto:linensaree001@gmail.com" 
                className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email: linensaree001@gmail.com
              </a>
            </div>
            <p className="font-sans text-muted-foreground text-sm mt-6">
              Available Monday through Saturday, 10 AM to 6 PM
            </p>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}