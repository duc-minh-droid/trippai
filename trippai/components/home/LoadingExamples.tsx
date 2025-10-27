"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoadingExamples() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">
            Loading Animation Types
          </h2>
          <p className="text-muted-foreground">
            We use specific loading animations for different contexts
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base">Page Loading (3 Dots)</CardTitle>
              <CardDescription>Full page overlay - used when loading entire pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="h-3 w-3 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Use: <code className="bg-muted px-1 rounded">PageLoading</code>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base">Section Loading (Spinner)</CardTitle>
              <CardDescription>For loading specific sections within a page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use: <code className="bg-muted px-1 rounded">SectionLoading</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
