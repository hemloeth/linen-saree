"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"

export interface ToastItem {
    id: number
    title: string
    message: string
}

interface AdminToastProps {
    toasts: ToastItem[]
    onDismiss: (id: number) => void
}

export function AdminToast({ toasts, onDismiss }: AdminToastProps) {
    return (
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
                            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                        >
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {toast.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                        >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
