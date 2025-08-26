import { NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-optimized"
import { withAuthorization } from "@/lib/authorization"

// GET - Obtener estadísticas de auditoría
export const GET = withAuthorization({ requiredRole: "admin" })(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d, 1y
    const groupBy = searchParams.get("groupBy") || "action" // action, severity, user_id
// Calcular fecha de inicio basada en el período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    const supabaseClient = getSupabaseClient()
    const client = await supabaseClient.getClient()
    if (!client) {
      return NextResponse.json(
        { error: "Error de conexión con la base de datos" },
        { status: 500 }
      )
    }

    // Obtener logs del período
    const { data: logs, error } = await client
      .from("audit_logs")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      )
    }

    // Procesar estadísticas
    const stats = {
      total: logs?.length || 0,
      byAction: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      timeline: [] as Array<{ date: string; count: number }>,
    }

    // Agrupar por acción
    logs?.forEach((log: any) => {
      const action = String(log.action || 'unknown')
      const severity = String(log.severity || 'info')
      const userId = log.user_id ? String(log.user_id) : null
      
      stats.byAction[action] = (stats.byAction[action] || 0) + 1
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1
      if (userId) {
        stats.byUser[userId] = (stats.byUser[userId] || 0) + 1
      }
    })

    // Crear timeline por día
    const timelineMap = new Map<string, number>()
    logs?.forEach((log: any) => {
      const date = new Date(String(log.created_at || new Date())).toISOString().split("T")[0]
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1)
    })

    stats.timeline = Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Obtener información adicional de usuarios si se agrupa por usuario
    const userDetails: Record<string, any> = {}
    if (groupBy === "user_id" && Object.keys(stats.byUser).length > 0) {
      const { data: userData } = await client
        .from("profiles")
        .select("id, full_name, email")
        .in("id", Object.keys(stats.byUser))

      userData?.forEach((user: any) => {
        userDetails[String(user.id)] = {
          full_name: user.full_name,
          email: user.email,
        }
      })
    }

    // Obtener acciones más comunes
    const topActions = Object.entries(stats.byAction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }))

    // Obtener usuarios más activos
    const topUsers = Object.entries(stats.byUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({
        user_id: userId,
        count,
        user_info: userDetails[userId] || null,
      }))
return NextResponse.json({
      period,
      groupBy,
      stats: {
        total: stats.total,
        byAction: stats.byAction,
        bySeverity: stats.bySeverity,
        byUser: stats.byUser,
        timeline: stats.timeline,
        topActions,
        topUsers,
      },
    })
  } catch (error) {
return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, hours_back = 24, days = 30 } = body

    const supabaseClient = getSupabaseClient()
    const client = await supabaseClient.getClient()
    if (!client) {
      return NextResponse.json(
        { error: "Error de conexión con la base de datos" },
        { status: 500 }
      )
    }

    switch (action) {
      case 'detect_suspicious':
        // Detectar actividades sospechosas
        const startDate = new Date()
        startDate.setHours(startDate.getHours() - hours_back)

        const { data: recentLogs, error } = await client
          .from('audit_logs')
          .select('*')
          .gte('created_at', startDate.toISOString())

        if (error) {
          return NextResponse.json({ error: "Error detectando actividades sospechosas" }, { status: 500 })
        }

        // Calcular actividad sospechosa
        const suspiciousActivity = {
          failed_logins: recentLogs?.filter(log => 
            log.action === 'login' && log.level === 'error'
          ).length || 0,
          multiple_failed_logins: null as any,
          critical_errors: recentLogs?.filter(log => 
            log.level === 'error' && log.category === 'system'
          ).length || 0,
          unauthorized_access_attempts: recentLogs?.filter(log => 
            log.action === 'access_denied' || log.action === 'unauthorized'
          ).length || 0,
          payment_failures: recentLogs?.filter(log => 
            log.action === 'payment' && log.level === 'error'
          ).length || 0
        }

        // Detectar múltiples intentos fallidos
        const failedLoginsByUser: Record<string, number> = {}
        recentLogs?.forEach((log: any) => {
          if (log.action === 'login' && log.level === 'error' && log.user_id) {
            failedLoginsByUser[String(log.user_id)] = (failedLoginsByUser[String(log.user_id)] || 0) + 1
          }
        })

        const usersWithMultipleFailures = Object.entries(failedLoginsByUser)
          .filter(([_, count]) => count > 3)
          .map(([user_id, count]) => ({ user_id, count }))

        if (usersWithMultipleFailures.length > 0) {
          suspiciousActivity.multiple_failed_logins = usersWithMultipleFailures
        }

        return NextResponse.json({
          success: true,
          suspicious_activity: suspiciousActivity
        })

      case 'generate_report':
        // Generar reporte completo
        const reportStartDate = new Date()
        reportStartDate.setDate(reportStartDate.getDate() - days)

        const { data: reportLogs, error: reportError } = await client
          .from('audit_logs')
          .select('*')
          .gte('created_at', reportStartDate.toISOString())

        if (reportError) {
          return NextResponse.json({ error: "Error generando reporte" }, { status: 500 })
        }

        // Calcular estadísticas del reporte
        const reportStats = {
          total: reportLogs?.length || 0,
          by_category: {} as Record<string, number>,
          by_level: {} as Record<string, number>,
          by_success: {} as Record<string, number>
        }

        reportLogs?.forEach((log: any) => {
          const category = String(log.category || 'unknown')
          const level = String(log.level || 'info')
          const success = level === 'error' ? 'failed' : 'success'
          
          reportStats.by_category[category] = (reportStats.by_category[category] || 0) + 1
          reportStats.by_level[level] = (reportStats.by_level[level] || 0) + 1
          reportStats.by_success[success] = (reportStats.by_success[success] || 0) + 1
        })

        return NextResponse.json({
          success: true,
          report: {
            period: `${days} días`,
            summary: {
              total_logs: reportStats.total,
              success_rate: reportStats.total > 0 ? (reportStats.by_success.success / reportStats.total * 100).toFixed(2) : 0,
              error_rate: reportStats.total > 0 ? (reportStats.by_success.failed / reportStats.total * 100).toFixed(2) : 0
            },
            by_category: reportStats.by_category,
            by_level: reportStats.by_level,
            generated_at: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

  } catch (error) {
return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 
