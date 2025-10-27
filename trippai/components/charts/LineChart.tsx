"use client"

import React from "react"
import { Line } from "react-chartjs-2"
import { ChartEvent, ActiveElement, ChartOptions, ChartData } from "chart.js"
import { TooltipContext, AnimationContext } from "@/lib/chart-types"
import "./registry"

interface LineChartProps {
  data: ChartData<"line">
  options?: ChartOptions<"line">
  className?: string
}

export default function LineChart({ data, options = {}, className = "" }: LineChartProps) {
  const defaultOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeInOutQuart" as const,
      delay: (context: AnimationContext) => {
        let delay = 0
        if (context.type === "data" && context.mode === "default") {
          delay = context.dataIndex * 80 + context.datasetIndex * 200
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
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
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
          label: function (context: TooltipContext<"line">) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y)
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
            return typeof value === "number" ? `$${value}` : value
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        borderCapStyle: "round" as const,
        tension: 0.4,
      },
      point: {
        radius: 0,
        hoverRadius: 7,
        hoverBorderWidth: 3,
        hoverBackgroundColor: "#ffffff",
        hitRadius: 30,
      },
    },
    onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
      const canvas = event.native?.target as HTMLElement | undefined
      if (canvas) {
        canvas.style.cursor = activeElements.length > 0 ? "pointer" : "default"
      }
    },
  }

  const mergedOptions: ChartOptions<"line"> = {
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
      <Line data={data} options={mergedOptions} />
    </div>
  )
}
