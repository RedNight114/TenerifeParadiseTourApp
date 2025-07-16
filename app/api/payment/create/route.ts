import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createPaymentSchema, validateData } from "@/lib/validation-schemas"
import { createValidationErrorResponse, sanitizeObject } from "@/lib/api-validation"
import { withPaymentRateLimit } from "@/lib/rate-limiting"

// POST - Crear preautorización con rate limiting específico para pagos
export const POST = withPaymentRateLimit(async (request: NextRequest) => {
  try {
    // Obtener y validar el body
    const body = await request.json().catch(() => ({}))
    
    console.log("🔍 PAYMENT CREATE - Datos recibidos del frontend:", {
      body,
      bodyType: typeof body,
      hasAmount: 'amount' in body,
      amountValue: body.amount,
      amountType: typeof body.amount,
      hasReservationId: 'reservationId' in body,
      reservationIdValue: body.reservationId,
      hasDescription: 'description' in body,
      descriptionValue: body.description
    })

    const validation = validateData(createPaymentSchema, body)

    if (!validation.success) {
      console.error("❌ PAYMENT CREATE - Error de validación:", validation.errors)
      return createValidationErrorResponse(validation.errors)
    }

    const validatedData = validation.data

    // Sanitizar los datos antes de procesarlos
    const sanitizedData = sanitizeObject(validatedData)

    console.log("✅ PAYMENT CREATE - Datos validados y sanitizados:", {
      reservationId: sanitizedData.reservationId,
      amount: sanitizedData.amount,
      amountType: typeof sanitizedData.amount,
      description: sanitizedData.description
    })

    // Validación adicional para detectar problemas
    if (!sanitizedData.amount || sanitizedData.amount <= 0) {
      console.error("❌ PAYMENT CREATE - Importe inválido:", {
        amount: sanitizedData.amount,
        amountType: typeof sanitizedData.amount,
        isZero: sanitizedData.amount === 0,
        isNegative: sanitizedData.amount < 0,
        isNaN: isNaN(sanitizedData.amount)
      })
      return NextResponse.json({ 
        error: "Importe inválido", 
        details: "El importe debe ser mayor que 0",
        receivedAmount: sanitizedData.amount,
        receivedType: typeof sanitizedData.amount
      }, { status: 400 })
    }

    if (!sanitizedData.reservationId || sanitizedData.reservationId.trim() === '') {
      console.error("❌ PAYMENT CREATE - ReservationId inválido:", {
        reservationId: sanitizedData.reservationId,
        reservationIdType: typeof sanitizedData.reservationId,
        isEmpty: sanitizedData.reservationId === '',
        isWhitespace: sanitizedData.reservationId.trim() === ''
      })
      return NextResponse.json({ 
        error: "ID de reserva inválido", 
        details: "El ID de reserva no puede estar vacío",
        receivedReservationId: sanitizedData.reservationId
      }, { status: 400 })
    }

    // Configuración de Redsys
    const merchantCode = process.env.REDSYS_MERCHANT_CODE!
    const terminal = process.env.REDSYS_TERMINAL!
    const secretKey = process.env.REDSYS_SECRET_KEY!
    const environment = process.env.REDSYS_ENVIRONMENT!

    console.log("🔧 PAYMENT CREATE - Configuración de Redsys:", {
      merchantCode,
      terminal,
      hasSecretKey: !!secretKey,
      environment,
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL
    })

    if (!merchantCode || !terminal || !secretKey || !environment) {
      console.error("❌ PAYMENT CREATE - Configuración de Redsys incompleta")
      return NextResponse.json({ error: "Configuración de pago incompleta" }, { status: 500 })
    }

    // Convertir el amount a céntimos (Redsys requiere el importe en céntimos sin decimales)
    const amountInCents = Math.round(sanitizedData.amount * 100)

    console.log("💰 PAYMENT CREATE - Cálculo de importe:", {
      originalAmount: sanitizedData.amount,
      amountInCents,
      calculation: `${sanitizedData.amount} * 100 = ${amountInCents}`
    })

    // Validación del importe en céntimos
    if (amountInCents <= 0) {
      console.error("❌ PAYMENT CREATE - Importe en céntimos inválido:", {
        originalAmount: sanitizedData.amount,
        amountInCents,
        calculation: `${sanitizedData.amount} * 100 = ${amountInCents}`
      })
      return NextResponse.json({ 
        error: "Importe en céntimos inválido", 
        details: "El importe convertido a céntimos debe ser mayor que 0",
        originalAmount: sanitizedData.amount,
        amountInCents
      }, { status: 400 })
    }

    // Generar número de pedido único (máximo 12 caracteres alfanuméricos)
    const orderNumber = `${Date.now()}${sanitizedData.reservationId.slice(-4)}`.slice(0, 12)

    console.log("📋 PAYMENT CREATE - Número de pedido:", {
      timestamp: Date.now(),
      reservationIdSuffix: sanitizedData.reservationId.slice(-4),
      orderNumber,
      orderNumberLength: orderNumber.length
    })

    // Validación del número de pedido
    if (!orderNumber || orderNumber.length === 0) {
      console.error("❌ PAYMENT CREATE - Número de pedido inválido:", {
        orderNumber,
        orderNumberLength: orderNumber.length,
        timestamp: Date.now(),
        reservationId: sanitizedData.reservationId
      })
      return NextResponse.json({ 
        error: "Número de pedido inválido", 
        details: "No se pudo generar un número de pedido válido",
        orderNumber,
        timestamp: Date.now()
      }, { status: 500 })
    }

    // URLs de respuesta
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const urlOK = `${baseUrl}/payment/success?reservationId=${sanitizedData.reservationId}`
    const urlKO = `${baseUrl}/payment/error?reservationId=${sanitizedData.reservationId}`
    const urlNotification = `${baseUrl}/api/payment/webhook`
    
    console.log("🌐 PAYMENT CREATE - URLs configuradas:", { 
      baseUrl, 
      urlOK, 
      urlKO, 
      urlNotification 
    })

    // Parámetros del comercio según documentación oficial de Redsys
    const merchantParameters = {
      DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'), // 12 posiciones numéricas
      DS_MERCHANT_ORDER: orderNumber, // Alfanumérico, máximo 12 posiciones
      DS_MERCHANT_MERCHANTCODE: merchantCode, // Numérico, máximo 9 posiciones
      DS_MERCHANT_CURRENCY: "978", // EUR según ISO-4217
      DS_MERCHANT_TRANSACTIONTYPE: "1", // 1 = Preautorización (autorización sin captura)
      DS_MERCHANT_TERMINAL: terminal, // Numérico, 3 posiciones
      DS_MERCHANT_MERCHANTURL: urlNotification, // URL de notificación
      DS_MERCHANT_URLOK: urlOK, // URL de éxito
      DS_MERCHANT_URLKO: urlKO, // URL de error
      DS_MERCHANT_PRODUCTDESCRIPTION: sanitizedData.description, // Descripción del producto
      DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours", // Nombre del comercio
      DS_MERCHANT_CONSUMERLANGUAGE: "001", // Español
      DS_MERCHANT_MERCHANTDATA: sanitizedData.reservationId, // Datos adicionales (reservationId)
    }

    console.log("📊 PAYMENT CREATE - Parámetros de Redsys:", merchantParameters)

    // Validación final de parámetros críticos
    if (merchantParameters.DS_MERCHANT_AMOUNT === '000000000000') {
      console.error("❌ PAYMENT CREATE - Importe final es 0:", {
        originalAmount: sanitizedData.amount,
        amountInCents,
        finalAmount: merchantParameters.DS_MERCHANT_AMOUNT
      })
      return NextResponse.json({ 
        error: "Importe final inválido", 
        details: "El importe final enviado a Redsys es 0",
        originalAmount: sanitizedData.amount,
        amountInCents,
        finalAmount: merchantParameters.DS_MERCHANT_AMOUNT
      }, { status: 400 })
    }

    if (!merchantParameters.DS_MERCHANT_ORDER || merchantParameters.DS_MERCHANT_ORDER.length === 0) {
      console.error("❌ PAYMENT CREATE - Número de pedido final vacío:", {
        orderNumber,
        finalOrder: merchantParameters.DS_MERCHANT_ORDER
      })
      return NextResponse.json({ 
        error: "Número de pedido final inválido", 
        details: "El número de pedido enviado a Redsys está vacío",
        orderNumber,
        finalOrder: merchantParameters.DS_MERCHANT_ORDER
      }, { status: 500 })
    }

    // Codificar parámetros en base64 usando el formato correcto de Redsys
    // Redsys espera los parámetros como un objeto JSON válido
    const merchantParametersJson = JSON.stringify(merchantParameters)
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')

    console.log("🔍 PAYMENT CREATE - Codificación de parámetros:", {
      jsonString: merchantParametersJson,
      base64Length: merchantParametersBase64.length,
      base64Preview: merchantParametersBase64.substring(0, 50) + '...'
    })

    // Generar firma según documentación oficial (HMAC_SHA256_V1)
    const signature = generateSignature(orderNumber, merchantParametersBase64, secretKey)

    // Datos del formulario para enviar a Redsys
    const formData = {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: merchantParametersBase64,
      Ds_Signature: signature,
    }

    console.log("✅ PAYMENT CREATE - Preautorización creada exitosamente:", { 
      orderNumber, 
      amount: sanitizedData.amount,
      amountInCents,
      finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
      finalOrder: merchantParameters.DS_MERCHANT_ORDER,
      signatureLength: signature.length
    })

    return NextResponse.json({
      redsysUrl: environment,
      formData,
      orderNumber,
      amount: sanitizedData.amount,
      reservationId: sanitizedData.reservationId,
      debug: {
        amountInCents,
        finalAmount: merchantParameters.DS_MERCHANT_AMOUNT,
        finalOrder: merchantParameters.DS_MERCHANT_ORDER
      }
    })
  } catch (error) {
    console.error("💥 PAYMENT CREATE - Error interno:", error)
    return NextResponse.json({ error: "Error al crear la preautorización" }, { status: 500 })
  }
})

function generateSignature(order: string, merchantParameters: string, secretKey: string): string {
  try {
    // Generar firma según documentación oficial de Redsys
    // HMAC-SHA256 con la clave secreta decodificada en base64
    const decodedKey = Buffer.from(secretKey, "base64")
    const hmac = crypto.createHmac("sha256", decodedKey)
    
    // Concatenar order + merchantParameters
    hmac.update(order + merchantParameters)
    
    // Obtener firma en base64
    const signature = hmac.digest("base64")

    console.log("🔐 PAYMENT CREATE - Firma generada:", { 
      order, 
      merchantParametersLength: merchantParameters.length, 
      signatureLength: signature.length 
    })

    return signature
  } catch (error) {
    console.error("❌ PAYMENT CREATE - Error generando firma:", error)
    throw new Error("Error al generar la firma de seguridad")
  }
}
