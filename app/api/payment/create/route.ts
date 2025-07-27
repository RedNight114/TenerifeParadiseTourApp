import { type NextRequest, NextResponse } from "next/server"
import { generateCompleteRedsysSignature } from "@/lib/redsys-signature"
import { createPaymentSchema, validateData } from "@/lib/validation-schemas"
import { createValidationErrorResponse, sanitizeObject } from "@/lib/api-validation"
import { withPaymentRateLimit } from "@/lib/rate-limiting"

// POST - Crear preautorización con rate limiting específico para pagos
export const POST = withPaymentRateLimit(async (request: NextRequest) => {
  try {
    // Obtener y validar el body
    const body = await request.json().catch(() => ({}))

    const validation = validateData(createPaymentSchema, body)

    if (!validation.success) {
      console.error("❌ PAYMENT CREATE - Error de validación:", validation.errors)
      return createValidationErrorResponse(validation.errors)
    }

    const validatedData = validation.data

    // Sanitizar los datos antes de procesarlos
    const sanitizedData = sanitizeObject(validatedData)

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

    if (!merchantCode || !terminal || !secretKey || !environment) {
      console.error("❌ PAYMENT CREATE - Configuración de Redsys incompleta")
      return NextResponse.json({ error: "Configuración de pago incompleta" }, { status: 500 })
    }

    // Convertir el amount a céntimos (Redsys requiere el importe en céntimos sin decimales)
    const amountInCents = Math.round(sanitizedData.amount * 100)

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
    // Redsys requiere que sea alfanumérico y único
    const timestamp = Date.now().toString()
    const reservationSuffix = sanitizedData.reservationId.replace(/-/g, '').slice(-4)
    const orderNumber = `${timestamp}${reservationSuffix}`.slice(0, 12)

    // Validación del número de pedido
    if (!orderNumber || orderNumber.length === 0) {
      console.error("❌ PAYMENT CREATE - Número de pedido inválido")
      return NextResponse.json({ 
        error: "Número de pedido inválido", 
        details: "No se pudo generar un número de pedido válido"
      }, { status: 500 })
    }

    // URLs de respuesta
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const urlOK = `${baseUrl}/payment/success?reservationId=${sanitizedData.reservationId}`
    const urlKO = `${baseUrl}/payment/error?reservationId=${sanitizedData.reservationId}`
    const urlNotification = `${baseUrl}/api/payment/webhook`

    // Parámetros del comercio según documentación oficial de Redsys
    const merchantParameters = {
      DS_MERCHANT_AMOUNT: amountInCents.toString().padStart(12, '0'), // 12 posiciones numéricas sin decimales
      DS_MERCHANT_ORDER: orderNumber, // Alfanumérico, máximo 12 posiciones
      DS_MERCHANT_MERCHANTCODE: merchantCode, // Numérico, máximo 9 posiciones
      DS_MERCHANT_CURRENCY: "978", // EUR según ISO-4217
      DS_MERCHANT_TRANSACTIONTYPE: "1", // 1 = Preautorización (autorización sin captura)
      DS_MERCHANT_TERMINAL: terminal.padStart(3, '0'), // Numérico, 3 posiciones - IMPORTANTE: debe ser "001"
      DS_MERCHANT_MERCHANTURL: urlNotification, // URL de notificación
      DS_MERCHANT_URLOK: urlOK, // URL de éxito
      DS_MERCHANT_URLKO: urlKO, // URL de error
      DS_MERCHANT_PRODUCTDESCRIPTION: sanitizedData.description, // Descripción del producto
      DS_MERCHANT_MERCHANTNAME: "Tenerife Paradise Tours", // Nombre del comercio
      DS_MERCHANT_CONSUMERLANGUAGE: "001", // Español
      DS_MERCHANT_MERCHANTNAMER: '************************************', // Campo correcto según error real
    }



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
    // IMPORTANTE: No escapar las barras en las URLs para evitar problemas de firma
    let merchantParametersJson = JSON.stringify(merchantParameters)
    
    // Verificar y corregir caracteres escapados en las URLs
    if (merchantParametersJson.includes('\\/')) {
      merchantParametersJson = merchantParametersJson.replace(/\\\//g, '/')
    }
    
    const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')

    // Generar firma usando la nueva función oficial de Redsys
    // IMPORTANTE: Usar el JSON limpio (sin caracteres escapados) para la firma
    const cleanMerchantParameters = JSON.parse(merchantParametersJson)
    const { signature, merchantParametersBase64: finalMerchantParameters } = generateCompleteRedsysSignature(
      secretKey,
      orderNumber,
      amountInCents,
      merchantCode
    )

    // Datos del formulario para enviar a Redsys
    const formData = {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters: finalMerchantParameters,
      Ds_Signature: signature,
    }

    console.log("✅ PAYMENT CREATE - Preautorización creada:", { 
      orderNumber, 
      amount: sanitizedData.amount
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


