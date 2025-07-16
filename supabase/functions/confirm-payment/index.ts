import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"
import { getCorsHeaders, handleCorsPreflight } from "../utils/cors.ts"

serve(async (req) => {
  const preflightResponse = handleCorsPreflight(req)
  if (preflightResponse) {
    return preflightResponse
  }

  try {
    const { reservationId } = await req.json()

    if (!reservationId) {
      throw new Error("Reservation ID is required")
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Obtener la reserva
    const { data: reservation, error: fetchError } = await supabaseClient
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single()

    if (fetchError || !reservation) {
      throw new Error("Reservation not found")
    }

    if (reservation.payment_status !== "preautorizado") {
      throw new Error("Payment not pre-authorized")
    }

    // Aquí implementarías la llamada a Redsys para confirmar el pago
    // Por simplicidad, simulamos que el pago se confirma correctamente

    console.log("Confirming payment for reservation:", reservationId)

    // Simular llamada a API de Redsys para confirmar el cargo
    const confirmationResult = await simulateRedsysConfirmation(reservation)

    if (confirmationResult.success) {
      // Actualizar el estado de la reserva y el pago
      const { data, error } = await supabaseClient
        .from("reservations")
        .update({
          status: "confirmado",
          payment_status: "pagado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservationId)
        .select()

      if (error) {
        throw error
      }

      const origin = req.headers.get("origin")
      const corsHeaders = getCorsHeaders(origin)

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment confirmed successfully",
          reservation: data[0],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      )
    } else {
      throw new Error("Failed to confirm payment with Redsys")
    }
  } catch (error) {
    console.error("Error confirming payment:", error)

    const origin = req.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

// Función simulada para confirmar el pago con Redsys
async function simulateRedsysConfirmation(reservation: any) {
  // En una implementación real, aquí harías la llamada a la API de Redsys
  // para confirmar el cargo de la preautorización

  console.log("Simulating Redsys confirmation for amount:", reservation.total_amount)

  // Simular un delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simular éxito (en producción, manejar errores reales)
  return { success: true, transactionId: `TXN_${Date.now()}` }
}
