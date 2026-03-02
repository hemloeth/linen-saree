"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    color?: string
}

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
}

const strokeMap = {
    sm: 2.5,
    md: 2.5,
    lg: 3,
}

export function LoadingSpinner({ size = "sm", className, color }: LoadingSpinnerProps) {
    const dimension = size === "sm" ? 16 : size === "md" ? 20 : 24
    const strokeWidth = strokeMap[size]
    const radius = (dimension - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
        <motion.svg
            className={cn(sizeMap[size], className)}
            viewBox={`0 0 ${dimension} ${dimension}`}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {/* Background track */}
            <circle
                cx={dimension / 2}
                cy={dimension / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                opacity={0.2}
            />
            {/* Animated arc */}
            <motion.circle
                cx={dimension / 2}
                cy={dimension / 2}
                r={radius}
                fill="none"
                stroke={color || "currentColor"}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference * 0.75 }}
                animate={{
                    strokeDashoffset: [circumference * 0.75, circumference * 0.25, circumference * 0.75],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </motion.svg>
    )
}
