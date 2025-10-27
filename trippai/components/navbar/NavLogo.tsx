"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Code2 } from "lucide-react"

interface NavLogoProps {
  showText?: boolean
}

export function NavLogo({ showText = true }: NavLogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Code2 className="h-4 w-4 text-primary-foreground" />
      </motion.div>
      {showText && <span className="font-bold">UI Components</span>}
    </Link>
  )
}
