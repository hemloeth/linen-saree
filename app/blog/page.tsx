"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { resolveMediaUrl } from "@/lib/media"

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  featured: boolean;
}

const categories = ["All", "Fashion", "Craftsmanship", "Sustainability", "Care Tips", "History"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://sareeghar.com' : 'http://127.0.0.1:5000')
        const response = await fetch(`${apiUrl}/api/blog/allblogs`)
        const data = await response.json()

        if (data.success && data.blogs) {
          // Map backend data to the frontend shape
          const mappedBlogs: BlogPost[] = data.blogs.map((b: any, index: number) => ({
            id: b._id,
            slug: b._id, // Using ID as slug for now since there's no backend slug field
            title: b.title,
            // Strip HTML for excerpt
            excerpt: b.description ? b.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : 'Read our latest blog post...',
            content: b.description,
            author: "Linen Saree Team",
            date: b.createdAt || new Date().toISOString(),
            category: "Fashion", // Default category since it's not in the backend schema
            image: b.image || "/images/placeholder.jpg",
            featured: index === 0 // Make the newest post featured
          }))
          setBlogPosts(mappedBlogs)
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background pt-[96px] lg:pt-[104px]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Our Blog
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Stories, insights, and inspiration from the world of linen sarees
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-16 lg:py-24">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl lg:text-3xl font-light">
              {filteredPosts.length} Articles
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No articles found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {(selectedCategory === "All" && searchQuery === "" ? blogPosts : filteredPosts).map((post) => (
                <article key={post.id} className="group bg-card hover:bg-muted/10 rounded-2xl overflow-hidden transition-all duration-300 border border-border/50 hover:shadow-md hover:border-border">
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Image on left (or top on mobile) */}
                    <div className="sm:w-2/5 relative aspect-video sm:aspect-auto sm:h-full min-h-[320px] overflow-hidden shrink-0">
                      <Link href={`/blog/${post.slug}`}>
                        <Image
                          src={resolveMediaUrl(post.image)}
                          alt={post.title}
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>
                    </div>

                    {/* Content on right (or bottom on mobile) */}
                    <div className="sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
                        <span>{post.category}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-muted-foreground">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="font-serif text-xl lg:text-2xl font-medium mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{post.author}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-24 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl font-light mb-4">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest articles, styling tips, and exclusive offers delivered to your inbox.
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

      <Footer />
    </div>
  )
}
