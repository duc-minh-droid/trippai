"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function ExpandThemeToggle({ localTargetId }: { localTargetId?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const handleToggle = () => {
    // If a local target id is provided, toggle the 'dark' class on that element only
    if (localTargetId) {
      const el = document.getElementById(localTargetId)
      if (el) {
        el.classList.toggle("dark")
        // keep global theme in sync after toggling local state
        setTheme(el.classList.contains("dark") ? "dark" : "light")
        return
      }
    }

    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={handleToggle}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-background/70 border border-border/20 shadow hover:shadow-md focus:outline-none overflow-hidden"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  )
}
