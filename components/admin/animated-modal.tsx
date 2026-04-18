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

                    {/* Modal Wrapper for Centering */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        {/* Modal container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                type: "spring",
                                stiffness: 450,
                                damping: 30,
                            }}
                            className="w-full max-w-sm pointer-events-auto"
                        >
                            <div className="bg-background rounded-2xl border shadow-2xl p-6 drop-shadow-xl">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
