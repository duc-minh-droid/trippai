"use client"

import { Building, Calendar, MessageSquare } from "lucide-react"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FormData, departments } from "@/lib/form-utils"

interface AdditionalFieldsProps {
  formData: FormData
  onInputChange: (field: keyof FormData, value: string) => void
  selectedDate: Date | null
  onDateChange: (date: Date | null) => void
}

export function AdditionalFields({
  formData,
  onInputChange,
  selectedDate,
  onDateChange,
}: AdditionalFieldsProps) {
  return (
    <>
      {/* Department Select */}
      <FormField label="Department" icon={Building} htmlFor="department">
        <Select
          value={formData.department}
          onValueChange={(value: string) => onInputChange("department", value)}
        >
          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-xl border-2 border-border/50 shadow-2xl">
            {departments.map((dept) => (
              <SelectItem
                key={dept.value}
                value={dept.value}
                className="cursor-pointer hover:bg-primary/10 transition-colors duration-150"
              >
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Date Picker */}
      <FormField label="Select Date" icon={Calendar} htmlFor="date">
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 dark:bg-background dark:border-input dark:text-foreground"
          calendarClassName="dark:bg-popover dark:border-border dark:text-foreground"
          wrapperClassName="w-full"
        />
      </FormField>

      {/* Message */}
      <FormField label="Message" icon={MessageSquare} htmlFor="message">
        <Textarea
          id="message"
          placeholder="Tell us more about your inquiry..."
          value={formData.message}
          onChange={(e) => onInputChange("message", e.target.value)}
          required
          rows={5}
          className="resize-none transition-all duration-200 focus:scale-[1.01]"
        />
      </FormField>
    </>
  )
}
