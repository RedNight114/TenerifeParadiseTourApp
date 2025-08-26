"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseResizeObserverReturn {
  width: number
  height: number
  ref: React.RefObject<Element>
}

export function useResizeObserver(): UseResizeObserverReturn {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const ref = useRef<Element>(null)

  const updateDimensions = useCallback((entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      setDimensions({ width, height })
    }
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(element)

    return () => observer.disconnect()
  }, [updateDimensions])

  return {
    width: dimensions.width,
    height: dimensions.height,
    ref
  }
}

// Hook especializado para contenedores con dimensiones específicas
export function useContainerDimensions<T extends Element = Element>(
  options: {
    defaultWidth?: number
    defaultHeight?: number
    debounceMs?: number
  } = {}
): UseResizeObserverReturn & { ref: React.RefObject<T> } {
  const { defaultWidth = 0, defaultHeight = 0, debounceMs = 100 } = options
  const [dimensions, setDimensions] = useState({ 
    width: defaultWidth, 
    height: defaultHeight 
  })
  const ref = useRef<T>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const updateDimensions = useCallback((entries: ResizeObserverEntry[]) => {
    // Debouncing para evitar actualizaciones excesivas
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    }, debounceMs)
  }, [debounceMs])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [updateDimensions])

  return {
    width: dimensions.width,
    height: dimensions.height,
    ref
  }
}

// Hook para detectar cambios de orientación
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// Hook para detectar breakpoints responsivos
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}
