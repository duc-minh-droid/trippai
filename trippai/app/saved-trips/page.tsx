"use client"

import { SavedTripsList } from "@/components/home/SavedTripsList"
import { motion } from "framer-motion"

export default function SavedTripsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SavedTripsList />
        </motion.div>
      </div>
    </div>
  )
}

