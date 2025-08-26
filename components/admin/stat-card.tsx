"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  badge?: string
  icon?: LucideIcon
  iconColor?: string
  bgGradient?: string
  badgeColor?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  progress?: {
    value: number
    max: number
    label: string
  }
}

export function StatCard({ 
  title, 
  value, 
  description, 
  badge,
  icon: Icon,
  iconColor = "text-gray-600",
  bgGradient = "bg-gradient-to-br from-gray-50 to-gray-100/50",
  badgeColor = "bg-gray-100 text-gray-700 border-gray-200",
  trend,
  progress 
}: StatCardProps) {
  return (
    <Card className={bgGradient}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {badge && (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} mt-2`}>
            {badge}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-2">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
        {progress && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.label}</span>
              <span>{progress.value}/{progress.max}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((progress.value / progress.max) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 