"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section className="relative h-[calc(100vh-104px)] w-full overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-saree.jpg"
      >
        <source
          src="https://videos.pexels.com/video-files/3983632/3983632-uhd_2732_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <p className="text-sm tracking-[0.3em] uppercase mb-4 font-sans">
          Handcrafted Excellence
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light mb-6 text-balance">
          Timeless Elegance
          <br />
          <span className="italic">in Every Thread</span>
        </h1>
        <p className="text-lg md:text-xl font-light max-w-xl mb-8 text-white/90">
          Discover our exquisite collection of premium linen sarees, crafted with love by master artisans
        </p>
        <div className="flex gap-4">
          <Link href="/collections/pure-linen">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-sm tracking-wide"
            >
              Shop Collection
            </Button>
          </Link>
          <Link href="/collections">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-sm tracking-wide bg-transparent"
            >
              Explore All
            </Button>
          </Link>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        <button
          onClick={togglePlay}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleMute}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors text-white"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-xs tracking-widest uppercase mb-2">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent" />
        </div>
      </div>
    </section>
  )
}
