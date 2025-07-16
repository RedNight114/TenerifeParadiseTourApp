import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0061A8] to-[#F4C762]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg font-medium">Cargando...</p>
      </div>
    </div>
  )
}
