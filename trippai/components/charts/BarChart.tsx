"use client"

import React from "react"
import { Bar } from "react-chartjs-2"
import { ChartEvent, ActiveElement, ChartOptions, ChartData } from "chart.js"
import { TooltipContext, AnimationContext } from "@/lib/chart-types"
import "./registry"

interface BarChartProps {
  data: ChartData<"bar">
  options?: ChartOptions<"bar">
  className?: string
}

export default function BarChart({ data, options = {}, className = "" }: BarChartProps) {
  const defaultOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
      delay: (context: AnimationContext) => {
        let delay = 0
        if (context.type === "data" && context.mode === "default") {
          delay = context.dataIndex * 100
        }
        return delay
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
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
          label: function (context: TooltipContext<"bar">) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US").format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 500,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value: string | number) {
            return typeof value === "number" ? value.toLocaleString() : value
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

  const mergedOptions = {
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
      <Bar data={data} options={mergedOptions} />
    </div>
  )
}
