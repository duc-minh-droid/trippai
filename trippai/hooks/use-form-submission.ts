import { useState } from "react"
import { toast } from "sonner"
import { FormData, initialFormData } from "@/lib/form-utils"

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast.success("Form submitted successfully!", {
      description: "We'll get back to you soon.",
    })

    setIsSubmitting(false)
    setFormData(initialFormData)
    setSelectedDate(null)
  }

  return {
    isSubmitting,
    formData,
    selectedDate,
    handleInputChange,
    handleSubmit,
    setSelectedDate,
  }
}
