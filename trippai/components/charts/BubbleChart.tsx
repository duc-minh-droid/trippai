"use client"

import React from "react"
import { Bubble } from "react-chartjs-2"
import { ChartEvent, ActiveElement, ChartOptions, ChartData } from "chart.js"
import { TooltipContext, AnimationContext } from "@/lib/chart-types"
import "./registry"

interface BubbleChartProps {
  data: ChartData<"bubble">
  options?: ChartOptions<"bubble">
  className?: string
}

interface BubbleDataPoint {
  x: number
  y: number
  r: number
}

export default function BubbleChart({ data, options = {}, className = "" }: BubbleChartProps) {
  const defaultOptions: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeInOutQuart" as const,
      delay: (context: AnimationContext) => {
        let delay = 0
        if (context.type === "data" && context.mode === "default") {
          delay = context.dataIndex * 120 + context.datasetIndex * 300
        }
        return delay
      },
    },
    interaction: {
      mode: "point" as const,
      intersect: true,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleFont: {
          size: 13,
          weight: 600,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: TooltipContext<"bubble">) {
            const rawData = context.raw as BubbleDataPoint | undefined
            const x = rawData?.x ?? context.parsed.x ?? 0
            const y = rawData?.y ?? context.parsed.y ?? 0
            const r = rawData?.r ?? (context.parsed._custom as number | undefined) ?? 0

            return [`X: ${x.toFixed(1)}`, `Y: ${y.toFixed(1)}`, `Size: ${(r * 2).toFixed(1)}`]
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
      const canvas = event.native?.target as HTMLElement | undefined
      if (canvas) {
        canvas.style.cursor = activeElements.length > 0 ? "pointer" : "default"
      }
    },
  }

  const mergedOptions: ChartOptions<"bubble"> = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
    scales: {
      ...defaultOptions.scales,
      ...(options.scales || {}),
    },
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Bubble data={data} options={mergedOptions} />
    </div>
  )
}
