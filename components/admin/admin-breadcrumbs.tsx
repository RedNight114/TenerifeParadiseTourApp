"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminBreadcrumbsProps {
  className?: string
  customItems?: Array<{
    label: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
  }>
}

export function AdminBreadcrumbs({ className, customItems }: AdminBreadcrumbsProps) {
  const pathname = usePathname()
  
  // Usar customItems si se proporcionan, sino usar pathname
  const breadcrumbItems = customItems || (() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    
    return [
      {
        label: 'Admin',
        href: '/admin',
        icon: Home
      },
      ...pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/')
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)
        
        return {
          label,
          href,
          isLast: index === pathSegments.length - 1
        }
      })
    ]
  })()

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={`${item.href || item.label}-${index}`}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          )}
          {!item.href || index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {index === 0 && 'icon' in item && item.icon ? (
                <item.icon className="w-4 h-4" />
              ) : (
                item.label
              )}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}