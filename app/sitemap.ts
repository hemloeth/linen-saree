import { MetadataRoute } from 'next'
import { fetchProductsFromDB, categories } from '@/lib/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://linensaree.com'
  
  // 1. Static Routes
  const staticRoutes = [
    '',
    '/collections',
    '/about',
    '/contact',
    '/track-order',
    '/cart',
    '/wishlist',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Collection Routes
  const collectionRoutes = [
    ...categories.map(c => c.slug),
    'new-arrivals',
    'sale',
    'festive'
  ].map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 3. Product Routes
  const products = await fetchProductsFromDB()
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...collectionRoutes, ...productRoutes]
}
