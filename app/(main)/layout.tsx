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

  return (
    <div className="min-h-screen flex flex-col">
      {!isBookingPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 