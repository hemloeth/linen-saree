"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MoreHorizontal, Search, AlertTriangle, Check, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/context/product-context"

interface Toast {
  id: number
  name: string
}

let toastId = 0

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProduct()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock"
    if (stock <= 5) return "Low Stock"
    return "In Stock"
  }

  const showToast = (name: string) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, name }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const deletedName = deleteTarget.name
    setIsDeleting(true)

    try {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      showToast(deletedName)
    } catch {
      // error handled in context
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Animated Toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className="bg-background border border-border shadow-2xl rounded-xl px-5 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw] sm:min-w-[340px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Product Deleted
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  &ldquo;{toast.name}&rdquo; has been deleted successfully
                </p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Regular Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStatus(product.stock)
              return (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-muted-foreground line-through">₹{product.regularPrice?.toLocaleString() || "—"}</TableCell>
                  <TableCell className="font-semibold">₹{product.price?.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={status === "Out of Stock" ? "destructive" : status === "Low Stock" ? "secondary" : "outline"}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/edit-product/${product._id}`)}>Edit details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget({ id: product._id, name: product.name })}>
                          Delete product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteTarget(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
              }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-background rounded-2xl border shadow-2xl p-6 mx-4">
                {/* Animated icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="relative"
                  >
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-7 w-7 text-destructive" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full border-2 border-destructive/30"
                    />
                  </motion.div>
                </div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-lg font-semibold mb-1.5">Delete Product</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Are you sure you want to delete <strong className="text-foreground">&ldquo;{deleteTarget.name}&rdquo;</strong>?
                    <br />
                    <span className="text-xs">This action cannot be undone.</span>
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex gap-3"
                >
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-xl"
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 h-10 rounded-xl relative overflow-hidden"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <AnimatePresence mode="wait">
                      {isDeleting ? (
                        <motion.span
                          key="deleting"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <LoadingSpinner size="sm" />
                          Deleting...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          Delete
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

