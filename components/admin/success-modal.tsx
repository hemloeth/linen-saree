"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AnimatedModal } from "@/components/admin/animated-modal"

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    productName: string
    title?: string
    description?: string
}

export function SuccessModal({ isOpen, onClose, productName, title, description }: SuccessModalProps) {
    const router = useRouter()

    return (
        <AnimatedModal isOpen={isOpen} onClose={onClose}>
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
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-green-500" />
                    </div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut",
                        }}
                        className="absolute inset-0 rounded-full border-2 border-green-500/30"
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
                <h3 className="text-lg font-semibold mb-1.5">{title || "Product Added!"}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">&ldquo;{productName}&rdquo;</strong> {description || "has been successfully added to your catalog."}
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
                    onClick={onClose}
                >
                    Add Another
                </Button>
                <Button
                    className="flex-1 h-10 rounded-xl"
                    onClick={() => {
                        onClose()
                        router.push("/admin/products")
                    }}
                >
                    View Products
                </Button>
            </motion.div>
        </AnimatedModal>
    )
}
