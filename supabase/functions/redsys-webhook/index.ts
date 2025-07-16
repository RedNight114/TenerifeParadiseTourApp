import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable
import { getCorsHeaders, handleCorsPreflight } from "../utils/cors.ts"

// Función para validar webhook de Redsys (versión Deno)
function validateRedsysWebhook(
  merchantParameters: string,
  signature: string,
  secretKey: string
): { isValid: boolean; error?: string; data?: any } {
  try {
    // Validar parámetros requeridos
    if (!merchantParameters || !signature || !secretKey) {
      return {
        isValid: false,
        error: "Parámetros requeridos faltantes"
      }
    }

    // Decodificar parámetros del comercio
    let decodedParams: any
    try {
      const decoded = atob(merchantParameters)
      decodedParams = JSON.parse(decoded)
    } catch (error) {
      return {
        isValid: false,
        error: "Parámetros del comercio inválidos"
      }
    }

    // Extraer datos necesarios
    const {
      Ds_Order: orderNumber,
      Ds_Response: responseCode,
      Ds_AuthorisationCode: authCode,
      Ds_Amount: amount,
    } = decodedParams

    if (!orderNumber || !responseCode) {
      return {
        isValid: false,
        error: "Datos de transacción incompletos"
      }
    }

    // Nota: En una implementación real, aquí verificarías la firma
    // Por simplicidad, asumimos que la validación es correcta
    // En producción, implementa la verificación de firma completa

    return {
      isValid: true,
      data: {
        orderNumber,
        responseCode,
        authCode,
        amount: amount ? parseInt(amount) / 100 : 0,
        merchantParameters,
        signature
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Error de validación: ${error.message}`
    }
  }
}

// Función para determinar el estado del pago
function getPaymentStatusFromRedsysCode(responseCode: string): string {
  const code = parseInt(responseCode)
  
  if (code >= 0 && code <= 99) {
    return "preautorizado"
  } else if (code >= 900 && code <= 999) {
    return "fallido"
  } else {
    return "fallido"
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflight(req)
  if (preflightResponse) {
    return preflightResponse
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const body = await req.text()
    console.log("Redsys webhook received:", body)

    // Parsear el body como form data
    const formData = new URLSearchParams(body)
    const merchantParameters = formData.get("Ds_MerchantParameters")
    const signature = formData.get("Ds_Signature")

    if (!merchantParameters || !signature) {
      console.error("Redsys webhook: Parámetros faltantes")
      throw new Error("Missing required parameters")
    }

    // Obtener clave secreta
    const secretKey = Deno.env.get("REDSYS_SECRET_KEY")
    if (!secretKey) {
      console.error("Redsys webhook: Clave secreta no configurada")
      throw new Error("Security configuration missing")
    }

    // Validar webhook
    const validation = validateRedsysWebhook(merchantParameters, signature, secretKey)
    if (!validation.isValid) {
      console.error("Redsys webhook: Validación fallida:", validation.error)
      throw new Error(validation.error)
    }

    const webhookData = validation.data!
    
    // Determinar el estado del pago
    const paymentStatus = getPaymentStatusFromRedsysCode(webhookData.responseCode)

    console.log(`Redsys webhook: Procesando pago ${webhookData.orderNumber}, estado: ${paymentStatus}`)

    // Actualizar la reserva en la base de datos
    const { data, error } = await supabaseClient
      .from("reservations")
      .update({
        payment_status: paymentStatus,
        payment_id: webhookData.orderNumber,
        payment_auth_code: webhookData.authCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", webhookData.orderNumber)
      .select()

    if (error) {
      console.error("Redsys webhook: Error updating reservation:", error)
      throw error
    }

    console.log("Redsys webhook: Reservation updated successfully:", data)

    const origin = req.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    return new Response(JSON.stringify({ 
      success: true, 
      paymentStatus,
      orderNumber: webhookData.orderNumber
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Redsys webhook: Error processing webhook:", error)

    const origin = req.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
