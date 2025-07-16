"use client"

import { useAuthModals } from "@/hooks/use-auth-modals"
import { LoginModal } from "./login-modal"
import { RegisterModal } from "./register-modal"

export function AuthModals() {
  const { isLoginOpen, isRegisterOpen, closeLogin, closeRegister } = useAuthModals()

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeRegister} />
    </>
  )
}
