"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

interface MultiCityLoadingProps {
  stage?: "optimizing" | "fetching" | "analyzing"
}

export function MultiCityLoading({ stage = "optimizing" }: MultiCityLoadingProps) {
  const messages = {
    optimizing: {
      title: "Optimizing Your Route",
      subtitle: "Finding the best order to visit your destinations",
    },
    fetching: {
      title: "Fetching Real-Time Prices",
      subtitle: "Getting live hotel and flight data",
    },
    analyzing: {
      title: "Analyzing Travel Conditions",
      subtitle: "Forecasting weather, crowds, and optimal dates",
    },
  }

  const currentMessage = messages[stage]

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated Icon */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <Sparkles className="w-16 h-16 text-primary relative z-10" />
        </motion.div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold"
          >
            {currentMessage.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            {currentMessage.subtitle}
          </motion.p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

interface PriceLoadingSkeletonProps {
  count?: number
}

export function PriceLoadingSkeleton({ count = 3 }: PriceLoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-lg border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
