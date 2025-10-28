"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import "@theme-toggles/react/css/Expand.css"
import { Expand } from "@theme-toggles/react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isToggled, setIsToggled] = React.useState(false)

  React.useEffect(() => {
    setIsToggled(theme === "dark")
  }, [theme])

  return (
    <div className="flex items-center justify-center h-9 w-9">
      {/* @ts-expect-error - @theme-toggles/react has incomplete type definitions */}
      <Expand
        duration={750}
        toggled={isToggled}
        toggle={() => setTheme(theme === "light" ? "dark" : "light")}
        className="theme-toggle"
      />
    </div>
  )
}
