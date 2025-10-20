"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isBookingPage = pathname?.startsWith('/booking')
  const isReservationsPage = pathname === '/reservations'
  const isMapPage = pathname === '/map-external'

  return (
    <div className="min-h-screen flex flex-col">
      {!isBookingPage && !isReservationsPage && !isMapPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isMapPage && <Footer />}
    </div>
  )
} 