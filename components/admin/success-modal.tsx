"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    productName: string
}

export function SuccessModal({ isOpen, onClose, productName }: SuccessModalProps) {
    const router = useRouter()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center justify-center pt-6">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-serif text-center">Product Added!</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        <span className="font-semibold text-primary">{productName}</span> has been successfully added to your catalog.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        className="w-full sm:flex-1"
                        onClick={() => {
                            onClose()
                        }}
                    >
                        Add Another
                    </Button>
                    <Button
                        className="w-full sm:flex-1"
                        onClick={() => {
                            onClose()
                            router.push("/admin/products")
                        }}
                    >
                        View Products
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
