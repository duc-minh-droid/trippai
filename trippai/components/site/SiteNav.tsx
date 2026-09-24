"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Plan" },
  { href: "/multi-city", label: "Multi-city" },
  { href: "/saved-trips", label: "Saved" },
]

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <motion.span whileHover={{ rotate: -12 }} className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-rose-400 shadow-[0_6px_20px_-6px_rgba(251,146,60,0.8)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1a1203]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M3 17c4-1 7-4 9-9" />
          <path d="M12 8l4-4 1.5 4.5L22 10l-4 4" />
          <circle cx="4" cy="17" r="1.6" fill="currentColor" />
        </svg>
      </motion.span>
      <span className="font-display text-xl tracking-tight text-white">
        Tripp<span className="text-amber-300">AI</span>
      </span>
    </Link>
  )
}

export function SiteNav() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24))

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "border-b border-white/[0.06] bg-[#070a17]/75 backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur">
          {LINKS.map((l) => {
            const on = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className={cn("relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm", on ? "text-[#1a1203]" : "text-slate-300 hover:text-white")}>
                {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-amber-300" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{l.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
