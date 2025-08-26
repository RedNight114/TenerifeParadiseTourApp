"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface StatusItem {
  label: string
  value: number
  color: string
  bgColor: string
}

interface StatusCardProps {
  title: string
  items: StatusItem[]
  icon?: LucideIcon
  iconColor?: string
  bgGradient?: string
  badge?: string
}

export function StatusCard({ 
  title, 
  items, 
  icon: Icon,
  iconColor = "text-gray-600",
  bgGradient = "bg-gradient-to-br from-gray-50 to-gray-100/50",
  badge 
}: StatusCardProps) {
  return (
    <Card className={bgGradient}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: item.bgColor,
                  color: item.color
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 