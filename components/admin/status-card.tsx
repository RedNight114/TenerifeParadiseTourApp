"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, X, AlertCircle } from "lucide-react"

interface StatusCardProps {
  status: 'success' | 'warning' | 'error' | 'pending'
  title: string
  description: string
  count?: number
}

export function StatusCard({ status, title, description, count }: StatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const
        }
      case 'warning':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const
        }
      case 'error':
        return {
          icon: X,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const
        }
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'outline' as const
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{count || 0}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {count !== undefined && (
            <Badge variant={config.badgeVariant}>
              {status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}