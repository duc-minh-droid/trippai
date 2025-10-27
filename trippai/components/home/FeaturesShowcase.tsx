"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, MapPin, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function FeaturesShowcase() {
  const features = [
    {
      title: "Multi-City Planning",
      description: "Plan complex trips across multiple destinations with AI-powered route optimization",
      icon: MapPin,
      href: "/multi-city",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      badge: "New",
    },
    {
      title: "Real-Time Pricing",
      description: "Get live hotel and flight prices from Booking.com API for accurate budgeting",
      icon: DollarSign,
      href: "/",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      badge: "Live Data",
    },
    {
      title: "Smart Predictions",
      description: "AI-driven forecasts for weather, crowds, and optimal travel times",
      icon: TrendingUp,
      href: "/",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      badge: "AI Powered",
    },
  ]

  return (
    <div className="mb-8 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Powerful Features</h2>
        </div>
        <p className="text-muted-foreground">
          Everything you need to plan the perfect trip
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={feature.href}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-sm text-primary group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
