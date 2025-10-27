"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Globe, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface UserAddress {
  city: string
  country: string
}

interface UserCardProps {
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
  onViewProfile?: () => void
  onContact?: () => void
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const getStatusColor = (status: UserCardProps["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "inactive":
      return "bg-gray-500"
    case "pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusVariant = (status: UserCardProps["status"]) => {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "pending":
      return "outline"
    default:
      return "secondary"
  }
}

export function UserCard({
  name,
  email,
  phone,
  website,
  address,
  company,
  role,
  joinDate,
  status,
  avatar,
  onViewProfile,
  onContact,
}: UserCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-lg font-semibold text-primary-foreground shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {avatar}
              </motion.div>
              <div>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Badge variant={getStatusVariant(status)} className="text-xs">
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Mail className="h-4 w-4 text-primary" />
              {email}
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Phone className="h-4 w-4 text-primary" />
              {phone}
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MapPin className="h-4 w-4 text-primary" />
              {address.city}, {address.country}
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Globe className="h-4 w-4 text-primary" />
              {website}
            </motion.div>
          </div>

          <div className="border-t pt-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{company}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Joined {new Date(joinDate).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 transition-all hover:scale-105"
              onClick={onViewProfile}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 transition-all hover:scale-105"
              onClick={onContact}
            >
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
