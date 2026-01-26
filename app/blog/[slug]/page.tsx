"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

// Sample blog data - in a real app, this would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    slug: "art-of-handloom-weaving",
    title: "The Art of Handloom Weaving: Preserving Ancient Traditions",
    excerpt: "Discover the intricate process behind our handwoven sarees and the skilled artisans who bring these masterpieces to life.",
    content: `
      <p>Handloom weaving is more than just a craft—it's a living tradition that has been passed down through generations of skilled artisans. In our workshops across India, master weavers continue to create exquisite linen sarees using techniques that have remained unchanged for centuries.</p>
      
      <h2>The Weaving Process</h2>
      <p>Each linen saree begins its journey with the careful selection of premium linen fibers. Our artisans examine each thread for quality, ensuring that only the finest materials make it to the loom. The process involves several intricate steps:</p>
      
      <h3>1. Yarn Preparation</h3>
      <p>The linen yarn is carefully prepared and dyed using natural colors derived from plants, minerals, and other organic sources. This eco-friendly approach not only creates beautiful, lasting colors but also ensures that our sarees are gentle on the skin.</p>
      
      <h3>2. Setting the Loom</h3>
      <p>Setting up the handloom is an art in itself. The warp threads are carefully arranged according to the desired pattern, with each thread positioned with mathematical precision. This process can take several hours for complex designs.</p>
      
      <h3>3. The Weaving</h3>
      <p>The actual weaving is where the magic happens. Our master weavers work with incredible skill and patience, interlacing the weft threads through the warp to create intricate patterns and textures. A single saree can take anywhere from 3 to 15 days to complete, depending on the complexity of the design.</p>
      
      <h2>Preserving Tradition</h2>
      <p>We are committed to preserving these ancient techniques while providing fair wages and working conditions for our artisans. Each purchase supports not just the weaver, but their entire family and community.</p>
      
      <p>When you wear one of our handwoven linen sarees, you're not just wearing a piece of clothing—you're carrying forward a tradition that connects you to generations of skilled craftspeople and their timeless artistry.</p>
    `,
    author: "Priya Sharma",
    date: "2024-01-15",
    category: "Craftsmanship",
    image: "/images/handloom-saree.jpg",
    readTime: "5 min read",
    tags: ["handloom", "weaving", "artisans", "tradition"]
  },
  {
    id: 2,
    slug: "styling-linen-sarees-modern-woman",
    title: "Styling Linen Sarees for the Modern Woman",
    excerpt: "Learn how to style linen sarees for different occasions, from office wear to evening parties.",
    content: `
      <p>Linen sarees are incredibly versatile and can be styled for any occasion. Here's your complete guide to wearing linen sarees with confidence and elegance.</p>
      
      <h2>Office Wear</h2>
      <p>For professional settings, choose linen sarees in solid colors or subtle patterns. Pair with a well-fitted blouse and minimal jewelry. A structured blazer can add a contemporary touch while maintaining professionalism.</p>
      
      <h2>Casual Outings</h2>
      <p>Embrace the relaxed nature of linen for casual wear. Opt for lighter colors and comfortable draping styles. Add a denim jacket or cotton shrug for a fusion look that's perfect for brunches or shopping trips.</p>
      
      <h2>Evening Events</h2>
      <p>Transform your linen saree for evening wear with the right accessories. Choose sarees with metallic threads or embellishments, and pair with statement jewelry and elegant footwear.</p>
    `,
    author: "Meera Patel",
    date: "2024-01-10",
    category: "Fashion",
    image: "/images/casual-saree.jpg",
    readTime: "4 min read",
    tags: ["styling", "fashion", "modern", "occasions"]
  }
  // Add more posts as needed
]

const relatedPosts = [
  {
    id: 3,
    slug: "sustainable-fashion-linen-sarees",
    title: "Sustainable Fashion: Why Linen Sarees are the Future",
    image: "/images/designer-saree.jpg",
    category: "Sustainability"
  },
  {
    id: 4,
    slug: "care-guide-linen-sarees",
    title: "Complete Care Guide for Your Linen Sarees",
    image: "/images/festive-saree.jpg",
    category: "Care Tips"
  },
  {
    id: 5,
    slug: "history-of-linen-in-indian-textiles",
    title: "The Rich History of Linen in Indian Textiles",
    image: "/images/bridal-saree.jpg",
    category: "History"
  }
]

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    // Find the post by slug
    const foundPost = blogPosts.find(p => p.slug === params.slug)
    if (foundPost) {
      setPost(foundPost)
      setLikes(Math.floor(Math.random() * 100) + 20) // Random likes for demo
    }
  }, [params.slug])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-serif mb-4">Post not found</h1>
            <Link href="/blog" className="text-primary hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-[96px] lg:pt-[104px]">
        {/* Back to Blog */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[21/9] mb-8 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16">
          <article>
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-muted-foreground">{post.readTime}</span>
              </div>
              
              <h1 className="font-serif text-3xl lg:text-5xl font-light mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                      isLiked 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{likes}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-light prose-p:leading-relaxed prose-p:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="font-serif text-lg font-medium mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Author Bio */}
          <div className="mt-16 p-6 bg-muted/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium mb-2">About {post.author}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {post.author} is a fashion expert and textile enthusiast with over 10 years of experience 
                  in the Indian fashion industry. She specializes in traditional textiles and sustainable fashion practices.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-16">
            <h2 className="font-serif text-2xl lg:text-3xl font-light mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="group">
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded mb-2">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-serif text-lg font-medium group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
            <h2 className="font-serif text-2xl font-light mb-4">
              Enjoyed this article?
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for more styling tips and fashion insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <Button className="px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}