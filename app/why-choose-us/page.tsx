'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Star, Heart, Shield, Truck, Award } from 'lucide-react'
import Head from 'next/head'

export default function WhyChooseUsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: '🌿',
      iconComponent: <Award className="w-8 h-8" />,
      title: 'Premium Quality Linen',
      description: 'We use carefully sourced natural linen fabric that is breathable, lightweight, and exceptionally comfortable—perfect for all-day wear in every season.',
      color: 'from-primary/20 to-accent/20'
    },
    {
      icon: '🧵',
      iconComponent: <Star className="w-8 h-8" />,
      title: 'Made in India | Timeless Handloom Craftsmanship',
      description: 'Proudly Made in India, each saree is crafted using traditional handloom techniques, blending heritage craftsmanship with modern, elegant designs that never go out of style.',
      color: 'from-accent/20 to-primary/20'
    },
    {
      icon: '✨',
      iconComponent: <Heart className="w-8 h-8" />,
      title: 'Elegant & Versatile Designs',
      description: 'From everyday grace to festive sophistication, our linen sarees are designed for workwear, casual outings, and special occasions, offering effortless elegance every time.',
      color: 'from-primary/15 to-accent/25'
    },
    {
      icon: '💯',
      iconComponent: <CheckCircle className="w-8 h-8" />,
      title: 'Authentic & Honest Pricing',
      description: 'No middlemen, no inflated prices. We offer premium linen sarees at fair, transparent prices, giving you true value for quality.',
      color: 'from-accent/20 to-primary/15'
    },
    {
      icon: '❤️',
      iconComponent: <Heart className="w-8 h-8" />,
      title: 'Loved by 10,000+ Women Across India',
      description: 'Trusted and cherished by 10,000+ happy customers, our sarees are known for their comfort, quality, and timeless appeal.',
      color: 'from-primary/25 to-accent/15'
    },
    {
      icon: '🚚',
      iconComponent: <Truck className="w-8 h-8" />,
      title: 'Pan-India Safe & Reliable Delivery',
      description: 'We deliver across India with secure packaging and timely shipping, ensuring your saree reaches you in perfect condition.',
      color: 'from-accent/15 to-primary/20'
    }
  ]

  const benefits = [
    {
      icon: '💰',
      iconComponent: <Shield className="w-6 h-6" />,
      title: 'COD Available',
      subtitle: '🔐 Secure Payments',
      description: 'Enjoy Cash on Delivery, along with 100% secure online payment options for a worry-free shopping experience.',
      gradient: 'from-primary to-primary/80'
    },
    {
      icon: '🔄',
      iconComponent: <CheckCircle className="w-6 h-6" />,
      title: 'Easy Returns',
      description: 'Your satisfaction comes first. We offer easy and hassle-free returns, making shopping with us completely stress-free.',
      gradient: 'from-accent to-accent/80'
    },
    {
      icon: '🚚',
      iconComponent: <Truck className="w-6 h-6" />,
      title: 'Free Shipping Above ₹999',
      description: 'Get free shipping on all orders above ₹999—no hidden charges.',
      gradient: 'from-primary/80 to-accent'
    },
    {
      icon: '🌱',
      iconComponent: <Award className="w-6 h-6" />,
      title: 'Sustainable & Conscious Choice',
      description: 'Linen is eco-friendly, durable, and sustainable—making it the perfect choice for conscious fashion lovers.',
      gradient: 'from-accent/80 to-primary'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Unique Designs' },
    { number: '99%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Customer Support' }
  ]

  return (
    <>
      <Head>
        <title>Why Choose Linen Saree | Premium Quality & Authentic Craftsmanship</title>
        <meta name="description" content="Discover why 10,000+ women across India trust Linen Saree for premium quality, handloom craftsmanship, and authentic pricing. Made in India with love." />
      </Head>
      
      <div className="min-h-screen bg-background">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-secondary via-background to-secondary py-20 sm:py-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/handloom-saree.jpg')] bg-cover bg-center opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-accent rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-primary/70 rounded-full animate-bounce delay-1000"></div>
          
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg border border-border">
                <Star className="w-5 h-5 text-primary fill-current" />
                <span className="text-sm font-medium text-foreground">India's Most Trusted Linen Saree Brand</span>
                <Star className="w-5 h-5 text-primary fill-current" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
                <span className="block">🌟 Why Choose</span>
                <span className="block text-primary">
                  Linen Saree?
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground mb-12 max-w-3xl mx-auto">
                Discover the perfect blend of <span className="font-semibold text-primary">tradition</span>, 
                <span className="font-semibold text-accent"> quality</span>, and 
                <span className="font-semibold text-primary/80"> modern elegance</span> that makes us India's trusted choice.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className={`text-center transition-all duration-700 delay-${index * 200} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Features Grid */}
        <div className="py-20 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                What Makes Us <span className="text-primary">Special</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every thread tells a story of excellence, every weave speaks of tradition, and every saree embodies our commitment to quality.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-3xl bg-card p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-border ${
                    activeFeature === index ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px]">
                    <div className="w-full h-full bg-card rounded-3xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    {/* Icon with Animation */}
                    <div className="flex items-center justify-center w-16 h-16 mb-6 mx-auto">
                      <div className={`text-4xl transition-transform duration-500 group-hover:scale-110 ${activeFeature === index ? 'animate-bounce' : ''}`}>
                        {feature.icon}
                      </div>
                    </div>
                    
                    {/* Modern Icon Overlay */}
                    <div className={`absolute top-6 right-6 text-muted-foreground transition-all duration-500 group-hover:text-primary group-hover:scale-110 ${activeFeature === index ? 'opacity-100' : 'opacity-0'}`}>
                      {feature.iconComponent}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-4 text-center group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed text-center group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Benefits Section */}
        <div className="relative py-20 sm:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-background to-secondary">
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B7355' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg border border-border">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">100% Secure & Hassle-Free</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Shopping Made <span className="text-primary">Simple</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We've designed every aspect of your shopping experience to be seamless, secure, and satisfying.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group text-center relative"
                >
                  {/* Animated Background Circle */}
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <div className={`absolute inset-2 bg-gradient-to-r ${benefit.gradient} rounded-full opacity-90 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                      <div className="text-white">
                        {benefit.iconComponent}
                      </div>
                    </div>
                    {/* Pulse Animation */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} rounded-full animate-ping opacity-20`}></div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                    {benefit.subtitle && (
                      <span className="block text-sm font-medium text-primary mt-1">
                        {benefit.subtitle}
                      </span>
                    )}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {benefit.description}
                  </p>
                  
                  {/* Hover Line Effect */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-16 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Trust Section */}
        <div className="py-20 sm:py-32 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary">
            <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5L61.8 38.2L95 38.2L68.1 61.8L79.9 95L50 71.4L20.1 95L31.9 61.8L5 38.2L38.2 38.2L50 5Z' fill='%238B7355' fill-opacity='0.03'/%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Animated Heart Icon */}
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Heart className="w-12 h-12 text-white fill-current animate-bounce" />
                </div>
                {/* Floating Hearts */}
                <div className="absolute -top-4 -right-4 text-primary animate-bounce delay-300">❤️</div>
                <div className="absolute -bottom-4 -left-4 text-accent animate-bounce delay-700">💕</div>
                <div className="absolute top-8 -left-8 text-primary/70 animate-bounce delay-1000">💖</div>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
                <span className="block">Trusted by</span>
                <span className="block text-primary">
                  10,000+ Women
                </span>
                <span className="block text-2xl md:text-3xl font-medium text-muted-foreground mt-4">
                  Across India
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-4xl mx-auto">
                Join thousands of satisfied customers who have made Linen Saree their go-to choice for 
                <span className="font-semibold text-primary"> premium quality</span>, 
                <span className="font-semibold text-accent"> authentic craftsmanship</span>, and 
                <span className="font-semibold text-primary/80"> unmatched comfort</span>.
              </p>
              
              {/* Customer Reviews Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
                {[
                  { name: "Priya S.", location: "Mumbai", review: "Absolutely love the quality! The linen is so comfortable and the designs are stunning." },
                  { name: "Anjali R.", location: "Delhi", review: "Fast delivery and beautiful packaging. The saree exceeded my expectations!" },
                  { name: "Meera K.", location: "Bangalore", review: "Perfect for both office wear and special occasions. Highly recommended!" }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-primary fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 italic">"{testimonial.review}"</p>
                    <div className="text-sm font-medium text-foreground">
                      {testimonial.name}
                      <span className="text-muted-foreground ml-1">• {testimonial.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="/collections"
                  className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    Shop Our Collection
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                </a>
                
                <a
                  href="/contact"
                  className="group inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-foreground bg-card border-2 border-border rounded-full shadow-lg hover:shadow-xl hover:border-primary hover:text-primary transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    Contact Us
                    <div className="w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300"></div>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Bottom CTA */}
        <div className="relative py-20 overflow-hidden">
          {/* Gradient Background with Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground">
            <div className="absolute inset-0 animate-pulse" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4A77D' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30l-15-15zm-15 0l15 15v-30l-15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-6 h-6 bg-primary rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-20 right-20 w-4 h-4 bg-accent rounded-full animate-bounce delay-500 opacity-60"></div>
          <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-primary/70 rounded-full animate-bounce delay-1000 opacity-60"></div>
          
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-background">Premium Quality Guaranteed</span>
              <Award className="w-5 h-5 text-primary" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-background mb-6">
              Experience the <span className="text-primary">Linen Saree</span> Difference
            </h2>
            
            <p className="text-xl md:text-2xl text-background/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Premium quality, authentic craftsmanship, and honest pricing—all delivered to your doorstep with love and care.
            </p>
            
            {/* Enhanced Final CTA */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <a
                href="/collections"
                className="relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-foreground bg-gradient-to-r from-primary via-accent to-primary rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group"
              >
                <span className="flex items-center gap-3">
                  Start Shopping Now
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200"></div>
                  </div>
                </span>
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-background/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span className="text-sm">Free Shipping ₹999+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="text-sm">10,000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}