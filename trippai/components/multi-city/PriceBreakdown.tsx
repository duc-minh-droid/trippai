"use client"

import { motion } from "framer-motion"
import { Plane, Hotel, DollarSign, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PriceBreakdownProps {
  hotelCost?: number
  flightCost?: number
  totalCost: number
  perPersonCost?: number
  dataSource?: string
  className?: string
}

export function PriceBreakdown({
  hotelCost,
  flightCost,
  totalCost,
  perPersonCost,
  dataSource = "synthetic",
  className = "",
}: PriceBreakdownProps) {
  const isRealData = dataSource === "real_api"

  const items = [
    {
      icon: Hotel,
      label: "Hotels",
      value: hotelCost,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Plane,
      label: "Flights",
      value: flightCost,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ]

  return (
    <div className={`p-3 rounded-lg bg-muted/30 border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <DollarSign className="w-3 h-3" />
          Price Breakdown
        </h3>
        <Badge variant={isRealData ? "default" : "secondary"} className="text-[10px] h-4">
          {isRealData ? "Real-Time" : "Est."}
        </Badge>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          item.value !== undefined && (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded ${item.bgColor}`}>
                  <item.icon className={`w-3 h-3 ${item.color}`} />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <motion.span
                key={item.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold"
              >
                ${item.value.toFixed(2)}
              </motion.span>
            </motion.div>
          )
        ))}

        <div className="border-t pt-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-green-50 dark:bg-green-950/20">
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-semibold">Total</span>
            </div>
            <motion.span
              key={totalCost}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-bold text-primary"
            >
              ${totalCost.toFixed(2)}
            </motion.span>
          </div>
          {perPersonCost && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] text-muted-foreground mt-1 text-right"
            >
              ${perPersonCost.toFixed(2)} per person
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
