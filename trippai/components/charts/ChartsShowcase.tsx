"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChartHeader } from "./ChartHeader"
import { ChartGrid } from "./ChartGrid"
import { ChartActions } from "./ChartActions"
import { useChartData } from "@/hooks/use-chart-data"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

export default function ChartsShowcase() {
  const { lineData, barData, pieData, bubbleData, handleRefresh } = useChartData()

  return (
    <motion.div
      className="container mx-auto space-y-8 px-4 py-8 sm:pt-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ChartHeader onRefresh={handleRefresh} />
      <ChartGrid lineData={lineData} barData={barData} pieData={pieData} bubbleData={bubbleData} />
      <ChartActions onRandomize={handleRefresh} />
    </motion.div>
  )
}
