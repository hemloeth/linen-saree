import { Truck, Globe, Clock, Package, MapPin, Shield } from "lucide-react"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Shipping Information - Linen Sarees",
  description: "Learn about our shipping rates, delivery times, and policies for domestic and international orders.",
}

export default function ShippingPage() {
  const domesticRates = [
    {
      method: "Cash on Delivery (COD)",
      cost: "₹100",
      timeframe: "5-7 business days",
      description: "Pay when you receive your order"
    },
    {
      method: "Prepaid Orders",
      cost: "Free",
      timeframe: "3-5 business days",
      description: "Free shipping on all prepaid orders"
    }
  ]

  const internationalRates = [
    {
      region: "North America",
      cost: "$25-35",
      timeframe: "7-14 business days"
    },
    {
      region: "Europe",
      cost: "$30-40", 
      timeframe: "10-16 business days"
    },
    {
      region: "Australia & New Zealand",
      cost: "$35-45",
      timeframe: "12-18 business days"
    },
    {
      region: "Asia Pacific",
      cost: "$20-30",
      timeframe: "5-10 business days"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[96px] lg:pt-[104px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Shipping Information
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Fast, secure delivery of your handcrafted sarees worldwide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Shipping Overview */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Our Shipping Promise</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  We understand that receiving your beautiful saree is an exciting moment. That's why we've partnered with trusted courier services to ensure your order reaches you safely and on time.
                </p>
                <p>
                  Every saree is carefully packaged with eco-friendly materials to protect your purchase while minimizing environmental impact.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Secure Packaging</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Each saree is carefully wrapped and protected during transit
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Order Tracking</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Track your order from dispatch to delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Worldwide Delivery</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      We ship to 25+ countries across the globe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Domestic Shipping */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Domestic Shipping (India)</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {domesticRates.map((rate, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <h3 className="font-serif text-xl font-medium mb-4">{rate.method}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-muted-foreground">Shipping Cost:</span>
                    <span className="font-sans font-medium text-primary">{rate.cost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-muted-foreground">Delivery Time:</span>
                    <span className="font-sans font-medium">{rate.timeframe}</span>
                  </div>
                </div>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {rate.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h3 className="font-serif text-xl font-medium mb-4">Important Notes for Domestic Orders</h3>
            <div className="space-y-3 font-sans text-muted-foreground leading-relaxed">
              <p>• COD is available for most locations across India</p>
              <p>• Some remote areas may have limited COD availability</p>
              <p>• Orders are dispatched within 1-5 days depending on the saree (handloom items may take longer)</p>
              <p>• You'll receive tracking information via email once your order is dispatched</p>
              <p>• Maximum of 3 delivery attempts will be made by the courier</p>
            </div>
          </div>
        </section>

        {/* International Shipping */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">International Shipping</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {internationalRates.map((rate, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <h3 className="font-serif text-xl font-medium mb-4">{rate.region}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-muted-foreground">Shipping Cost:</span>
                    <span className="font-sans font-medium text-primary">{rate.cost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-muted-foreground">Delivery Time:</span>
                    <span className="font-sans font-medium">{rate.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h3 className="font-serif text-xl font-medium mb-4">International Shipping Notes</h3>
            <div className="space-y-3 font-sans text-muted-foreground leading-relaxed">
              <p>• All international orders require prepayment</p>
              <p>• Customs duties and taxes are the responsibility of the recipient</p>
              <p>• Delivery times may vary due to customs clearance</p>
              <p>• We ship to 25+ countries worldwide</p>
              <p>• Returns and exchanges are not available for international orders</p>
              <p>• Contact us for shipping rates to countries not listed above</p>
            </div>
          </div>
        </section>

        {/* Processing Time */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Processing & Dispatch</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl font-light text-primary">1-2</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-3">Ready Stock Items</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                Items in stock are processed and dispatched within 1-2 business days
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl font-light text-primary">3-5</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-3">Handloom Items</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                Handcrafted sarees may require 3-5 days for final quality checks and dispatch
              </p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl font-light text-primary">5+</span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-3">Made to Order</h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                Custom or made-to-order items may take 5+ days as mentioned on the product page
              </p>
            </div>
          </div>
        </section>

        {/* Tracking Your Order */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Tracking Your Order
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stay updated on your order's journey from our workshop to your doorstep
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "Order Confirmed",
                description: "You'll receive an email confirmation with your order details"
              },
              {
                step: "Processing",
                description: "Your saree is being prepared and quality checked"
              },
              {
                step: "Dispatched",
                description: "Order shipped with tracking details sent to your email"
              },
              {
                step: "Delivered",
                description: "Your beautiful saree arrives at your doorstep"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-lg font-light text-primary">{index + 1}</span>
                </div>
                <h3 className="font-serif text-lg font-medium mb-3">{step.step}</h3>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact for Shipping */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Questions About Shipping?
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Our customer service team is here to help with any shipping questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Support
              </a>
              <a 
                href="tel:+91 92641-51111" 
                className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Call: +91 92641-51111
              </a>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}