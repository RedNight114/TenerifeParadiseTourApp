"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CookieBanner } from "@/components/cookie-banner"
import { Settings } from "lucide-react"

export function CookieSettingsButton() {
  const [showBanner, setShowBanner] = useState(false)

  const openCookieSettings = () => {
    setShowBanner(true)
  }

  const closeCookieSettings = () => {
    setShowBanner(false)
  }

  return (
    <>
      <Button
        onClick={openCookieSettings}
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-[#F4C762] transition-colors duration-200 text-sm"
      >
        <Settings className="h-4 w-4 mr-1" />
        Configuración de Cookies
      </Button>
      
      {showBanner && (
        <CookieBanner />
      )}
    </>
  )
} 