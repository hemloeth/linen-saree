"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Sample blog data - in a real app, this would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    slug: "art-of-handloom-weaving",
    title: "The Art of Handloom Weaving: Preserving Ancient Traditions",
    excerpt: "Discover the intricate process behind our handwoven sarees and the skilled artisans who bring these masterpieces to life.",
    content: "Full article content here...",
    author: "Priya Sharma",
    date: "2024-01-15",
    category: "Craftsmanship",
    image: "/images/handloom-saree.jpg",
    featured: true
  },
  {
    id: 2,
    slug: "styling-linen-sarees-modern-woman",
    title: "Styling Linen Sarees for the Modern Woman",
    excerpt: "Learn how to style linen sarees for different occasions, from office wear to evening parties.",
    content: "Full article content here...",
    author: "Meera Patel",
    date: "2024-01-10",
    category: "Fashion",
    image: "/images/casual-saree.jpg",
    featured: false
  },
  {
    id: 3,
    slug: "sustainable-fashion-linen-sarees",
    title: "Sustainable Fashion: Why Linen Sarees are the Future",
    excerpt: "Explore how linen sarees contribute to sustainable fashion and eco-friendly clothing choices.",
    content: "Full article content here...",
    author: "Anjali Gupta",
    date: "2024-01-05",
    category: "Sustainability",
    image: "/images/designer-saree.jpg",
    featured: true
  },
  {
    id: 4,
    slug: "care-guide-linen-sarees",
    title: "Complete Care Guide for Your Linen Sarees",
    excerpt: "Essential tips to maintain the beauty and longevity of your precious linen sarees.",
    content: "Full article content here...",
    author: "Kavya Reddy",
    date: "2024-01-01",
    category: "Care Tips",
    image: "/images/festive-saree.jpg",
    featured: false
  },
  {
    id: 5,
    slug: "history-of-linen-in-indian-textiles",
    title: "The Rich History of Linen in Indian Textiles",
    excerpt: "Journey through time to understand how linen became an integral part of Indian textile heritage.",
    content: "Full article content here...",
    author: "Dr. Sunita Iyer",
    date: "2023-12-28",
    category: "History",
    image: "/images/bridal-saree.jpg",
    featured: false
  },
  {
    id: 6,
    slug: "choosing-perfect-linen-saree",
    title: "How to Choose the Perfect Linen Saree for Your Body Type",
    excerpt: "Expert advice on selecting linen sarees that flatter your figure and enhance your natural beauty.",
    content: "Full article content here...",
    author: "Ritu Malhotra",
    date: "2023-12-25",
    category: "Fashion",
    image: "/images/celebrity-look.jpg",
    featured: false
  }
]

const categories = ["All", "Fashion", "Craftsmanship", "Sustainability", "Care Tips", "History"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

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
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
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

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
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

        {/* Featured Posts */}
        {selectedCategory === "All" && searchQuery === "" && featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">Featured Articles</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-2xl">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-3">
                          {post.category}
                        </span>
                        <h3 className="font-serif text-xl lg:text-2xl font-medium text-white mb-2 group-hover:text-primary-foreground transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
            {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No articles found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === "All" && searchQuery === "" ? regularPosts : filteredPosts).map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-serif text-xl font-medium mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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