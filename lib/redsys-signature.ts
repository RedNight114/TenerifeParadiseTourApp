import crypto from 'crypto'

/**
 * Genera la firma de Redsys siguiendo la implementación oficial HMAC_SHA256_V1
 * 
 * Algoritmo oficial:
 * 1. Decodificar la clave secreta desde Base64
 * 2. Cifrar el número de pedido con 3DES-ECB usando la clave secreta
 * 3. Usar el resultado del cifrado como clave para HMAC-SHA256
 * 4. Generar HMAC-SHA256 sobre DS_MERCHANTPARAMETERS (Base64 del JSON)
 * 5. Codificar la firma final en Base64
 */

/**
 * Cifra datos usando 3DES en modo ECB
 * @param data - Datos a cifrar
 * @param key - Clave en formato Buffer
 * @returns Buffer cifrado
 */
function encrypt3DES_ECB(data: string, key: Buffer): Buffer {
  // Asegurar que la clave tenga exactamente 24 bytes para 3DES
  let keyBuffer = key
  if (key.length < 24) {
    keyBuffer = Buffer.concat([key, Buffer.alloc(24 - key.length, 0)])
  } else if (key.length > 24) {
    keyBuffer = key.slice(0, 24)
  }

  // Crear cipher 3DES en modo ECB (sin IV)
  const cipher = crypto.createCipheriv('des-ede3', keyBuffer, null)
  cipher.setAutoPadding(true)
  
  // Cifrar los datos
  return Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ])
}

/**
 * Genera la firma de Redsys siguiendo el estándar oficial HMAC_SHA256_V1
 * 
 * Algoritmo oficial:
 * 1. Decodificar la clave secreta desde Base64
 * 2. Cifrar DS_MERCHANT_ORDER con 3DES ECB usando la clave secreta
 * 3. Usar el resultado como clave para HMAC-SHA256
 * 4. Firmar DS_MERCHANTPARAMETERS (Base64 del JSON) con HMAC-SHA256
 * 5. Devolver la firma en Base64 estándar
 * 
 * @param secretKeyBase64 - Clave secreta en Base64 (ej: sq7HjrUOBfKmC576ILgskD5srU870gJ7)
 * @param orderNumber - Número de pedido (DS_MERCHANT_ORDER)
 * @param merchantParams - Objeto con los parámetros del comercio
 * @returns Firma en formato Base64 estándar
 */
export function generateRedsysSignature(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: object
): string {
  // 1. Decodificar la clave secreta desde Base64
  const decodedSecretKey = Buffer.from(secretKeyBase64, 'base64')
  
  // 2. Cifrar el número de pedido con 3DES ECB
  const derivedKey = encrypt3DES_ECB(orderNumber, decodedSecretKey)
  
  // 3. Serializar merchantParams a JSON
  const merchantParametersJson = JSON.stringify(merchantParams)
  
  // 4. Codificar en Base64 estándar
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64')
  
  // 5. Generar HMAC-SHA256 con la clave derivada
  const hmac = crypto.createHmac('sha256', derivedKey)
  hmac.update(merchantParametersBase64, 'utf8')
  
  // 6. Devolver la firma en Base64 estándar
  return hmac.digest('base64')
}

/**
 * Verifica que una firma sea válida
 * 
 * @param signature - Firma a verificar en Base64
 * @param secretKeyBase64 - Clave secreta en Base64
 * @param orderNumber - Número de pedido
 * @param merchantParams - Parámetros del comercio
 * @returns true si la firma es válida
 */
export function verifyRedsysSignature(
  signature: string,
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: object
): boolean {
  try {
    const expectedSignature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams)
    const isValid = signature === expectedSignature
    
    if (!isValid) {
      console.log('❌ REDSYS - Firma inválida:', { orderNumber })
    }
    
    return isValid
  } catch (error) {
    console.error('❌ REDSYS SIGNATURE - Error verificando firma:', error)
    return false
  }
}

/**
 * Función de utilidad para generar firma completa con parámetros estándar
 * 
 * @param secretKeyBase64 - Clave secreta en Base64
 * @param orderNumber - Número de pedido
 * @param amount - Importe en céntimos (ej: 1800 para 18.00€)
 * @param merchantCode - Código de comercio
 * @param currency - Código de moneda (978 para EUR)
 * @param transactionType - Tipo de transacción (1=Autorización, 2=Confirmación)
 * @param terminal - Terminal (001)
 * @returns Objeto con firma y parámetros en Base64
 */
export function generateCompleteRedsysSignature(
  secretKeyBase64: string,
  orderNumber: string,
  amount: number,
  merchantCode: string,
  currency: string = '978',
  transactionType: string = '1',
  terminal: string = '001'
): { signature: string; merchantParametersBase64: string } {
  try {
    // Crear parámetros estándar
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amount.toString().padStart(12, '0'),
      DS_MERCHANT_ORDER: orderNumber,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_CURRENCY: currency,
      DS_MERCHANT_TRANSACTIONTYPE: transactionType,
      DS_MERCHANT_TERMINAL: terminal
    }

    // Generar firma
    const signature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams)
    
    // Convertir parámetros a Base64
    const merchantParametersBase64 = Buffer.from(JSON.stringify(merchantParams), 'utf8').toString('base64')
    
    return {
      signature,
      merchantParametersBase64
    }
  } catch (error) {
    console.error('❌ REDSYS SIGNATURE - Error en firma completa:', error)
    throw error
  }
}

/**
 * Función de utilidad para validar webhook de Redsys
 * 
 * @param merchantParametersBase64 - Parámetros del comercio en Base64
 * @param signature - Firma recibida en Base64
 * @param secretKeyBase64 - Clave secreta en Base64
 * @returns true si el webhook es válido
 */
export function validateRedsysWebhook(
  merchantParametersBase64: string,
  signature: string,
  secretKeyBase64: string
): boolean {
  try {
    // Decodificar parámetros
    const merchantParametersJson = Buffer.from(merchantParametersBase64, 'base64').toString('utf8')
    const merchantParams = JSON.parse(merchantParametersJson)
    
    // Extraer número de pedido (los webhooks usan DS_ORDER, no DS_MERCHANT_ORDER)
    const orderNumber = merchantParams.DS_ORDER || merchantParams.Ds_Order || 
                       merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order
    
    if (!orderNumber) {
      console.error('❌ REDSYS WEBHOOK - No se encontró número de pedido en los parámetros')
      console.error('❌ REDSYS WEBHOOK - Parámetros disponibles:', Object.keys(merchantParams))
      return false
    }
    
    // Generar firma esperada
    const expectedSignature = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams)
    
    // Comparar firmas
    const isValid = signature === expectedSignature
    
    if (!isValid) {
      console.log('❌ REDSYS WEBHOOK - Firma inválida:', { 
        orderNumber,
        receivedSignature: signature,
        expectedSignature: expectedSignature
      })
    } else {
      console.log('✅ REDSYS WEBHOOK - Firma válida para orderNumber:', orderNumber)
    }
    
    return isValid
  } catch (error) {
    console.error('❌ REDSYS WEBHOOK - Error validando webhook:', error)
    return false
  }
} 