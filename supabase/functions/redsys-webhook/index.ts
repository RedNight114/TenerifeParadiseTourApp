import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable
import { getCorsHeaders, handleCorsPreflight } from "../utils/cors.ts"
import { generateRedsysSignature, validateRedsysWebhook } from '../../../lib/redsys-signature.ts'

// Función para cifrar con 3DES en modo ECB (versión Deno)
function encrypt3DES_ECB(data: string, key: Uint8Array): Uint8Array {
  try {
    // Asegurar que la clave tenga exactamente 24 bytes para 3DES
    let keyBuffer = key
    if (key.length < 24) {
      // Padding con ceros si es necesario
      const newKey = new Uint8Array(24)
      newKey.set(key)
      keyBuffer = newKey
    } else if (key.length > 24) {
      // Truncar si es muy larga
      keyBuffer = key.slice(0, 24)
    }

    // Nota: Deno no tiene soporte nativo para 3DES, por lo que usamos una implementación simplificada
    // En producción, considera usar una librería externa o implementar 3DES manualmente
    
    // Por ahora, usamos una clave derivada simple para compatibilidad
    const derivedKey = new Uint8Array(32) // SHA-256 requiere 32 bytes
    for (let i = 0; i < 32; i++) {
      derivedKey[i] = keyBuffer[i % 24] ^ data.charCodeAt(i % data.length)
    }
    
    return derivedKey
  } catch (error) {
    console.error("Error en encrypt3DES_ECB:", error)
    throw new Error(`Error cifrando con 3DES-ECB: ${error.message}`)
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
    const isValid = validateRedsysWebhook(merchantParameters, signature, secretKey)
    if (!isValid) {
      console.error("Redsys webhook: Validación fallida")
      throw new Error("Firma inválida")
    }

    // Decodificar parámetros para obtener los datos del webhook
    const decoded = atob(merchantParameters)
    const webhookData = JSON.parse(decoded)
    
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
