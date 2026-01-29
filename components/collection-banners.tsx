'use client'

import Link from "next/link"
import Image from "next/image"

export function CollectionBanners() {
  return (
    <div className="space-y-12 py-8">
      {/* Festival Collection Banner */}
      <section className="relative overflow-hidden mx-4 lg:mx-0 rounded-lg lg:rounded-none shadow-2xl lg:shadow-none">
        <Link 
          href="/collections/festival" 
          className="group block"
        >
          <div className="relative h-[400px] md:h-[500px] lg:h-[550px]">
            <Image
              src="/images/bridal-saree.jpg"
              alt="Festival Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Minimal bottom gradient for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-4xl px-4 md:px-8">
                <div className="mb-6 md:mb-8">
                  <h2 className="banner-text-shadow">
                    <span className="block text-3xl md:text-5xl lg:text-6xl font-script mb-2 md:mb-4 text-white">festive</span>
                    <span className="block text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider text-white">COLLECTION</span>
                  </h2>
                </div>
                
                <div className="bg-[#8B7355] text-white px-6 md:px-10 py-3 md:py-4 rounded-full inline-block mb-6 md:mb-8 shadow-2xl">
                  <span className="text-sm md:text-xl lg:text-2xl font-bold tracking-widest">CELEBRATE IN STYLE</span>
                </div>
                
                <p className="text-white text-base md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto font-light banner-text-shadow">
                  Discover our exquisite collection of premium linen sarees perfect for festivals and celebrations
                </p>
                
                <div className="inline-flex items-center bg-white text-[#2C2420] px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-sm md:text-xl group-hover:bg-[#C4A77D] group-hover:text-white transition-all duration-300 shadow-2xl">
                  <span>SHOP FESTIVAL COLLECTION</span>
                  <svg className="ml-2 md:ml-4 w-4 md:w-6 h-4 md:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Offers Collection Banner */}
      <section className="relative overflow-hidden mx-4 lg:mx-0 rounded-lg lg:rounded-none shadow-2xl lg:shadow-none">
        <Link 
          href="/collections/offers" 
          className="group block"
        >
          <div className="relative h-[400px] md:h-[500px] lg:h-[550px]">
            <Image
              src="/images/designer-saree.jpg"
              alt="Special Offers"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Minimal bottom gradient for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-4xl px-4 md:px-8">
                <div className="mb-6 md:mb-8">
                  <h2 className="banner-text-shadow">
                    <span className="block text-3xl md:text-5xl lg:text-6xl font-script mb-2 md:mb-4 text-white">festive</span>
                    <span className="block text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider text-white">BIG SALE</span>
                  </h2>
                </div>
                
                <div className="bg-[#8B7355] text-white px-6 md:px-10 py-3 md:py-4 rounded-full inline-block mb-6 md:mb-8 shadow-2xl border-2 md:border-4 border-white">
                  <span className="text-sm md:text-xl lg:text-2xl font-bold tracking-widest">UP TO 60% OFF</span>
                </div>
                
                <p className="text-white text-base md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto font-light banner-text-shadow">
                  Limited time offer on premium linen sarees - Don't miss out on these incredible deals!
                </p>
                
                <div className="inline-flex items-center bg-white text-[#2C2420] px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-sm md:text-xl group-hover:bg-[#C4A77D] group-hover:text-white transition-all duration-300 shadow-2xl">
                  <span>SHOP SALE NOW</span>
                  <svg className="ml-2 md:ml-4 w-4 md:w-6 h-4 md:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </div>
  )
}