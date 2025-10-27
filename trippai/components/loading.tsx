"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageLoadingProps {
  className?: string
}

export function PageLoading({ className }: PageLoadingProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-3 w-3 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}

interface SectionLoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function SectionLoading({ className, size = "md" }: SectionLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <motion.div
        className={cn(
          "rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

interface DotsLoadingProps {
  className?: string
}

export function DotsLoading({ className }: DotsLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  )
}

interface PulseLoadingProps {
  className?: string
}

export function PulseLoading({ className }: PulseLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="h-6 w-6 rounded-full bg-primary"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.3, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
