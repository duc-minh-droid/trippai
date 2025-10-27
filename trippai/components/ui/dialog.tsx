"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  children: React.ReactNode
}) {
  if (!open) return null

  return <Portal onClose={() => onOpenChange(false)}>{children}</Portal>
}

function Portal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [mounted, setMounted] = React.useState(false)
  const mountRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    if (!mountRef.current) {
      mountRef.current = document.createElement("div")
      mountRef.current.className =
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    }

    const node = mountRef.current
    document.body.appendChild(node)
    setMounted(true)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)

    return () => {
      document.removeEventListener("keydown", onKey)
      if (node && document.body.contains(node)) {
        document.body.removeChild(node)
      }
    }
  }, [onClose])

  if (typeof window === "undefined" || !mounted || !mountRef.current) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-50 mx-auto w-full sm:max-w-lg p-4")}>{children}</div>
    </div>,
    mountRef.current
  )
}

function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-block">
      {children}
    </button>
  )
}

function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="rounded-t-lg bg-popover p-6 shadow-lg sm:rounded-lg">{children}</div>
}

export { Dialog, DialogTrigger, DialogContent }
