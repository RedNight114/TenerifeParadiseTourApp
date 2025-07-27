"use client"

import { useAuthModals } from "@/hooks/use-auth-modals"
// LoginModal eliminado - no se usa
import { RegisterModal } from "./register-modal"

export function AuthModals() {
  const { isLoginOpen, isRegisterOpen, closeLogin, closeRegister } = useAuthModals()

  return (
    <>
      {/* LoginModal eliminado - no se usa */}
      <RegisterModal isOpen={isRegisterOpen} onClose={closeRegister} />
    </>
  )
}
