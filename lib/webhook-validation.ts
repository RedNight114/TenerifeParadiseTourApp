import crypto from "crypto"

export interface RedsysWebhookData {
  orderNumber: string
  amount: number
  currency: string
  responseCode: string
  authCode?: string
  transactionType: string
  merchantCode: string
  terminal: string
  language: string
  merchantData?: string
  cardCountry?: string
  cardBrand?: string
  processedPayMethod?: string
}

export interface WebhookValidationResult {
  isValid: boolean
  error?: string
  data?: RedsysWebhookData
}

export interface TimestampValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Valida un webhook de Redsys según la documentación oficial
 */
export function validateRedsysWebhook(
  merchantParameters: string,
  signature: string,
  signatureVersion: string,
  secretKey: string
): WebhookValidationResult {
  try {
    // Decodificar parámetros del comercio
    const decodedParameters = Buffer.from(merchantParameters, "base64").toString("utf-8")
    const parameters = JSON.parse(decodedParameters)

    console.log("Parámetros decodificados:", parameters)

    // Extraer datos del webhook
    const webhookData: RedsysWebhookData = {
      orderNumber: parameters.Ds_Order || parameters.DS_ORDER,
      amount: parseInt(parameters.Ds_Amount || parameters.DS_AMOUNT || "0"),
      currency: parameters.Ds_Currency || parameters.DS_CURRENCY,
      responseCode: parameters.Ds_Response || parameters.DS_RESPONSE,
      authCode: parameters.Ds_AuthorisationCode || parameters.DS_AUTHORISATIONCODE,
      transactionType: parameters.Ds_TransactionType || parameters.DS_TRANSACTIONTYPE,
      merchantCode: parameters.Ds_MerchantCode || parameters.DS_MERCHANTCODE,
      terminal: parameters.Ds_Terminal || parameters.DS_TERMINAL,
      language: parameters.Ds_Language || parameters.DS_LANGUAGE,
      merchantData: parameters.Ds_MerchantData || parameters.DS_MERCHANTDATA,
      cardCountry: parameters.Ds_Card_Country || parameters.DS_CARD_COUNTRY,
      cardBrand: parameters.Ds_Card_Brand || parameters.DS_CARD_BRAND,
      processedPayMethod: parameters.Ds_ProcessedPayMethod || parameters.DS_PROCESSEDPAYMETHOD,
    }

    // Validar parámetros requeridos
    if (!webhookData.orderNumber || !webhookData.responseCode) {
      return {
        isValid: false,
        error: "Parámetros requeridos faltantes en el webhook"
      }
    }

    // Generar firma esperada
    const expectedSignature = generateSignature(webhookData.orderNumber, merchantParameters, secretKey)

    // Comparar firmas
    if (signature !== expectedSignature) {
      console.error("Firma inválida:", {
        received: signature,
        expected: expectedSignature,
        orderNumber: webhookData.orderNumber
      })
      return {
        isValid: false,
        error: "Firma de seguridad inválida"
      }
    }

    return {
      isValid: true,
      data: webhookData
    }

  } catch (error) {
    console.error("Error validando webhook:", error)
    return {
      isValid: false,
      error: "Error al procesar los parámetros del webhook"
    }
  }
}

/**
 * Obtiene el estado del pago basado en el código de respuesta de Redsys
 * Según documentación oficial de Redsys para preautorizaciones
 */
