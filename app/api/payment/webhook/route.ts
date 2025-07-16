import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { 
  validateRedsysWebhook, 
  getPaymentStatusFromRedsysCode,
  validateWebhookTimestamp 
} from "@/lib/webhook-validation"
import { auditPaymentEvent } from "@/lib/audit-middleware"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const merchantParameters = formData.get("Ds_MerchantParameters") as string
    const signature = formData.get("Ds_Signature") as string
    const signatureVersion = formData.get("Ds_SignatureVersion") as string

    // Validar parámetros requeridos
    if (!merchantParameters || !signature) {
      console.error("Webhook Redsys: Parámetros faltantes")
      
      // Registrar evento de auditoría para parámetros faltantes
      await auditPaymentEvent(
        'webhook_validation_failed',
        'unknown',
        'unknown',
        'unknown',
        0,
        false,
        request,
        { error: 'Parámetros faltantes', merchantParameters: !!merchantParameters, signature: !!signature },
        'Parámetros faltantes en webhook'
      )
      
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Obtener clave secreta de Redsys
    const secretKey = process.env.REDSYS_SECRET_KEY!
    if (!secretKey) {
      console.error("Webhook Redsys: Clave secreta no configurada")
      
      // Registrar evento de auditoría para configuración faltante
      await auditPaymentEvent(
        'webhook_config_error',
        'unknown',
        'unknown',
        'unknown',
        0,
        false,
        request,
        { error: 'Clave secreta no configurada' },
        'Configuración de seguridad faltante'
      )
      
      return NextResponse.json({ error: "Configuración de seguridad faltante" }, { status: 500 })
    }

    // Validar webhook usando la librería de validación
    const validation = validateRedsysWebhook(
      merchantParameters,
      signature,
      signatureVersion || "HMAC_SHA256_V1",
      secretKey
    )

    if (!validation.isValid) {
      console.error("Webhook Redsys: Validación fallida:", validation.error)
      
      // Registrar evento de auditoría para validación fallida
      await auditPaymentEvent(
        'webhook_validation_failed',
        'unknown',
        'unknown',
        'unknown',
        0,
        false,
        request,
        { error: validation.error, validation_details: validation },
        validation.error || 'Validación de webhook fallida'
      )
      
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const webhookData = validation.data!
    
    // Validar timestamp (prevenir replay attacks)
    const timestampValidation = validateWebhookTimestamp(Date.now() / 1000, 5) // 5 minutos
    if (!timestampValidation.isValid) {
      console.error("Webhook Redsys: Timestamp inválido:", timestampValidation.error)
      
      // Registrar evento de auditoría para timestamp inválido
      await auditPaymentEvent(
        'webhook_timestamp_invalid',
        'unknown',
        'unknown',
        webhookData.orderNumber,
        webhookData.amount || 0,
        false,
        request,
        { error: timestampValidation.error, orderNumber: webhookData.orderNumber },
        timestampValidation.error || 'Timestamp inválido'
      )
      
      return NextResponse.json({ error: timestampValidation.error }, { status: 400 })
    }

    // Determinar estado del pago usando la función utilitaria actualizada
    const paymentStatus = getPaymentStatusFromRedsysCode(webhookData.responseCode)

    // Extraer reservationId del merchantData o del orderNumber
    let reservationId = webhookData.merchantData
    if (!reservationId) {
      // Fallback: extraer del orderNumber si no está en merchantData
      reservationId = webhookData.orderNumber.includes('_') 
        ? webhookData.orderNumber.split('_')[1] 
        : webhookData.orderNumber.slice(-36) // Fallback: últimos 36 caracteres
    }

    console.log(`Webhook Redsys: Procesando preautorización para reserva ${reservationId}, estado: ${paymentStatus}, código: ${webhookData.responseCode}`)

    // Obtener información de la reserva para auditoría
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("user_id, total_price, payment_status, status")
      .eq("id", reservationId)
      .single()

    if (reservationError) {
      console.error("Error obteniendo información de reserva:", reservationError)
      
      // Registrar evento de auditoría para error de reserva
      await auditPaymentEvent(
        'webhook_reservation_error',
        'unknown',
        'unknown',
        webhookData.orderNumber,
        webhookData.amount || 0,
        false,
        request,
        { 
          error: reservationError.message,
          reservationId,
          orderNumber: webhookData.orderNumber
        },
        'Error obteniendo información de reserva'
      )
      
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Obtener información del usuario para auditoría
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", reservation.user_id)
      .single()

    const userEmail = userError ? 'unknown' : userProfile?.email || 'unknown'

    // Determinar el estado final de la reserva basado en el tipo de transacción
    let finalReservationStatus = reservation.status
    let finalPaymentStatus = paymentStatus

    // Si es una preautorización exitosa (código 0000), actualizar estado
    if (webhookData.responseCode === "0000" && webhookData.transactionType === "1") {
      finalReservationStatus = "preautorizado"
      finalPaymentStatus = "preautorizado"
    }
    // Si es una confirmación exitosa (código 0900), actualizar estado
    else if (webhookData.responseCode === "0900" && webhookData.transactionType === "2") {
      finalReservationStatus = "confirmado"
      finalPaymentStatus = "pagado"
    }
    // Si es un rechazo, mantener estado actual o marcar como rechazado
    else if (paymentStatus === "rechazado") {
      finalPaymentStatus = "rechazado"
    }

    // Actualizar la reserva en la base de datos
    const { data, error } = await supabase
      .from("reservations")
      .update({
        status: finalReservationStatus,
        payment_status: finalPaymentStatus,
        payment_id: webhookData.orderNumber,
        payment_auth_code: webhookData.authCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId)
      .select()

    if (error) {
      console.error("Error actualizando reserva:", error)
      
      // Registrar evento de auditoría para error de actualización
      await auditPaymentEvent(
        'webhook_update_failed',
        reservation.user_id,
        userEmail,
        webhookData.orderNumber,
        reservation.total_price,
        false,
        request,
        { 
          error: error.message,
          reservationId,
          paymentStatus: finalPaymentStatus,
          orderNumber: webhookData.orderNumber
        },
        'Error actualizando estado de preautorización'
      )
      
      return NextResponse.json({ error: "Error actualizando reserva" }, { status: 500 })
    }

    // Registrar evento de auditoría para preautorización procesada exitosamente
    await auditPaymentEvent(
      'webhook_preauthorization_processed',
      reservation.user_id,
      userEmail,
      webhookData.orderNumber,
      reservation.total_price,
      true,
      request,
      { 
        reservationId,
        paymentStatus: finalPaymentStatus,
        reservationStatus: finalReservationStatus,
        authCode: webhookData.authCode,
        responseCode: webhookData.responseCode,
        transactionType: webhookData.transactionType,
        orderNumber: webhookData.orderNumber
      }
    )

    console.log(`Webhook Redsys: Preautorización procesada exitosamente para reserva ${reservationId}`)

    return NextResponse.json({ 
      success: true, 
      message: "Preautorización procesada correctamente",
      reservationId,
      paymentStatus: finalPaymentStatus,
      reservationStatus: finalReservationStatus
    })

  } catch (error) {
    console.error("Error procesando webhook Redsys:", error)
    
    // Registrar evento de auditoría para error general
    await auditPaymentEvent(
      'webhook_processing_error',
      'unknown',
      'unknown',
      'unknown',
      0,
      false,
      request,
      { error: (error as Error).message },
      (error as Error).message
    )
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
