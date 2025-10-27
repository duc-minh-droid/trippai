"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="mx-auto max-w-md p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Search className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <motion.h1
              className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.h1>
            <h2 className="mt-2 text-2xl font-semibold">Page Not Found</h2>
          </motion.div>

          <motion.p variants={itemVariants} className="mb-8 text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="group w-full sm:w-auto">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Go Home
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" asChild className="group w-full sm:w-auto">
                <Link href="javascript:history.back()">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Go Back
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/user"
                className="font-medium text-primary underline-offset-4 hover:underline transition-all"
              >
                View user page
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
