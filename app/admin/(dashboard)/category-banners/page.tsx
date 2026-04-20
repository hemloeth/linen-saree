"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Layout, Image as ImageIcon } from "lucide-react"
import { categories } from "@/lib/products"
import { apiGet, API_BASE_URL } from "@/lib/api"

// Add special collections to the list
const allCollections = [
    ...categories,
    { name: "New Arrivals", slug: "new-arrivals" },
    { name: "Sale Collection", slug: "sale" },
    { name: "Festive Collection", slug: "festive" }
];

export default function CategoryBannersPage() {
    const router = useRouter()
    const [banners, setBanners] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await apiGet('/api/category-banner/all')
                if (response.success) {
                    setBanners(response.data)
                }
            } catch (error) {
                console.error("Error fetching category banners:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBanners()
    }, [])

    const getBannerForSlug = (slug: string) => {
        return banners.find(b => b.slug === slug)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Category Banners</h2>
                    <p className="text-muted-foreground">Manage top-level hero sections for all your collections.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Collection Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allCollections.map((collection) => {
                            const banner = getBannerForSlug(collection.slug)
                            return (
                                <TableRow key={collection.slug}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                                {banner?.image ? (
                                                    <img 
                                                        src={banner.image.startsWith('http') ? banner.image : `${API_BASE_URL}${banner.image}`} 
                                                        alt={collection.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            {collection.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{collection.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant={banner ? "default" : "outline"} className={banner ? "bg-green-500 hover:bg-green-600" : ""}>
                                            {banner ? "Custom Banner" : "Default imagery"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {banner ? new Date(banner.updatedAt).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => router.push(`/admin/category-banners/edit/${collection.slug}`)}
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                            Edit Banner
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
