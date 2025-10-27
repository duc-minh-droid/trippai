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
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Price Breakdown
        </h3>
        <Badge variant={isRealData ? "default" : "secondary"} className="text-xs">
          {isRealData ? "Real-Time Prices" : "Estimated"}
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          item.value !== undefined && (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <motion.span
                key={item.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-semibold"
              >
                ${item.value.toFixed(2)}
              </motion.span>
            </motion.div>
          )
        ))}

        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold">Total Cost</span>
            </div>
            <motion.span
              key={totalCost}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg font-bold text-primary"
            >
              ${totalCost.toFixed(2)}
            </motion.span>
          </div>
          {perPersonCost && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-muted-foreground mt-2 text-right"
            >
              ${perPersonCost.toFixed(2)} per person
            </motion.p>
          )}
        </div>
      </div>
    </Card>
  )
}
