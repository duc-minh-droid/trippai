"use client"

import { User, Mail, Phone, Globe, Building, Briefcase } from "lucide-react"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { FormData } from "@/lib/form-utils"

interface PersonalInfoFieldsProps {
  formData: FormData
  onInputChange: (field: keyof FormData, value: string) => void
}

export function PersonalInfoFields({ formData, onInputChange }: PersonalInfoFieldsProps) {
  return (
    <>
      {/* Personal Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Full Name" icon={User} htmlFor="name">
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            required
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>

        <FormField label="Email Address" icon={Mail} htmlFor="email">
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            required
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>
      </div>

      {/* Contact Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Phone Number" icon={Phone} htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>

        <FormField label="Website" icon={Globe} htmlFor="website">
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => onInputChange("website", e.target.value)}
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>
      </div>

      {/* Company Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Company" icon={Building} htmlFor="company">
          <Input
            id="company"
            placeholder="Tech Corp"
            value={formData.company}
            onChange={(e) => onInputChange("company", e.target.value)}
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>

        <FormField label="Role" icon={Briefcase} htmlFor="role">
          <Input
            id="role"
            placeholder="Senior Developer"
            value={formData.role}
            onChange={(e) => onInputChange("role", e.target.value)}
            className="transition-all duration-200 focus:scale-[1.02] hover:scale-[1.01]"
          />
        </FormField>
      </div>
    </>
  )
}
