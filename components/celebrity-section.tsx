"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    quote: "The craftsmanship and attention to detail in every saree is absolutely stunning. Linen Sarees has redefined what elegance means to me.",
    author: "Fashion Forward Magazine",
  },
  {
    quote: "A perfect blend of tradition and contemporary style. Each piece tells a story of heritage and artistry.",
    author: "Vogue India",
  },
  {
    quote: "The comfort of linen combined with such exquisite designs makes this collection truly exceptional.",
    author: "Elle Magazine",
  },
]

export function CelebritySection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-primary mb-6">
              As Seen In
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light mb-10 leading-tight">
              Loved by
              <br />
              <span className="italic">Connoisseurs</span>
            </h2>

            {/* Testimonial Slider */}
            <div className="relative min-h-[200px] mb-10">
              <div className="transition-opacity duration-500">
                <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-foreground/90 mb-6">
                  &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </p>
                <p className="font-sans text-sm tracking-wider uppercase text-primary">
                  — {testimonials[currentIndex].author}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="font-sans text-sm text-foreground/50 ml-4">
                {currentIndex + 1} / {testimonials.length}
              </span>
            </div>

            <Link
              href="#press"
              className="group inline-flex items-center gap-3 mt-10 font-sans text-sm tracking-wider uppercase hover:text-primary transition-colors"
            >
              View More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/celebrity-look.jpg"
              alt="Celebrity styling"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
