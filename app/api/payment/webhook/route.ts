import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { 
  validateRedsysWebhook 
} from "@/lib/redsys-signature"
import { auditPaymentEvent } from "@/lib/audit-middleware"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Implementar la función localmente
function getPaymentStatusFromRedsysCode(responseCode: string): string {
  switch (responseCode) {
    case "0000":
    case "0900":
      return "preautorizado";
    case "101": case "102": case "104": case "116": case "118": case "129": case "180": case "184": case "190": case "191": case "202": case "912": case "9912": case "9064": case "9078": case "9093": case "9094": case "9104": case "9218": case "9253": case "9256": case "9257": case "9261": case "9913": case "9914": case "9915": case "9927": case "9928": case "9929": case "9997": case "9998": case "9999":
      return "rechazado";
    default:
      return "pendiente";
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const merchantParameters = formData.get("Ds_MerchantParameters") as string
    const signature = formData.get("Ds_Signature") as string
    const signatureVersion = formData.get("Ds_SignatureVersion") as string

    // Validar parámetros requeridos
    if (!merchantParameters || !signature) {
      console.error("❌ WEBHOOK - Parámetros faltantes")
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Obtener clave secreta de Redsys
    const secretKey = process.env.REDSYS_SECRET_KEY!
    if (!secretKey) {
      console.error("❌ WEBHOOK - Clave secreta no configurada")
      return NextResponse.json({ error: "Configuración de seguridad faltante" }, { status: 500 })
    }

    // Decodificar parámetros para obtener los datos del webhook
    const merchantParametersJson = Buffer.from(merchantParameters, 'base64').toString('utf8')
    const webhookData = JSON.parse(merchantParametersJson)
    
    console.log('✅ WEBHOOK - Datos recibidos:', {
      orderNumber: webhookData.DS_ORDER,
      responseCode: webhookData.DS_RESPONSE,
      authCode: webhookData.DS_AUTHORISATIONCODE,
      transactionType: webhookData.DS_TRANSACTIONTYPE,
      amount: webhookData.DS_AMOUNT
    })

    // Extraer reservationId del orderNumber (formato: timestamp + últimos 4 chars del reservationId)
    const orderNumber = webhookData.DS_ORDER
    if (!orderNumber) {
      console.error('❌ WEBHOOK - No se encontró número de pedido')
      return NextResponse.json({ error: "Número de pedido faltante" }, { status: 400 })
    }

    // Validar webhook usando la nueva función oficial de Redsys
    // IMPORTANTE: Los parámetros del webhook usan DS_ORDER, no DS_MERCHANT_ORDER
    const isValid = validateRedsysWebhook(
      merchantParameters,
      signature,
      secretKey
    )

    if (!isValid) {
      console.error("❌ WEBHOOK - Firma inválida para orderNumber:", orderNumber)
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 })
    }

    console.log('✅ WEBHOOK - Firma validada correctamente para orderNumber:', orderNumber)

    // Buscar la reserva por el payment_id (que debería ser el orderNumber)
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("id, user_id, total_price, payment_status, status")
      .eq("payment_id", orderNumber)
      .single()

    if (reservationError || !reservation) {
      console.error('❌ WEBHOOK - Reserva no encontrada para orderNumber:', orderNumber)
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const reservationId = reservation.id

    // Determinar estado del pago usando la función utilitaria actualizada
    const paymentStatus = getPaymentStatusFromRedsysCode(webhookData.DS_RESPONSE)

    console.log(`✅ WEBHOOK - Procesando notificación para reserva ${reservationId}, código: ${webhookData.DS_RESPONSE}, estado: ${paymentStatus}`)

    // Obtener información del usuario para auditoría
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", reservation.user_id)
      .single()

    const userEmail = userError ? 'unknown' : userProfile?.email || 'unknown'

    // Determinar el estado final basado en el código de respuesta
    let finalReservationStatus = reservation.status
    let finalPaymentStatus = paymentStatus

    // Actualizar estados según el código de respuesta
    if (webhookData.DS_RESPONSE === "0000") {
      // Preautorización exitosa
      finalReservationStatus = "preautorizado"
      finalPaymentStatus = "preautorizado"
    } else if (webhookData.DS_RESPONSE === "0900") {
      // Confirmación exitosa
      finalReservationStatus = "confirmado"
      finalPaymentStatus = "pagado"
    } else if (paymentStatus === "rechazado") {
      // Pago rechazado
      finalPaymentStatus = "rechazado"
    }

    // Actualizar la reserva en la base de datos
    const { data, error } = await supabase
      .from("reservations")
      .update({
        status: finalReservationStatus,
        payment_status: finalPaymentStatus,
        payment_auth_code: webhookData.DS_AUTHORISATIONCODE,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId)
      .select()

    if (error) {
      console.error("❌ WEBHOOK - Error actualizando reserva:", error)
      return NextResponse.json({ error: "Error actualizando reserva" }, { status: 500 })
    }

    console.log(`✅ WEBHOOK - Notificación procesada exitosamente para reserva ${reservationId}`)

    return NextResponse.json({ 
      success: true, 
      message: "Notificación procesada correctamente",
      reservationId,
      paymentStatus: finalPaymentStatus,
      reservationStatus: finalReservationStatus
    })

  } catch (error) {
    console.error("❌ WEBHOOK - Error procesando notificación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
