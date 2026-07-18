"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://linensaree.in' : 'http://127.0.0.1:5000')
        const id = params.slug
        
        // Fetch all blogs since the /:id endpoint might not be deployed yet
        const response = await fetch(`${apiUrl}/api/blog/allblogs`)
        const data = await response.json()
        
        if (data.success && data.blogs) {
          const b = data.blogs.find((blog: any) => blog._id === id)
          
          if (b) {
            const mappedPost = {
              id: b._id,
              slug: b._id,
              title: b.title,
              excerpt: b.description ? b.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '',
              content: b.description,
              author: "Linen Saree Team",
              date: b.createdAt || new Date().toISOString(),
              category: "Fashion",
              image: b.image || "/images/placeholder.jpg",
              readTime: "5 min read",
              tags: ["saree", "fashion", "linen"]
            }
            setPost(mappedPost)
            setLikes(Math.floor(Math.random() * 100) + 20) // Random likes for demo
          }

          // Related posts
          const others = data.blogs.filter((x: any) => x._id !== id).slice(0, 3)
          setRelatedPosts(others.map((blog: any) => ({
            id: blog._id,
            slug: blog._id,
            title: blog.title,
            image: blog.image || "/images/placeholder.jpg",
            category: "Fashion"
          })))
        }

      } catch (error) {
        console.error("Error fetching blog:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
        fetchBlog()
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
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full mb-8">
          <img
            src={resolveMediaUrl(post.image)}
            alt={post.title}
            className="w-full h-auto rounded-2xl shadow-sm"
          />
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
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
                        src={resolveMediaUrl(relatedPost.image)}
                        alt={relatedPost.title}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
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
