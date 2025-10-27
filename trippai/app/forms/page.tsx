"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoFields } from "@/components/forms/PersonalInfoFields"
import { AdditionalFields } from "@/components/forms/AdditionalFields"
import { SubmitButton } from "@/components/forms/SubmitButton"
import { useFormSubmission } from "@/hooks/use-form-submission"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
}

export default function FormsPage() {
  const { isSubmitting, formData, selectedDate, handleInputChange, handleSubmit, setSelectedDate } =
    useFormSubmission()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contact Form
          </h1>
          <p className="text-muted-foreground text-lg">
            Modern, dynamic form with seamless spacing
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PersonalInfoFields formData={formData} onInputChange={handleInputChange} />

                <AdditionalFields
                  formData={formData}
                  onInputChange={handleInputChange}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />

                <SubmitButton isSubmitting={isSubmitting} />
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
