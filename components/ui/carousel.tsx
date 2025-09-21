"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}
type CarouselOptions = {}
type CarouselPlugin = any

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  children: React.ReactNode
  className?: string
}

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement>
  current: number
  count: number
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      setApi,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const carouselRef = React.useRef<HTMLDivElement>(null)
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useImperativeHandle(ref, () => carouselRef.current!)

    React.useEffect(() => {
      if (!carouselRef.current) return

      const slides = carouselRef.current.querySelectorAll('[data-carousel-item]')
      setCount(slides.length)
    }, [])

    const scrollPrev = React.useCallback(() => {
      if (!carouselRef.current) return
      setCurrent((prev) => (prev === 0 ? count - 1 : prev - 1))
    }, [count])

    const scrollNext = React.useCallback(() => {
      if (!carouselRef.current) return
      setCurrent((prev) => (prev === count - 1 ? 0 : prev + 1))
    }, [count])

    const scrollTo = React.useCallback((index: number) => {
      if (!carouselRef.current) return
      setCurrent(index)
    }, [])

    React.useEffect(() => {
      if (!carouselRef.current) return

      const slides = carouselRef.current.querySelectorAll('[data-carousel-item]')
      slides.forEach((slide, index) => {
        if (index === current) {
          slide.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      })
    }, [current])

    React.useEffect(() => {
      if (!setApi) return

      setApi({
        scrollPrev,
        scrollNext,
        scrollTo,
      })
    }, [setApi, scrollPrev, scrollNext, scrollTo])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          current,
          count,
          scrollPrev,
          scrollNext,
          scrollTo,
        }}
      >
        <div
          ref={carouselRef}
          className={cn(
            "relative overflow-hidden",
            orientation === "vertical" ? "flex-col" : "flex-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex",
      className
    )}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-carousel-item
    className={cn(
      "min-w-0 shrink-0 grow-0 basis-full",
      className
    )}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        "left-4 top-1/2 -translate-y-1/2",
        className
      )}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        "right-4 top-1/2 -translate-y-1/2",
        className
      )}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}