export function getPaymentStatusFromRedsysCode(responseCode: string): string {
  switch (responseCode) {
    // Códigos de éxito para preautorizaciones
    case "0000": // Autorización concedida
    case "0900": // Autorización concedida (confirmación)
      return "preautorizado"
    
    // Códigos de error específicos
    case "101": // Tarjeta caducada
    case "102": // Tarjeta en excepción gdai
    case "104": // Operación no permitida
    case "116": // Disposición insuficiente
    case "118": // Tarjeta no registrada
    case "129": // Código de seguridad incorrecto
    case "180": // Tarjeta ajena al servicio
    case "184": // Error en la autenticación del titular
    case "190": // Denegación sin especificar motivo
    case "191": // Fecha de caducidad errónea
    case "202": // Tarjeta en excepción gdai
    case "912": // Emisor no disponible
    case "9912": // Emisor no disponible
    case "9064": // Número de posiciones de la tarjeta incorrecto
    case "9078": // Tipo de operación no permitida para esa tarjeta
    case "9093": // Tarjeta no existente
    case "9094": // Rechazo servidores internacionales
    case "9104": // Comercio con "titular seguro" y titular sin clave de seguridad
    case "9218": // El comercio no permite op. seguras por entrada "operaciones"
    case "9253": // Tarjeta no cumple el check-digit
    case "9256": // El comercio no puede realizar preautorizaciones
    case "9257": // Esta tarjeta no permite operativa de preautorizaciones
    case "9261": // Imposible autenticar 3DSecure
    case "9913": // Error en la confirmación que el comercio envía al TPV Virtual
    case "9914": // Confirmación "KO" del comercio
    case "9915": // A petición del usuario se ha cancelado el pago
    case "9927": // Anulación de autorización en diferido realizada por el SIS
    case "9928": // Confirmación de autorización en diferido realizada por el SIS
    case "9929": // Anulación de autorización en diferido realizada por el comercio
    case "9997": // Se está procesando otra transacción en SIS con la misma tarjeta
    case "9998": // Operación que debe realizarse por TPV
    case "9999": // Error al intentar enviar los datos de una operación que debe realizarse por TPV
      return "rechazado"
    
    // Códigos de error de sistema
    case "SIS0007": // Error al desmontar XML
    case "SIS0008": // Error DTD
    case "SIS0009": // Error al parsear XML
    case "SIS0010": // Error al parsear XML
    case "SIS0014": // Error versiones no coinciden
    case "SIS0015": // Error al parsear XML
    case "SIS0016": // Error objeto XML sin datos
    case "SIS0017": // Error versiones no coinciden
    case "SIS0018": // Error al parsear XML
    case "SIS0020": // Error al parsear XML
    case "SIS0021": // Error al parsear XML
    case "SIS0022": // Error al parsear XML
    case "SIS0023": // Error al parsear XML
    case "SIS0024": // Error al parsear XML
    case "SIS0025": // Error al parsear XML
    case "SIS0026": // Error al parsear XML
    case "SIS0027": // Error al parsear XML
    case "SIS0028": // Error al parsear XML
    case "SIS0029": // Error al parsear XML
    case "SIS0030": // Error al parsear XML
    case "SIS0031": // Error al parsear XML
    case "SIS0032": // Error al parsear XML
    case "SIS0033": // Error al parsear XML
    case "SIS0034": // Error al parsear XML
    case "SIS0035": // Error al parsear XML
    case "SIS0036": // Error al parsear XML
    case "SIS0037": // Error al parsear XML
    case "SIS0038": // Error al parsear XML
    case "SIS0039": // Error al parsear XML
    case "SIS0040": // Error al parsear XML
    case "SIS0041": // Error al parsear XML
    case "SIS0042": // Error al parsear XML
    case "SIS0043": // Error al parsear XML
    case "SIS0044": // Error al parsear XML
    case "SIS0045": // Error al parsear XML
    case "SIS0046": // Error al parsear XML
    case "SIS0047": // Error al parsear XML
    case "SIS0048": // Error al parsear XML
    case "SIS0049": // Error al parsear XML
    case "SIS0050": // Error al parsear XML
    case "SIS0051": // Error al parsear XML
    case "SIS0052": // Error al parsear XML
    case "SIS0053": // Error al parsear XML
    case "SIS0054": // Error al parsear XML
    case "SIS0055": // Error al parsear XML
    case "SIS0056": // Error al parsear XML
    case "SIS0057": // Error al parsear XML
    case "SIS0058": // Error al parsear XML
    case "SIS0059": // Error al parsear XML
    case "SIS0060": // Error al parsear XML
    case "SIS0061": // Error al parsear XML
    case "SIS0062": // Error al parsear XML
    case "SIS0063": // Error al parsear XML
    case "SIS0064": // Error al parsear XML
    case "SIS0065": // Error al parsear XML
    case "SIS0066": // Error al parsear XML
    case "SIS0067": // Error al parsear XML
    case "SIS0068": // Error al parsear XML
    case "SIS0069": // Error al parsear XML
    case "SIS0070": // Error al parsear XML
    case "SIS0071": // Error al parsear XML
    case "SIS0072": // Error al parsear XML
    case "SIS0073": // Error al parsear XML
    case "SIS0074": // Error al parsear XML
    case "SIS0075": // Error al parsear XML
    case "SIS0076": // Error al parsear XML
    case "SIS0077": // Error al parsear XML
    case "SIS0078": // Error al parsear XML
    case "SIS0079": // Error al parsear XML
    case "SIS0080": // Error al parsear XML
    case "SIS0081": // Error al parsear XML
    case "SIS0082": // Error al parsear XML
    case "SIS0083": // Error al parsear XML
    case "SIS0084": // Error al parsear XML
    case "SIS0085": // Error al parsear XML
    case "SIS0086": // Error al parsear XML
    case "SIS0087": // Error al parsear XML
    case "SIS0088": // Error al parsear XML
    case "SIS0089": // Error al parsear XML
    case "SIS0090": // Error al parsear XML
    case "SIS0091": // Error al parsear XML
    case "SIS0092": // Error al parsear XML
    case "SIS0093": // Error al parsear XML
    case "SIS0094": // Error al parsear XML
    case "SIS0095": // Error al parsear XML
    case "SIS0096": // Error al parsear XML
    case "SIS0097": // Error al parsear XML
    case "SIS0098": // Error al parsear XML
    case "SIS0099": // Error al parsear XML
    case "SIS0100": // Error al parsear XML
    case "SIS0101": // Error al parsear XML
    case "SIS0102": // Error al parsear XML
    case "SIS0103": // Error al parsear XML
    case "SIS0104": // Error al parsear XML
    case "SIS0105": // Error al parsear XML
    case "SIS0106": // Error al parsear XML
    case "SIS0107": // Error al parsear XML
    case "SIS0108": // Error al parsear XML
    case "SIS0109": // Error al parsear XML
    case "SIS0110": // Error al parsear XML
    case "SIS0111": // Error al parsear XML
    case "SIS0112": // Error al parsear XML
    case "SIS0113": // Error al parsear XML
    case "SIS0114": // Error al parsear XML
    case "SIS0115": // Error al parsear XML
    case "SIS0116": // Error al parsear XML
    case "SIS0117": // Error al parsear XML
    case "SIS0118": // Error al parsear XML
    case "SIS0119": // Error al parsear XML
    case "SIS0120": // Error al parsear XML
    case "SIS0121": // Error al parsear XML
    case "SIS0122": // Error al parsear XML
    case "SIS0123": // Error al parsear XML
    case "SIS0124": // Error al parsear XML
    case "SIS0125": // Error al parsear XML
    case "SIS0126": // Error al parsear XML
    case "SIS0127": // Error al parsear XML
    case "SIS0128": // Error al parsear XML
    case "SIS0129": // Error al parsear XML
    case "SIS0130": // Error al parsear XML
    case "SIS0131": // Error al parsear XML
    case "SIS0132": // Error al parsear XML
    case "SIS0133": // Error al parsear XML
    case "SIS0134": // Error al parsear XML
    case "SIS0135": // Error al parsear XML
    case "SIS0136": // Error al parsear XML
    case "SIS0137": // Error al parsear XML
    case "SIS0138": // Error al parsear XML
    case "SIS0139": // Error al parsear XML
    case "SIS0140": // Error al parsear XML
    case "SIS0141": // Error al parsear XML
    case "SIS0142": // Error al parsear XML
    case "SIS0143": // Error al parsear XML
    case "SIS0144": // Error al parsear XML
    case "SIS0145": // Error al parsear XML
    case "SIS0146": // Error al parsear XML
    case "SIS0147": // Error al parsear XML
    case "SIS0148": // Error al parsear XML
    case "SIS0149": // Error al parsear XML
    case "SIS0150": // Error al parsear XML
    case "SIS0151": // Error al parsear XML
    case "SIS0152": // Error al parsear XML
    case "SIS0153": // Error al parsear XML
    case "SIS0154": // Error al parsear XML
    case "SIS0155": // Error al parsear XML
    case "SIS0156": // Error al parsear XML
    case "SIS0157": // Error al parsear XML
    case "SIS0158": // Error al parsear XML
    case "SIS0159": // Error al parsear XML
    case "SIS0160": // Error al parsear XML
    case "SIS0161": // Error al parsear XML
    case "SIS0162": // Error al parsear XML
    case "SIS0163": // Error al parsear XML
    case "SIS0164": // Error al parsear XML
    case "SIS0165": // Error al parsear XML
    case "SIS0166": // Error al parsear XML
    case "SIS0167": // Error al parsear XML
    case "SIS0168": // Error al parsear XML
    case "SIS0169": // Error al parsear XML
    case "SIS0170": // Error al parsear XML
    case "SIS0171": // Error al parsear XML
    case "SIS0172": // Error al parsear XML
    case "SIS0173": // Error al parsear XML
    case "SIS0174": // Error al parsear XML
    case "SIS0175": // Error al parsear XML
    case "SIS0176": // Error al parsear XML
    case "SIS0177": // Error al parsear XML
    case "SIS0178": // Error al parsear XML
    case "SIS0179": // Error al parsear XML
    case "SIS0180": // Error al parsear XML
    case "SIS0181": // Error al parsear XML
    case "SIS0182": // Error al parsear XML
    case "SIS0183": // Error al parsear XML
    case "SIS0184": // Error al parsear XML
    case "SIS0185": // Error al parsear XML
    case "SIS0186": // Error al parsear XML
    case "SIS0187": // Error al parsear XML
    case "SIS0188": // Error al parsear XML
    case "SIS0189": // Error al parsear XML
    case "SIS0190": // Error al parsear XML
    case "SIS0191": // Error al parsear XML
    case "SIS0192": // Error al parsear XML
    case "SIS0193": // Error al parsear XML
    case "SIS0194": // Error al parsear XML
    case "SIS0195": // Error al parsear XML
    case "SIS0196": // Error al parsear XML
    case "SIS0197": // Error al parsear XML
    case "SIS0198": // Error al parsear XML
    case "SIS0199": // Error al parsear XML
    case "SIS0200": // Error al parsear XML
      return "error_sistema"
    
    default:
      return "pendiente"
  }
}

/**
 * Valida el timestamp del webhook para prevenir replay attacks
 */
export function validateWebhookTimestamp(webhookTimestamp: number, maxAgeMinutes: number = 5): TimestampValidationResult {
  const currentTime = Date.now() / 1000
  const maxAge = maxAgeMinutes * 60

  if (Math.abs(currentTime - webhookTimestamp) > maxAge) {
    return {
      isValid: false,
      error: `Timestamp del webhook demasiado antiguo. Diferencia: ${Math.abs(currentTime - webhookTimestamp)}s`
    }
  }

  return { isValid: true }
}

/**
 * Genera la firma para validar webhooks de Redsys
 */
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