import { ChartData, ChartOptions, TooltipItem } from "chart.js"

// Chart component props
export interface ChartComponentProps {
  data: ChartData
  options?: ChartOptions
  className?: string
}

// Animation context for Chart.js
export interface AnimationContext {
  type: string
  mode: string
  dataIndex: number
  datasetIndex: number
}

// Tooltip context for callbacks - use generic TooltipItem
export type TooltipContext<T extends "bar" | "line" | "pie" | "bubble"> = TooltipItem<T>

// Hover element context
export interface HoverContext {
  datasetIndex: number
  index: number
}

// Scale callback context
export interface ScaleCallbackContext {
  tick: {
    value: number
  }
}
