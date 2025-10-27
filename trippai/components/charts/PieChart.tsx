"use client"

import React from "react"
import { Pie } from "react-chartjs-2"
import { ChartEvent, ActiveElement, ChartOptions, ChartData, Chart } from "chart.js"
import { TooltipContext } from "@/lib/chart-types"
import "./registry"

interface PieChartProps {
  data: ChartData<"pie">
  options?: ChartOptions<"pie">
  className?: string
}

export default function PieChart({ data, options = {}, className = "" }: PieChartProps) {
  const defaultOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            weight: 500,
          },
          generateLabels: (chart: Chart) => {
            const chartData = chart.data
            if (chartData.labels && chartData.labels.length && chartData.datasets.length) {
              const dataset = chartData.datasets[0]
              const dataValues = dataset.data as number[]
              const total = dataValues.reduce((sum: number, val: number) => sum + val, 0)

              return (chartData.labels as string[]).map((label: string, i: number) => {
                const value = dataValues[i]
                const percentage = ((value / total) * 100).toFixed(1)
                const backgroundColor = Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: backgroundColor as string,
                  strokeStyle: backgroundColor as string,
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          },
        },
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
          label: function (context: TooltipContext<"pie">) {
            const label = context.label || ""
            const value = context.parsed
            const dataValues = context.dataset.data as number[]
            const total = dataValues.reduce((sum: number, val: number) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverBorderWidth: 4,
        hoverBorderColor: "#ffffff",
        hoverOffset: 12,
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
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Pie data={data} options={mergedOptions} />
    </div>
  )
}
