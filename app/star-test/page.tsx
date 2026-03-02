"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StarRating } from "@/components/star-rating"

export default function StarTestPage() {
  const [rating, setRating] = useState(0)

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px]">
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="font-serif text-4xl mb-8">Interactive Star Rating Test</h1>
            
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-medium mb-6">Click the stars to rate!</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Rating: {rating}/5</h3>
                  <StarRating
                    rating={rating}
                    interactive={true}
                    onRatingChange={setRating}
                    size="lg"
                    className="justify-center"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-medium mb-4">Small Interactive</h4>
                    <StarRating
                      rating={rating}
                      interactive={true}
                      onRatingChange={setRating}
                      size="sm"
                      className="justify-center"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Medium Interactive</h4>
                    <StarRating
                      rating={rating}
                      interactive={true}
                      onRatingChange={setRating}
                      size="md"
                      className="justify-center"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Large Interactive</h4>
                    <StarRating
                      rating={rating}
                      interactive={true}
                      onRatingChange={setRating}
                      size="lg"
                      className="justify-center"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setRating(0)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Reset Rating
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-medium mb-6">Non-Interactive Examples</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-medium mb-4">4.5 Stars</h4>
                  <StarRating
                    rating={4.5}
                    interactive={false}
                    size="md"
                    showRating={true}
                    className="justify-center"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-4">3.2 Stars</h4>
                  <StarRating
                    rating={3.2}
                    interactive={false}
                    size="md"
                    showRating={true}
                    className="justify-center"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-4">5.0 Stars</h4>
                  <StarRating
                    rating={5.0}
                    interactive={false}
                    size="md"
                    showRating={true}
                    className="justify-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}