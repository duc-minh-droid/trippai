"use client"

import { motion, useDragControls, useMotionValue, animate as motionAnimate } from "framer-motion"
import { Menu } from "lucide-react"

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragElastic={0.12}
      dragConstraints={{ left: -18, right: 18, top: -10, bottom: 10 }}
      style={{ x, y }}
      onDragEnd={() => {
        motionAnimate(x, 0, { type: "spring", stiffness: 360, damping: 28 })
        motionAnimate(y, 0, { type: "spring", stiffness: 360, damping: 28 })
      }}
      initial={{ opacity: 0, scale: 0.8, y: -6 }}
      animate={{ opacity: 1, scale: [1.12, 0.96, 1.03, 1], y: 0 }}
      exit={{ opacity: 0, scale: 0.86 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-6 left-4 z-50 touch-none"
    >
      <motion.button
        onClick={onClick}
        aria-label="Open menu"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl hover:shadow-3xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>
    </motion.div>
  )
}
