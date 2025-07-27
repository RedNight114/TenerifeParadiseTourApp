import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./admin-layout.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Admin Dashboard | Tenerife Paradise Tours",
  description: "Panel de administración para Tenerife Paradise Tours",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`admin-layout ${inter.variable}`}>
      {children}
      <Toaster />
    </div>
  )
}
