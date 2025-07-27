import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login | Tenerife Paradise Tours",
  description: "Acceso al panel de administración de Tenerife Paradise Tours",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-login-layout">
      {children}
    </div>
  )
} 