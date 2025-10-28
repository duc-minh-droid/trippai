"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Code2 } from "lucide-react"
import * as React from "react"
import { useTheme } from "next-themes"
import { Expand } from "@theme-toggles/react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface MobileSidebarProps {
  navItems: NavItem[]
  pathname: string
  onClose: () => void
}

export function MobileSidebar({ navItems, pathname, onClose }: MobileSidebarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        exit={{ x: "-100%" }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 32,
          mass: 0.8,
        }}
        id="mobile-sidebar"
        className="fixed left-0 top-0 z-50 h-full w-[78vw] max-w-[320px] shadow-2xl md:hidden rounded-r-3xl border-r border-border/50"
        style={{
          background: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-start gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <div className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                UI Components
              </div>
              <div className="text-xs text-muted-foreground">v1.0.0</div>
            </div>
          </div>
        </div>

        <nav className="flex flex-col space-y-2 px-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 22 }}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => router?.prefetch?.(item.href)}
                  onFocus={() => router?.prefetch?.(item.href)}
                  onClick={(e) => {
                    e.preventDefault()
                    onClose()
                    router.push(item.href)
                  }}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none overflow-hidden ${isActive ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-secondary/10 text-foreground/80 hover:text-foreground"}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                  />
                  <span className="text-sm font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto h-2 w-2 rounded-full bg-primary"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="absolute left-4 right-4 bottom-6">
          <div className="rounded-xl bg-secondary/20 border border-border/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium">Theme</span>
                  <p className="text-xs text-muted-foreground">Toggle appearance</p>
                </div>
              </div>

              <div>
                {/* @ts-expect-error - @theme-toggles/react has incomplete type definitions */}
                {React.createElement(Expand, {
                  duration: 750,
                  toggled: theme === "dark",
                  toggle: () => setTheme(theme === "light" ? "dark" : "light"),
                  className: "theme-toggle",
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
