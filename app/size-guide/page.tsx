import { Ruler, User, Info, HelpCircle } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Size Guide - Linen Sarees",
  description: "Find your perfect fit with our comprehensive sizing guide for sarees, blouses, and ethnic wear.",
}

export default function SizeGuidePage() {
  const blouseSizes = [
    { size: "XS", bust: "32", waist: "26", shoulder: "13.5", length: "14" },
    { size: "S", bust: "34", waist: "28", shoulder: "14", length: "14.5" },
    { size: "M", bust: "36", waist: "30", shoulder: "14.5", length: "15" },
    { size: "L", bust: "38", waist: "32", shoulder: "15", length: "15.5" },
    { size: "XL", bust: "40", waist: "34", shoulder: "15.5", length: "16" },
    { size: "XXL", bust: "42", waist: "36", shoulder: "16", length: "16.5" },
    { size: "3XL", bust: "44", waist: "38", shoulder: "16.5", length: "17" }
  ]

  const kurtiSizes = [
    { size: "XS", bust: "34", waist: "32", hip: "36", length: "44" },
    { size: "S", bust: "36", waist: "34", hip: "38", length: "44" },
    { size: "M", bust: "38", waist: "36", hip: "40", length: "44" },
    { size: "L", bust: "40", waist: "38", hip: "42", length: "44" },
    { size: "XL", bust: "42", waist: "40", hip: "44", length: "44" },
    { size: "XXL", bust: "44", waist: "42", hip: "46", length: "44" },
    { size: "3XL", bust: "46", waist: "44", hip: "48", length: "44" }
  ]

  const measurementTips = [
    {
      title: "Bust Measurement",
      description: "Measure around the fullest part of your bust, keeping the tape parallel to the floor."
    },
    {
      title: "Waist Measurement", 
      description: "Measure around your natural waistline, which is typically the narrowest part of your torso."
    },
    {
      title: "Hip Measurement",
      description: "Measure around the fullest part of your hips, approximately 7-9 inches below your waist."
    },
    {
      title: "Shoulder Width",
      description: "Measure from one shoulder point to the other across your back."
    },
    {
      title: "Blouse Length",
      description: "Measure from the highest point of your shoulder down to where you want the blouse to end."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Size Guide
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Find your perfect fit with our comprehensive sizing guide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Saree Sizing */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Saree Sizing</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  Sarees are one-size-fits-all garments that can be draped to suit different body types and preferences. Our sarees typically measure 5.5 to 6 meters in length with a 0.8-meter blouse piece.
                </p>
                <p>
                  The beauty of a saree lies in its versatility – it can be adjusted and styled to flatter any figure. The key is in the draping technique and the fit of the blouse.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <h3 className="font-serif text-2xl font-light mb-6">Standard Saree Dimensions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Saree Length</span>
                  <span className="font-sans text-muted-foreground">5.5 - 6 meters</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Saree Width</span>
                  <span className="font-sans text-muted-foreground">44 - 46 inches</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-sans font-medium">Blouse Piece</span>
                  <span className="font-sans text-muted-foreground">0.8 - 1 meter</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-sans font-medium">Border Width</span>
                  <span className="font-sans text-muted-foreground">Varies by design</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blouse Size Chart */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Blouse Size Chart</h2>
          </div>

          <div className="bg-muted/30 rounded-2xl p-8 overflow-x-auto">
            <h3 className="font-serif text-xl font-medium mb-6">Ready-to-Wear Blouse Sizes (in inches)</h3>
            <div className="min-w-[600px]">
              <div className="grid grid-cols-5 gap-4 mb-4 font-sans font-medium text-sm">
                <div className="p-3 bg-primary/10 rounded text-center">Size</div>
                <div className="p-3 bg-primary/10 rounded text-center">Bust</div>
                <div className="p-3 bg-primary/10 rounded text-center">Waist</div>
                <div className="p-3 bg-primary/10 rounded text-center">Shoulder</div>
                <div className="p-3 bg-primary/10 rounded text-center">Length</div>
              </div>
              {blouseSizes.map((size, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 mb-2 font-sans text-sm">
                  <div className="p-3 bg-background rounded text-center font-medium">{size.size}</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.bust}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.waist}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.shoulder}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.length}"</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kurti Size Chart */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Kurti Size Chart</h2>
          </div>

          <div className="bg-muted/30 rounded-2xl p-8 overflow-x-auto">
            <h3 className="font-serif text-xl font-medium mb-6">Ethnic Wear Sizes (in inches)</h3>
            <div className="min-w-[600px]">
              <div className="grid grid-cols-5 gap-4 mb-4 font-sans font-medium text-sm">
                <div className="p-3 bg-primary/10 rounded text-center">Size</div>
                <div className="p-3 bg-primary/10 rounded text-center">Bust</div>
                <div className="p-3 bg-primary/10 rounded text-center">Waist</div>
                <div className="p-3 bg-primary/10 rounded text-center">Hip</div>
                <div className="p-3 bg-primary/10 rounded text-center">Length</div>
              </div>
              {kurtiSizes.map((size, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 mb-2 font-sans text-sm">
                  <div className="p-3 bg-background rounded text-center font-medium">{size.size}</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.bust}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.waist}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.hip}"</div>
                  <div className="p-3 bg-background rounded text-center text-muted-foreground">{size.length}"</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Measure */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              How to Take Your Measurements
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Follow these simple steps to get accurate measurements for the perfect fit
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {measurementTips.map((tip, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="font-serif text-lg font-light text-primary">{index + 1}</span>
                </div>
                <h3 className="font-serif text-lg font-medium mb-4">{tip.title}</h3>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Measurement Tips */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium">Measurement Tips</h3>
              </div>
              <div className="space-y-4 font-sans text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Use a flexible measuring tape for accurate results</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Wear well-fitted undergarments while measuring</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Keep the tape snug but not tight</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Stand straight and breathe normally</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Ask someone to help you for better accuracy</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Measure over thin clothing if needed</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-medium">Fitting Guidelines</h3>
              </div>
              <div className="space-y-4 font-sans text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Choose a size based on your largest measurement</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Consider the fabric type and stretch</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Allow for comfortable movement</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Custom alterations available for blouses</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Contact us if you're between sizes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-sm">Size exchanges available for ethnic wear</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Fitting */}
        <section className="mb-20 lg:mb-32">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
                Custom Blouse Fitting
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                For the perfect fit, we offer custom blouse stitching services. Provide your measurements and we'll create a blouse tailored just for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-medium mb-2">Send Measurements</h3>
                <p className="font-sans text-muted-foreground text-sm">
                  Provide your detailed measurements
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-medium mb-2">Expert Tailoring</h3>
                <p className="font-sans text-muted-foreground text-sm">
                  Our skilled tailors craft your blouse
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-medium mb-2">Perfect Fit</h3>
                <p className="font-sans text-muted-foreground text-sm">
                  Receive a perfectly fitted blouse
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="font-sans text-muted-foreground mb-6">
                Additional charges apply for custom fitting. Processing time: 7-10 business days.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Request Custom Fitting
              </a>
            </div>
          </div>
        </section>

        {/* Need Help */}
        <section className="mb-16">
          <div className="bg-muted/30 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Need Help with Sizing?
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Our customer service team is here to help you find the perfect fit. Don't hesitate to reach out with any sizing questions.
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
    </div>
  )
}