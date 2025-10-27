"use client"

import { motion } from "framer-motion"
import { ChartData } from "chart.js"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import LineChart from "./LineChart"
import BarChart from "./BarChart"
import PieChart from "./PieChart"
import BubbleChart from "./BubbleChart"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

interface ChartGridProps {
  lineData: ChartData<"line">
  barData: ChartData<"bar">
  pieData: ChartData<"pie">
  bubbleData: ChartData<"bubble">
}

export function ChartGrid({ lineData, barData, pieData, bubbleData }: ChartGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-muted/40 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
          <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial performance comparison</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-80">
            <LineChart data={lineData} className="h-full" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-muted/40 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
          <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Weekly user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-80">
            <BarChart data={barData} className="h-full" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-muted/40 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
          <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardTitle>Browser Market Share</CardTitle>
            <CardDescription>Distribution of browser usage</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-80 flex items-center justify-center">
            <PieChart data={pieData} className="h-full w-full" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-muted/40 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
          <CardHeader className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
            <CardTitle>Multi-dimensional Data</CardTitle>
            <CardDescription>Interactive bubble scatter plot</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-80">
            <BubbleChart data={bubbleData} className="h-full" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
