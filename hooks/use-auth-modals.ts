"use client"

import { create } from "zustand"

interface AuthModalsState {
  isLoginOpen: boolean
  isRegisterOpen: boolean
  openLogin: () => void
  closeLogin: () => void
  openRegister: () => void
  closeRegister: () => void
  switchToRegister: () => void
  switchToLogin: () => void
}

export const useAuthModals = create<AuthModalsState>((set) => ({
  isLoginOpen: false,
  isRegisterOpen: false,

  openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
  closeLogin: () => set({ isLoginOpen: false }),

  openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false }),
  closeRegister: () => set({ isRegisterOpen: false }),

  switchToRegister: () => set({ isLoginOpen: false, isRegisterOpen: true }),
  switchToLogin: () => set({ isRegisterOpen: false, isLoginOpen: true }),
}))
