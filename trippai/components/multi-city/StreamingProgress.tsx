"use client"

import { motion } from "framer-motion"
import { Loader2, MapPin, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StreamingProgressProps {
  status: string
  progress: number
  currentCity?: string
}

export function StreamingProgress({ status, progress, currentCity }: StreamingProgressProps) {
  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 via-background to-background">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{status}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Animated Icon */}
        <div className="flex items-center justify-center py-4">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
        </div>

        {/* Current City */}
        {currentCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-muted-foreground"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm capitalize">{currentCity}</span>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="space-y-2 pt-2">
          <ProgressStep
            label="Initialize Planning"
            completed={progress > 10}
            active={progress >= 0 && progress <= 10}
          />
          <ProgressStep
            label="Optimize Route"
            completed={progress > 20}
            active={progress > 10 && progress <= 20}
          />
          <ProgressStep
            label="Find Optimal Dates"
            completed={progress > 30}
            active={progress > 20 && progress <= 30}
          />
          <ProgressStep
            label="Analyze Cities"
            completed={progress > 85}
            active={progress > 30 && progress <= 85}
          />
          <ProgressStep
            label="Calculate Costs"
            completed={progress > 90}
            active={progress > 85 && progress <= 90}
          />
          <ProgressStep
            label="Finalize Itinerary"
            completed={progress >= 100}
            active={progress > 90 && progress < 100}
          />
        </div>
      </div>
    </Card>
  )
}

interface ProgressStepProps {
  label: string
  completed: boolean
  active: boolean
}

function ProgressStep({ label, completed, active }: ProgressStepProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
          completed
            ? "bg-primary border-primary"
            : active
            ? "border-primary"
            : "border-muted"
        }`}
      >
        {completed && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      <span
        className={`text-sm ${
          completed || active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  )
}
