"use client"

import React, { useState, useEffect } from 'react'

interface ClientOnlyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
