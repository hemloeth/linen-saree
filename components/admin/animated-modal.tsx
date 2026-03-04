"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedModalProps {
    isOpen: boolean
    onClose?: () => void
    children: ReactNode
    disableClose?: boolean
}

export function AnimatedModal({ isOpen, onClose, children, disableClose = false }: AnimatedModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => !disableClose && onClose?.()}
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
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
