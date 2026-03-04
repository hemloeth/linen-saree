"use client"

import { useState, useMemo } from "react"
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
import { MoreHorizontal, Search, AlertTriangle, Trash2, X, CheckSquare, Square, ListChecks } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/context/product-context"

interface Toast {
  id: number
  message: string
  count?: number
}

let toastId = 0

export default function AdminProductsPage() {
  const { products, deleteProduct, deleteMultipleProducts } = useProduct()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const filteredProducts = useMemo(
    () => products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  )

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p._id))

  const getStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock"
    if (stock <= 5) return "Low Stock"
    return "In Stock"
  }

  const showToast = (message: string, count?: number) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, count }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Single delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    const deletedName = deleteTarget.name
    setIsDeleting(true)

    try {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      showToast(`"${deletedName}" has been deleted successfully`)
    } catch {
      // error handled in context
    } finally {
      setIsDeleting(false)
    }
  }

  // Multi-select helpers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredProducts.map(p => p._id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsBulkDeleting(true)

    try {
      const ids = Array.from(selectedIds)
      const deletedCount = await deleteMultipleProducts(ids)
      setShowBulkDeleteModal(false)
      showToast(`${deletedCount} product(s) deleted successfully`, deletedCount)
      exitSelectionMode()
    } catch {
      // error handled in context
    } finally {
      setIsBulkDeleting(false)
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
                  Product{(toast.count ?? 1) > 1 ? "s" : ""} Deleted
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {toast.message}
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

        {/* Select Multiple / Done toggle button */}
        <AnimatePresence mode="wait">
          {selectionMode ? (
            <motion.div
              key="done-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="outline"
                onClick={exitSelectionMode}
                className="gap-2 border-primary text-primary hover:bg-primary/5"
              >
                <X className="h-4 w-4" />
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="start-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="outline"
                onClick={() => setSelectionMode(true)}
                className="gap-2"
              >
                <ListChecks className="h-4 w-4" />
                Select Multiple
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instruction banner in selection mode */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ListChecks className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Selection mode active
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the checkboxes to select products you want to delete. Selected products will be highlighted.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {allFilteredSelected ? (
                  <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7 gap-1.5">
                    Deselect All
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7 gap-1.5">
                    Select All
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Empty header for checkbox column — no header checkbox */}
              {selectionMode && (
                <TableHead className="w-12" />
              )}
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
              const isSelected = selectedIds.has(product._id)
              return (
                <TableRow
                  key={product._id}
                  className={`transition-colors duration-150 ${isSelected ? "bg-primary/5 hover:bg-primary/10" : ""}`}
                >
                  {/* Checkbox cell — only on data rows */}
                  <AnimatePresence>
                    {selectionMode && (
                      <TableCell className="w-12 p-0">
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 48, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center"
                        >
                          <button
                            onClick={() => toggleSelect(product._id)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            aria-label={`Select ${product.name}`}
                          >
                            {isSelected ? (
                              <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <CheckSquare className="w-5 h-5 text-primary" />
                              </motion.div>
                            ) : (
                              <Square className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </button>
                        </motion.div>
                      </TableCell>
                    )}
                  </AnimatePresence>
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

      {/* Floating Action Bar — always visible in selection mode */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-background border border-border shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <motion.div
                  key={selectedIds.size}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center ${selectedIds.size > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {selectedIds.size}
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {selectedIds.size === 1 ? "product selected" : "products selected"}
                </span>
              </div>

              <div className="w-px h-6 bg-border" />

              <Button
                variant="outline"
                size="sm"
                onClick={exitSelectionMode}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteModal(true)}
                disabled={selectedIds.size === 0}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
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
                  <h3 className="text-lg font-semibold mb-1.5">Delete {selectedIds.size} Product{selectedIds.size > 1 ? "s" : ""}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Are you sure you want to delete <strong className="text-foreground">{selectedIds.size} product{selectedIds.size > 1 ? "s" : ""}</strong>?
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
                    onClick={() => setShowBulkDeleteModal(false)}
                    disabled={isBulkDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 h-10 rounded-xl relative overflow-hidden"
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                  >
                    <AnimatePresence mode="wait">
                      {isBulkDeleting ? (
                        <motion.span
                          key="bulk-deleting"
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
                          key="bulk-idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          Delete {selectedIds.size}
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
