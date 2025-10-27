"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  Title,
  SubTitle,
} from "chart.js"

// Register chart.js components once
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    SubTitle,
    Tooltip,
    Legend,
    Filler
  )

  // Set global defaults for better appearance
  ChartJS.defaults.font.family = "'Inter', 'system-ui', 'sans-serif'"
  ChartJS.defaults.color = "rgb(148, 163, 184)"
  ChartJS.defaults.borderColor = "rgba(148, 163, 184, 0.1)"
  ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(15, 23, 42, 0.95)"
  ChartJS.defaults.plugins.tooltip.padding = 12
  ChartJS.defaults.plugins.tooltip.cornerRadius = 8
  ChartJS.defaults.plugins.tooltip.titleColor = "rgb(248, 250, 252)"
  ChartJS.defaults.plugins.tooltip.bodyColor = "rgb(226, 232, 240)"
  ChartJS.defaults.plugins.tooltip.borderColor = "rgba(148, 163, 184, 0.2)"
  ChartJS.defaults.plugins.tooltip.borderWidth = 1
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (_error) {
  // ignore double registration in HMR/dev
}

export default ChartJS
