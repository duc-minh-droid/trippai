"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface DesktopNavProps {
  navItems: NavItem[]
  pathname: string
}

export function DesktopNav({ navItems, pathname }: DesktopNavProps) {
  const router = useRouter()

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onMouseEnter={() => router?.prefetch?.(item.href)}
            onFocus={() => router?.prefetch?.(item.href)}
            onClick={(e) => {
              e.preventDefault()
              router.push(item.href)
            }}
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className="relative h-9 transition-all duration-200 hover:scale-105"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-md bg-secondary"
                  layoutId="navbar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
