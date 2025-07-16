import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authorization"
import { getRateLimitStats, clearRateLimitCache } from "@/lib/rate-limiting"

// GET - Obtener estadísticas de rate limiting (solo admin)
export const GET = requireAdmin()(async (request: NextRequest, userData: any) => {
  try {
    const adminUserId = userData.user.id

    console.log("Obteniendo estadísticas de rate limiting:", {
      adminUserId
    })

    const stats = getRateLimitStats()

    console.log("Estadísticas de rate limiting obtenidas:", stats)

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
      adminUserId
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas de rate limiting:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
})

// POST - Limpiar cache de rate limiting (solo admin)
export const POST = requireAdmin()(async (request: NextRequest, userData: any) => {
  try {
    const adminUserId = userData.user.id

    console.log("Limpiando cache de rate limiting:", {
      adminUserId
    })

    clearRateLimitCache()

    console.log("Cache de rate limiting limpiado exitosamente")

    return NextResponse.json({
      message: "Cache de rate limiting limpiado exitosamente",
      timestamp: new Date().toISOString(),
      adminUserId
    })
  } catch (error) {
    console.error("Error limpiando cache de rate limiting:", error)
    return NextResponse.json({ error: "Error al limpiar cache" }, { status: 500 })
  }
}) 