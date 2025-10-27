"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, GripVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { cities } from "@/lib/cities"

export interface CityStopData {
  id: string
  city: string
  min_days: number
  max_days: number
  preferred_days: number
}

interface CityStopInputProps {
  cityStop: CityStopData
  index: number
  onUpdate: (id: string, data: Partial<CityStopData>) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export function CityStopInput({
  cityStop,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: CityStopInputProps) {
  const cityOptions: ComboboxOption[] = cities.map((city) => ({
    value: city.name.toLowerCase(),
    label: `${city.name}, ${city.country}`,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 relative group hover:shadow-md transition-shadow">
        {/* Drag handle */}
        <div className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="pl-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                {index + 1}
              </div>
              <h3 className="font-medium">City Stop {index + 1}</h3>
            </div>
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(cityStop.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <Combobox
                options={cityOptions}
                value={cityStop.city}
                onChange={(value) => onUpdate(cityStop.id, { city: value })}
                placeholder="Select a city..."
                searchPlaceholder="Search cities..."
                emptyText="No city found."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Min Days</label>
                <Input
                  type="number"
                  min={1}
                  value={cityStop.min_days}
                  onChange={(e) =>
                    onUpdate(cityStop.id, { min_days: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max Days</label>
                <Input
                  type="number"
                  min={cityStop.min_days}
                  value={cityStop.max_days}
                  onChange={(e) =>
                    onUpdate(cityStop.id, { max_days: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Preferred</label>
                <Input
                  type="number"
                  min={cityStop.min_days}
                  max={cityStop.max_days}
                  value={cityStop.preferred_days}
                  onChange={(e) =>
                    onUpdate(cityStop.id, { preferred_days: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
