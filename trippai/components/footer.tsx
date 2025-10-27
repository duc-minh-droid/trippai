"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">UI Components</h3>
            <p className="text-sm text-muted-foreground">
              Modern, reusable components built with Next.js, shadcn/ui, and Tailwind CSS.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Pages</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/charts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Charts
                </Link>
              </li>
              <li>
                <Link
                  href="/forms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forms
                </Link>
              </li>
              <li>
                <Link
                  href="/user"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Dark Mode Support</li>
              <li className="text-muted-foreground">Responsive Design</li>
              <li className="text-muted-foreground">Framer Motion</li>
              <li className="text-muted-foreground">shadcn/ui Components</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} UI Components. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, shadcn/ui & Framer Motion
          </p>
        </div>
      </div>
    </footer>
  )
}
