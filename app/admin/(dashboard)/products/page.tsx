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
import { MoreHorizontal, Search, AlertTriangle, Trash2, X, CheckSquare, Square, ListChecks, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/context/product-context"
import { AdminToast, ToastItem } from "@/components/admin/admin-toast"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { QuickSaleModal } from "@/components/admin/quick-sale-modal"

let toastId = 0

export default function AdminProductsPage() {
  const { products, deleteProduct, deleteMultipleProducts, quickUpdateProduct } = useProducts()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updatingField, setUpdatingField] = useState<string | null>(null)
  const [activeSaleProduct, setActiveSaleProduct] = useState<any | null>(null)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'sale'>('all')

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const filteredProducts = useMemo(
    () => products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === 'all' || product.isOnSale
      return matchesSearch && matchesTab
    }),
    [products, searchTerm, activeTab]
  )

  const saleCount = useMemo(() => products.filter(p => p.isOnSale).length, [products])

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p._id))

  const getStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock"
    if (stock <= 5) return "Low Stock"
    return "In Stock"
  }

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, title, message, type }])
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
      showToast("Product Deleted", `"${deletedName}" has been deleted successfully`)
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
      showToast(
        `${deletedCount} Product${deletedCount > 1 ? "s" : ""} Deleted`,
        `${deletedCount} product(s) deleted successfully`
      )
      exitSelectionMode()
    } catch {
      // error handled in context
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleOpenSaleModal = (product: any) => {
    setActiveSaleProduct(product)
    setIsSaleModalOpen(true)
  }

  const handleToggleFestive = async (product: any) => {
    setUpdatingId(product._id)
    setUpdatingField('isFestive')
    try {
      const nextIsFestive = !product.isFestive
      await quickUpdateProduct(product._id, {
        isFestive: nextIsFestive,
        productCollection: nextIsFestive ? "festive" : (product.productCollection === "festive" ? "" : (product.productCollection || ""))
      })
      showToast(
        nextIsFestive ? "Added to Festive" : "Removed from Festive",
        `"${product.name}" is ${nextIsFestive ? "now" : "no longer"} in the festive collection`
      )
    } catch (err: any) {
      showToast(
        "Update Failed",
        err.message || "Not authorized to modify products",
        "error"
      )
    } finally {
      setUpdatingId(null)
      setUpdatingField(null)
    }
  }

  const handleToggleCelebrity = async (product: any) => {
    setUpdatingId(product._id)
    setUpdatingField('celebrity')
    try {
      const isCurrentlyStar = product.productCollection === "celebrity"
      const nextCollection = isCurrentlyStar ? "" : "celebrity"
      await quickUpdateProduct(product._id, {
        productCollection: nextCollection
      })
      showToast(
        !isCurrentlyStar ? "Added to Dress Like a Star" : "Removed from Celebrity Collection",
        `"${product.name}" is ${!isCurrentlyStar ? "now" : "no longer"} in the celebrity collection`
      )
    } catch (err: any) {
      showToast(
        "Update Failed",
        err.message || "Not authorized to modify products",
        "error"
      )
    } finally {
      setUpdatingId(null)
      setUpdatingField(null)
    }
  }

  return (
    <div className="space-y-3">
      <AdminToast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Header & Tab Switcher: compact single line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-primary">Products</h2>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            ({products.length} in catalog)
          </span>
        </div>

        {/* Compact Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg w-fit border border-primary/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-3 py-1.5 text-xs font-bold transition-all rounded-md flex items-center gap-1.5 ${
              activeTab === 'all' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All Products</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'all' ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground'
            }`}>
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`relative px-3 py-1.5 text-xs font-bold transition-all rounded-md flex items-center gap-1.5 ${
              activeTab === 'sale' ? 'bg-background text-orange-600 shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>On Sale</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'sale' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'bg-muted text-muted-foreground'
            }`}>
              {saleCount}
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Multiple Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs rounded-none"
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
              <TableHead>Promotion</TableHead>
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
                  <TableCell className="text-muted-foreground line-through">₹{product.regularPrice?.toLocaleString('en-IN') || "—"}</TableCell>
                  <TableCell className="font-semibold">₹{product.price?.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                        {/* SALE / BIG SALE */}
                        <span
                          role="button"
                          onClick={() => {
                            if (!(updatingId === product._id && updatingField === 'isOnSale')) {
                              handleOpenSaleModal(product);
                            }
                          }}
                          className={`group relative inline-flex items-center justify-center py-0.5 px-2 rounded-none text-[10px] font-bold cursor-pointer select-none transition-all duration-200 border whitespace-nowrap ${product.isOnSale || product.productCollection === "big-sale"
                            ? "bg-orange-500 border-orange-500 text-white shadow-xs hover:bg-orange-600"
                            : "bg-background border-dashed border-muted-foreground/30 text-muted-foreground hover:border-orange-500 hover:text-orange-500"
                            } ${updatingId === product._id && updatingField === 'isOnSale' ? "animate-pulse opacity-70 cursor-not-allowed" : ""}`}
                          title={product.isOnSale ? "Edit Sale Price / Stop Sale" : "Add to Big Sale"}
                        ><span className="translate-y-px">{product.isOnSale || product.productCollection === "big-sale" ? "✓ SALE" : "+ SALE"}</span></span>

                        {/* FESTIVE */}
                        <span
                          role="button"
                          onClick={() => {
                            if (!(updatingId === product._id && updatingField === 'isFestive')) {
                              handleToggleFestive(product);
                            }
                          }}
                          className={`group relative inline-flex items-center justify-center py-0.5 px-2 rounded-none text-[10px] font-bold cursor-pointer select-none transition-all duration-200 border whitespace-nowrap ${product.isFestive || product.productCollection === "festive"
                            ? "bg-purple-600 border-purple-600 text-white shadow-xs hover:bg-purple-700"
                            : "bg-background border-dashed border-muted-foreground/30 text-muted-foreground hover:border-purple-500 hover:text-purple-500"
                            } ${updatingId === product._id && updatingField === 'isFestive' ? "animate-pulse opacity-70 cursor-not-allowed" : ""}`}
                          title={product.isFestive ? "Remove from Festive" : "Add to Festive Collection"}
                        ><span className="translate-y-px">{product.isFestive || product.productCollection === "festive" ? "✓ FESTIVE" : "+ FESTIVE"}</span></span>

                        {/* CELEBRITY / DRESS LIKE A STAR */}
                        <span
                          role="button"
                          onClick={() => {
                            if (!(updatingId === product._id && updatingField === 'celebrity')) {
                              handleToggleCelebrity(product);
                            }
                          }}
                          className={`group relative inline-flex items-center justify-center py-0.5 px-2 rounded-none text-[10px] font-bold cursor-pointer select-none transition-all duration-200 border whitespace-nowrap ${product.productCollection === "celebrity"
                            ? "bg-amber-600 border-amber-600 text-white shadow-xs hover:bg-amber-700"
                            : "bg-background border-dashed border-muted-foreground/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500"
                            } ${updatingId === product._id && updatingField === 'celebrity' ? "animate-pulse opacity-70 cursor-not-allowed" : ""}`}
                          title={product.productCollection === "celebrity" ? "Remove from Celebrity Collection" : "Add to Dress Like a Star (Celebrity)"}
                        ><span className="translate-y-px">{product.productCollection === "celebrity" ? "✓ STAR" : "+ STAR"}</span></span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === "Out of Stock" ? "destructive" : status === "Low Stock" ? "secondary" : "outline"} className="whitespace-nowrap">
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
                        <DropdownMenuItem onClick={() => {
                          const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          window.location.href = `/product/${slug}`;
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
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
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
        title="Delete Product"
        description={
          <p>
            Are you sure you want to delete <strong className="text-foreground">&ldquo;{deleteTarget?.name}&rdquo;</strong>?
            <br />
            <span className="text-xs">This action cannot be undone.</span>
          </p>
        }
        confirmLabel="Delete"
        loadingLabel="Deleting..."
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
        icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
        title={`Delete ${selectedIds.size} Product${selectedIds.size > 1 ? "s" : ""}`}
        description={
          <p>
            Are you sure you want to delete <strong className="text-foreground">{selectedIds.size} product{selectedIds.size > 1 ? "s" : ""}</strong>?
            <br />
            <span className="text-xs">This action cannot be undone.</span>
          </p>
        }
        confirmLabel={`Delete ${selectedIds.size}`}
        loadingLabel="Deleting..."
      />
      {/* Quick Sale Modal */}
      <QuickSaleModal
        product={activeSaleProduct}
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={async (id, updates) => {
          try {
            await quickUpdateProduct(id, updates)
            showToast("Sale Updated", "Sale details saved successfully")
          } catch (err: any) {
            showToast(
              "Update Failed",
              err.message || "Not authorized to modify products",
              "error"
            )
            throw err
          }
        }}
      />
    </div>
  )
}
