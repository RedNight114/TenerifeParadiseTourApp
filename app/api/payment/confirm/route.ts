import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { confirmPaymentSchema, validateData } from "@/lib/validation-schemas"
import { createValidationErrorResponse } from "@/lib/api-validation"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Obtener y validar el body
    const body = await request.json().catch(() => ({}))
    const validation = validateData(confirmPaymentSchema, body)

    if (!validation.success) {
      console.error("Error de validación en confirmación de preautorización:", validation.errors)
      return createValidationErrorResponse(validation.errors)
    }

    const validatedData = validation.data

    console.log("Confirmando preautorización para reserva:", validatedData.reservationId)

    // Obtener la reserva
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", validatedData.reservationId)
      .single()

    if (fetchError || !reservation) {
      console.error("Reserva no encontrada:", validatedData.reservationId)
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    if (reservation.payment_status !== "preautorizado") {
      console.error("Pago no está preautorizado:", {
        reservationId: validatedData.reservationId,
        currentStatus: reservation.payment_status
      })
      return NextResponse.json({ error: "El pago no está preautorizado" }, { status: 400 })
    }

    // Confirmar la preautorización con Redsys usando API REST
    const confirmationResult = await confirmRedsysPreauthorization(reservation)

    if (confirmationResult.success) {
      // Actualizar el estado de la reserva y el pago
      const { data, error } = await supabase
        .from("reservations")
        .update({
          status: "confirmado",
          payment_status: "pagado",
          payment_auth_code: confirmationResult.authCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", validatedData.reservationId)
        .select()

      if (error) {
        console.error("Error actualizando reserva:", error)
        throw error
      }

      console.log("Preautorización confirmada exitosamente:", {
        reservationId: validatedData.reservationId,
        authCode: confirmationResult.authCode,
        responseCode: confirmationResult.responseCode
      })

      return NextResponse.json({
        success: true,
        message: "Preautorización confirmada exitosamente",
        reservation: data[0],
        authCode: confirmationResult.authCode,
        responseCode: confirmationResult.responseCode
      })
    } else {
      throw new Error(`Error al confirmar la preautorización: ${confirmationResult.error}`)
    }
  } catch (error) {
    console.error("Error interno en confirmación de preautorización:", error)
    return NextResponse.json({ error: "Error al confirmar la preautorización" }, { status: 500 })
  }
}

// Función para confirmar preautorización con Redsys usando API REST
async function confirmRedsysPreauthorization(reservation: any) {
  try {
    const merchantCode = process.env.REDSYS_MERCHANT_CODE!
    const terminal = process.env.REDSYS_TERMINAL!
    const secretKey = process.env.REDSYS_SECRET_KEY!
    const environment = process.env.REDSYS_ENVIRONMENT!

    if (!merchantCode || !terminal || !secretKey || !environment) {
      throw new Error("Configuración de Redsys incompleta")
    }

    // Convertir el importe a céntimos
    const amountInCents = Math.round(reservation.total_price * 100)

    // Usar el mismo número de pedido de la preautorización original
    const orderNumber = reservation.payment_id || `${Date.now()}${reservation.id.slice(-4)}`.slice(0, 12)

    // Parámetros para confirmación según documentación oficial
    const merchantParameters = {
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_TRANSACTIONTYPE: "2", // 2 = Confirmación de preautorización
      DS_MERCHANT_CURRENCY: "978", // EUR
      DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'),
    }

    // Codificar parámetros en base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParameters)).toString("base64")

    // Generar firma
    const signature = generateSignature(orderNumber, merchantParametersBase64, secretKey)

    // Datos para enviar a Redsys
    const requestData = {
      Ds_Merchant_MerchantParameters: merchantParametersBase64,
      Ds_Merchant_Signature: signature,
      Ds_SignatureVersion: "HMAC_SHA256_V1"
    }

    // URL de Redsys según entorno
    const redsysUrl = environment === "production" 
      ? "https://sis.redsys.es/sis/rest/trataPeticionREST"
      : "https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST"

    console.log("Enviando confirmación a Redsys:", { redsysUrl, orderNumber, amountInCents })

    // Realizar petición a Redsys
    const response = await fetch(redsysUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()
    console.log("Respuesta de Redsys:", responseData)

    // Decodificar parámetros de respuesta
    const responseParameters = JSON.parse(Buffer.from(responseData.Ds_Merchant_MerchantParameters, "base64").toString())
    
    console.log("Parámetros de respuesta decodificados:", responseParameters)

    // Verificar respuesta
    if (responseParameters.Ds_Response === "0900") {
      return {
        success: true,
        authCode: responseParameters.Ds_AuthorisationCode,
        responseCode: responseParameters.Ds_Response,
        orderNumber: responseParameters.Ds_Order
      }
    } else {
      return {
        success: false,
        error: `Código de respuesta Redsys: ${responseParameters.Ds_Response}`,
        responseCode: responseParameters.Ds_Response
      }
    }

  } catch (error) {
    console.error("Error en confirmación de Redsys:", error)
    return { success: false, error: (error as Error).message }
  }
}

function generateSignature(order: string, merchantParameters: string, secretKey: string): string {
  try {
    const decodedKey = Buffer.from(secretKey, "base64")
    const hmac = crypto.createHmac("sha256", decodedKey)
    hmac.update(order + merchantParameters)
    return hmac.digest("base64")
  } catch (error) {
    console.error("Error generando firma:", error)
    throw new Error("Error al generar la firma de seguridad")
  }
}
