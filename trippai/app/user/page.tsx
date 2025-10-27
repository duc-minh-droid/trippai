"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User } from "lucide-react"

import { UserCard } from "@/components/ui/user-card"

interface UserAddress {
  city: string
  country: string
}

interface UserType {
  id: number
  name: string
  email: string
  phone: string
  website: string
  address: UserAddress
  company: string
  role: string
  joinDate: string
  status: "active" | "inactive" | "pending"
  avatar: string
}

const mockUsers: UserType[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    phone: "+1 (555) 123-4567",
    website: "sarahjohnson.dev",
    address: { city: "San Francisco", country: "USA" },
    company: "Tech Corp",
    role: "Senior Designer",
    joinDate: "2023-01-15",
    status: "active",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Alex Chen",
    email: "alex.chen@startup.io",
    phone: "+1 (555) 987-6543",
    website: "alexchen.com",
    address: { city: "Toronto", country: "Canada" },
    company: "StartupIO",
    role: "Full Stack Developer",
    joinDate: "2023-03-22",
    status: "active",
    avatar: "AC",
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    email: "maria.r@design.co",
    phone: "+1 (555) 456-7890",
    website: "mariarodriguez.design",
    address: { city: "Mexico City", country: "Mexico" },
    company: "Design Co",
    role: "Product Manager",
    joinDate: "2022-11-08",
    status: "pending",
    avatar: "MR",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "j.wilson@enterprise.com",
    phone: "+1 (555) 321-0987",
    website: "jameswilson.pro",
    address: { city: "London", country: "UK" },
    company: "Enterprise Ltd",
    role: "Team Lead",
    joinDate: "2021-09-12",
    status: "inactive",
    avatar: "JW",
  },
  {
    id: 5,
    name: "Lisa Kim",
    email: "lisa.kim@agency.net",
    phone: "+1 (555) 654-3210",
    website: "lisakim.agency",
    address: { city: "Seoul", country: "South Korea" },
    company: "Creative Agency",
    role: "Creative Director",
    joinDate: "2023-06-03",
    status: "active",
    avatar: "LK",
  },
  {
    id: 6,
    name: "David Thompson",
    email: "d.thompson@freelance.dev",
    phone: "+1 (555) 789-0123",
    website: "davidthompson.dev",
    address: { city: "Sydney", country: "Australia" },
    company: "Freelance",
    role: "Software Engineer",
    joinDate: "2023-08-17",
    status: "active",
    avatar: "DT",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
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

export default function UserPage() {
  const [user] = useState<UserType | null>(mockUsers[0])

  // No artificial loading delay - instant page loads for better UX

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-medium">User not found</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <User className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h1
            className="mb-4 text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user.name}
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {user.role} • {user.company}
          </motion.p>
        </motion.div>

        <UserCard
          {...user}
          onViewProfile={() => alert("View profile clicked")}
          onContact={() => alert("Contact clicked")}
        />
      </motion.div>
    </div>
  )
}
