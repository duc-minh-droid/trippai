import { useState, useMemo } from "react"
import {
  generateLineData,
  generateBarData,
  generatePieData,
  generateBubbleData,
} from "@/lib/chart-utils"

export function useChartData() {
  const [refreshKey, setRefreshKey] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lineData = useMemo(() => generateLineData(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const barData = useMemo(() => generateBarData(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pieData = useMemo(() => generatePieData(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bubbleData = useMemo(() => generateBubbleData(), [refreshKey])

  const handleRefresh = () => setRefreshKey((k) => k + 1)

  return {
    lineData,
    barData,
    pieData,
    bubbleData,
    handleRefresh,
  }
}
