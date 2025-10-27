"use client"

import { motion } from "framer-motion"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmitButtonProps {
  isSubmitting: boolean
}

export function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="pt-2"
    >
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:scale-105"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Submit Form
          </>
        )}
      </Button>
    </motion.div>
  )
}
