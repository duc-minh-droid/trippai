export interface FormData {
  name: string
  email: string
  phone: string
  company: string
  role: string
  website: string
  department: string
  message: string
}

export const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  website: "",
  department: "",
  message: "",
}

export const departments = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "support", label: "Customer Support" },
  { value: "hr", label: "Human Resources" },
  { value: "other", label: "Other" },
]
