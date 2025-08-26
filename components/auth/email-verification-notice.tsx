"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle } from "lucide-react"

interface EmailVerificationNoticeProps {
  email?: string
  onResendVerification?: () => void
  isResending?: boolean
}

export function EmailVerificationNotice({ 
  email, 
  onResendVerification, 
  isResending = false 
}: EmailVerificationNoticeProps) {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="space-y-2">
          <p>
            Por favor, verifica tu dirección de email{" "}
            {email && <span className="font-medium">{email}</span>} para continuar.
          </p>
          <p className="text-sm">
            Revisa tu bandeja de entrada y la carpeta de spam.
          </p>
          {onResendVerification && (
            <button
              onClick={onResendVerification}
              disabled={isResending}
              className="text-sm text-yellow-700 underline hover:text-yellow-800 disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar email de verificación"}
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
} 