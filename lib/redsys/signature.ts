import crypto from 'crypto';

/**
 * Genera la firma HMAC_SHA256_V1 de Redsys según el estándar oficial.
 * @param secretKeyBase64 Clave secreta en Base64 (de Redsys)
 * @param orderNumber DS_MERCHANT_ORDER
 * @param merchantParams Objeto con los parámetros del comercio
 * @returns Firma en Base64 estándar
 */
export function generateRedsysSignature(secretKeyBase64: string, orderNumber: string, merchantParams: object): string {
  // Paso 1: Decodificar la clave secreta de Base64
  const key = Buffer.from(secretKeyBase64, 'base64');
  
  // Paso 2: Cifrar el número de orden con 3DES ECB
  const cipher = crypto.createCipheriv('des-ede3', key, null);
  cipher.setAutoPadding(true);
  
  // 🔥 CORRECCIÓN: Usar salida binaria directa, NO Base64
  let encrypted = cipher.update(orderNumber, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Paso 3: Usar el resultado cifrado en binario como clave derivada
  const derivedKey = encrypted;
  
  // Paso 4: Convertir parámetros a JSON (mantener orden original) y luego a Base64
  const merchantParametersJson = JSON.stringify(merchantParams);
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
  
  // Paso 5: Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', derivedKey);
  hmac.update(merchantParametersBase64);
  const signature = hmac.digest('base64');
  
  return signature;
}

/**
 * Verifica la firma de Redsys.
 * @param secretKeyBase64 Clave secreta en Base64
 * @param orderNumber DS_MERCHANT_ORDER
 * @param merchantParams Objeto con los parámetros del comercio
 * @param signature Firma recibida (Base64)
 * @returns true si la firma es válida
 */
export function verifyRedsysSignature(secretKeyBase64: string, orderNumber: string, merchantParams: object, signature: string): boolean {
  const expected = generateRedsysSignature(secretKeyBase64, orderNumber, merchantParams);
  return expected === signature;
} 