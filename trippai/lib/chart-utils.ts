// Helper function to generate random numbers
export const random = (min = 10, max = 100): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

// Chart.js gradient context type
interface GradientContext {
  chart: {
    ctx: CanvasRenderingContext2D
  }
}

// Generate line chart data
export const generateLineData = () => {
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: Array.from({ length: 7 }, () => random(40, 120)),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: (ctx: GradientContext) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250)
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)")
          gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.15)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0)")
          return gradient
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
      {
        label: "Expenses",
        data: Array.from({ length: 7 }, () => random(20, 90)),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: (ctx: GradientContext) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250)
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)")
          gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.15)")
          gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
          return gradient
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
    ],
  }
}

// Generate bar chart data
export const generateBarData = () => {
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Users",
        data: Array.from({ length: 7 }, () => random(50, 220)),
        backgroundColor: [
          "rgba(249, 115, 22, 0.85)",
          "rgba(251, 113, 133, 0.85)",
          "rgba(96, 165, 250, 0.85)",
          "rgba(52, 211, 153, 0.85)",
          "rgba(167, 139, 250, 0.85)",
          "rgba(244, 114, 182, 0.85)",
          "rgba(245, 158, 11, 0.85)",
        ],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  }
}

// Generate pie chart data
export const generatePieData = () => {
  return {
    labels: ["Chrome", "Safari", "Firefox", "Edge", "Other"],
    datasets: [
      {
        label: "Browser Share",
        data: [random(35, 50), random(20, 30), random(10, 18), random(8, 15), random(5, 10)],
        backgroundColor: [
          "rgba(99, 102, 241, 0.9)",
          "rgba(6, 182, 212, 0.9)",
          "rgba(249, 115, 22, 0.9)",
          "rgba(239, 68, 68, 0.9)",
          "rgba(148, 163, 184, 0.9)",
        ],
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverOffset: 15,
      },
    ],
  }
}

// Generate bubble chart data
export const generateBubbleData = () => {
  const colors = [
    "rgba(99, 102, 241, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(34, 197, 94, 0.7)",
    "rgba(251, 146, 60, 0.7)",
    "rgba(168, 85, 247, 0.7)",
    "rgba(236, 72, 153, 0.7)",
    "rgba(14, 165, 233, 0.7)",
    "rgba(234, 179, 8, 0.7)",
  ]

  return {
    datasets: colors.map((color, index) => ({
      label: `Dataset ${index + 1}`,
      data: Array.from({ length: random(4, 8) }).map(() => ({
        x: random(10, 90),
        y: random(10, 90),
        r: random(8, 25),
      })),
      backgroundColor: color,
      borderColor: color.replace("0.7", "1"),
      borderWidth: 2,
    })),
  }
}
