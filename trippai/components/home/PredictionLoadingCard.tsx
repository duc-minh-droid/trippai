"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Loader2, Map, Cloud, DollarSign, Users } from "lucide-react"

export function PredictionLoadingCard() {
  return (
    <Card className="w-[420px] max-w-[calc(100vw-2rem)] p-4 shadow-2xl bg-background/80 backdrop-blur-xl border border-border/50">
      <div className="space-y-3">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-6 w-40 bg-muted rounded-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-3 w-48 bg-muted rounded-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
          </div>
        </div>

        {/* Score skeleton */}
        <motion.div
          className="relative p-4 rounded-lg bg-muted/50 border border-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Analyzing travel data...
          </p>
        </motion.div>

        {/* Metrics grid skeleton */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: DollarSign, label: "Price" },
            { icon: Cloud, label: "Weather" },
            { icon: Users, label: "Crowds" },
            { icon: Map, label: "Scores" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="p-3 rounded-lg bg-muted/30 border border-muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.3, 0.6, 0.3], y: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <item.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </motion.div>
          ))}
        </div>

        {/* AI explanation skeleton */}
        <motion.div
          className="p-3 rounded-lg bg-muted/30 border border-muted space-y-1.5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        >
          <div className="h-2 w-full bg-muted rounded" />
          <div className="h-2 w-5/6 bg-muted rounded" />
          <div className="h-2 w-4/6 bg-muted rounded" />
        </motion.div>
      </div>
    </Card>
  )
}
