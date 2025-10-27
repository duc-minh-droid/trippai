"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface FormFieldProps {
  label: string
  icon?: LucideIcon
  children: ReactNode
  htmlFor?: string
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
}

export function FormField({
  label,
  icon: Icon,
  children,
  htmlFor,
  className = "",
}: FormFieldProps) {
  return (
    <motion.div variants={itemVariants} className={`space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
      </label>
      {children}
    </motion.div>
  )
}
