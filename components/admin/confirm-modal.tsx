"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AnimatedModal } from "@/components/admin/animated-modal"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
    icon: ReactNode
    iconBg?: string
    ringColor?: string
    title: string
    description: ReactNode
    cancelLabel?: string
    confirmLabel?: string
    confirmVariant?: "default" | "destructive"
    loadingLabel?: string
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    icon,
    iconBg = "bg-destructive/10",
    ringColor = "border-destructive/30",
    title,
    description,
    cancelLabel = "Cancel",
    confirmLabel = "Confirm",
    confirmVariant = "destructive",
    loadingLabel = "Processing...",
}: ConfirmModalProps) {
    return (
        <AnimatedModal isOpen={isOpen} onClose={onClose} disableClose={isLoading}>
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
                    <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}>
                        {icon}
                    </div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut",
                        }}
                        className={`absolute inset-0 rounded-full border-2 ${ringColor}`}
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
                <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                </div>
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
                    disabled={isLoading}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant={confirmVariant}
                    className="flex-1 h-10 rounded-xl relative overflow-hidden"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.span
                                key="loading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <LoadingSpinner size="sm" />
                                {loadingLabel}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {confirmLabel}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </AnimatedModal>
    )
}
