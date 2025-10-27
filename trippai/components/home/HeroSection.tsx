"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export function HeroSection() {
  return (
    <section className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div variants={itemVariants} className="mb-6">
          <Badge className="mb-4" variant="secondary">
            ✨ UI Components Documentation
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Modern{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              UI Components
            </span>
            <br />
            Made Simple
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Learn how to use our minimal, modern UI components. Built with Next.js, shadcn/ui, and
            Tailwind CSS for seamless integration.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
          <Button size="lg" asChild className="group">
            <Link href="/user">
              View Example
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            <Code2 className="mr-2 h-4 w-4" />
            View Code
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
