import crypto from 'crypto';

/**
 * 🔐 SISTEMA DE FIRMA REDSYS HMAC_SHA256_V1 - IMPLEMENTACIÓN COMPLETA
 * 
 * Este módulo implementa el algoritmo de firma oficial de Redsys según la documentación:
 * 1. Decodificar clave secreta de Base64 a Buffer (24 bytes para 3DES)
 * 2. Cifrar DS_MERCHANT_ORDER con 3DES CBC (IV de 8 bytes a cero)
 * 3. Usar resultado como clave derivada para HMAC-SHA256
 * 4. Firmar merchantParameters (JSON → UTF-8 → Base64)
 * 5. Devolver firma en Base64 estándar
 */

interface RedsysSignatureOptions {
  debug?: boolean;
  validateInputs?: boolean;
}

interface RedsysSignatureResult {
  signature: string;
  debug?: {
    secretKeyLength: number;
    orderLength: number;
    derivedKeyLength: number;
    merchantParamsLength: number;
    merchantParamsBase64: string;
    merchantParamsJson: string;
    derivedKeyHex: string;
    derivedKeyBase64: string;
  };
}

/**
 * Valida que la clave secreta sea correcta
 */
function validateSecretKey(secretKeyBase64: string): void {
  if (!secretKeyBase64 || typeof secretKeyBase64 !== 'string') {
    throw new Error('La clave secreta debe ser una cadena no vacía');
  }

  try {
    const key = Buffer.from(secretKeyBase64, 'base64');
    if (key.length !== 24) {
      throw new Error(`Longitud de clave incorrecta: ${key.length} bytes (debe ser 24 bytes para 3DES)`);
    }
  } catch (error) {
    throw new Error(`Error decodificando clave secreta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Valida que el número de orden sea correcto
 */
function validateOrderNumber(orderNumber: string): void {
  if (!orderNumber || typeof orderNumber !== 'string') {
    throw new Error('El número de orden debe ser una cadena no vacía');
  }

  if (orderNumber.length > 12) {
    throw new Error(`Longitud de orden incorrecta: ${orderNumber.length} caracteres (máximo 12)`);
  }

  // Validar que solo contenga caracteres alfanuméricos
  if (!/^[a-zA-Z0-9]+$/.test(orderNumber)) {
    throw new Error('El número de orden solo puede contener caracteres alfanuméricos');
  }
}

/**
 * Valida que los parámetros del comercio sean correctos
 */
function validateMerchantParams(merchantParams: Record<string, string>): void {
  if (!merchantParams || typeof merchantParams !== 'object') {
    throw new Error('Los parámetros del comercio deben ser un objeto');
  }

  const requiredFields = [
    'DS_MERCHANT_AMOUNT',
    'DS_MERCHANT_ORDER',
    'DS_MERCHANT_MERCHANTCODE',
    'DS_MERCHANT_CURRENCY',
    'DS_MERCHANT_TRANSACTIONTYPE',
    'DS_MERCHANT_TERMINAL'
  ];

  for (const field of requiredFields) {
    if (!merchantParams[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }

  // Validar formato del monto (12 dígitos)
  if (!/^\d{12}$/.test(merchantParams.DS_MERCHANT_AMOUNT)) {
    throw new Error(`Formato de monto incorrecto: ${merchantParams.DS_MERCHANT_AMOUNT} (debe ser 12 dígitos)`);
  }

  // Validar longitud del orden
  if (merchantParams.DS_MERCHANT_ORDER.length > 12) {
    throw new Error(`Longitud de orden incorrecta en parámetros: ${merchantParams.DS_MERCHANT_ORDER.length} caracteres`);
  }
}

/**
 * Genera la firma HMAC_SHA256_V1 de Redsys
 */
export function generateRedsysSignatureV2(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>,
  options: RedsysSignatureOptions = {}
): RedsysSignatureResult {
  const { debug = false, validateInputs = true } = options;
  const debugInfo: any = {};

  try {
    // 🔍 PASO 1: VALIDACIÓN DE ENTRADAS
    if (validateInputs) {
      validateSecretKey(secretKeyBase64);
      validateOrderNumber(orderNumber);
      validateMerchantParams(merchantParams);
    }

    // 🔍 PASO 2: DECODIFICAR CLAVE SECRETA
    const secretKey = Buffer.from(secretKeyBase64, 'base64');
    debugInfo.secretKeyLength = secretKey.length;

    if (debug) {
      // PASO 2 - Clave secreta
      // Base64, Longitud y Hex disponibles para debug
    }

    // 🔍 PASO 3: CIFRAR NÚMERO DE ORDEN CON 3DES ECB
    // Para 3DES ECB, no necesitamos IV (modo ECB)
    const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
    cipher.setAutoPadding(true);

    let encryptedOrder = cipher.update(orderNumber, 'utf8');
    encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);

    debugInfo.derivedKeyLength = encryptedOrder.length;
    debugInfo.derivedKeyHex = encryptedOrder.toString('hex');
    debugInfo.derivedKeyBase64 = encryptedOrder.toString('base64');

    if (debug) {
      // PASO 3 - Cifrado 3DES ECB
      // Order original, length, cifrado hex/base64 y longitud disponibles para debug
    }

    // 🔍 PASO 4: ORDENAR PARÁMETROS ALFABÉTICAMENTE (ESTÁNDAR REDSYS)
    const orderedParams = Object.fromEntries(
      Object.entries(merchantParams).sort(([a], [b]) => a.localeCompare(b))
    );

    if (debug) {
      // PASO 4 - Parámetros ordenados alfabéticamente
      // JSON.stringify(orderedParams, null, 2) disponible para debug
    }

    // 🔍 PASO 5: SERIALIZAR A JSON Y CODIFICAR
    const merchantParamsJson = JSON.stringify(orderedParams);
    const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

    debugInfo.merchantParamsLength = merchantParamsJson.length;
    debugInfo.merchantParamsJson = merchantParamsJson;
    debugInfo.merchantParamsBase64 = merchantParamsBase64;

    if (debug) {
      // PASO 5 - Serialización
      // JSON length, JSON y Base64 disponibles para debug
    }

    // 🔍 PASO 6: CALCULAR HMAC-SHA256
    const hmac = crypto.createHmac('sha256', encryptedOrder);
    hmac.update(merchantParamsBase64);
    const signature = hmac.digest('base64');

    if (debug) {
      // PASO 6 - Firma HMAC
      // Clave derivada hex, datos a firmar y firma final disponibles para debug
    }

    return {
      signature,
      debug: debug ? debugInfo : undefined
    };

  } catch (error) {
    // ERROR EN GENERACIÓN DE FIRMA REDSYS
    throw error;
  }
}

/**
 * Verifica la firma de Redsys
 */
export function verifyRedsysSignatureV2(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>,
  signature: string,
  options: RedsysSignatureOptions = {}
): boolean {
  try {
    const result = generateRedsysSignatureV2(secretKeyBase64, orderNumber, merchantParams, options);
    return result.signature === signature;
  } catch (error) {
    // ERROR EN VERIFICACIÓN DE FIRMA
    return false;
  }
}

/**
 * Función de utilidad para generar firma con debugging completo
 */
export function generateRedsysSignatureWithDebug(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>
): RedsysSignatureResult {
  return generateRedsysSignatureV2(secretKeyBase64, orderNumber, merchantParams, { debug: true });
}

/**
 * Función de compatibilidad con la versión anterior
 */
export function generateRedsysSignature(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>
): string {
  const result = generateRedsysSignatureV2(secretKeyBase64, orderNumber, merchantParams);
  return result.signature;
}

/**
 * Función de compatibilidad con la versión anterior
 */
export function verifyRedsysSignature(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>,
  signature: string
): boolean {
  return verifyRedsysSignatureV2(secretKeyBase64, orderNumber, merchantParams, signature);
} 

/**
 * Verifica la firma de Redsys MANTENIENDO ORDEN ORIGINAL
 * Para verificar firmas recibidas de Redsys
 */
export function verifyRedsysSignatureV2Original(
  secretKeyBase64: string,
  orderNumber: string,
  merchantParams: Record<string, string>,
  signature: string,
  options: RedsysSignatureOptions = {}
): boolean {
  try {
    const { debug = false } = options;
    
    // 🔍 PASO 1: VALIDAR ENTRADAS
    if (debug) {
      validateSecretKey(secretKeyBase64);
      validateOrderNumber(orderNumber);
      validateMerchantParams(merchantParams);
    }

    // 🔍 PASO 2: DECODIFICAR CLAVE SECRETA
    const secretKey = Buffer.from(secretKeyBase64, 'base64');

    if (debug) {
      // PASO 2 - Clave secreta
      // Base64, Longitud y Hex disponibles para debug
    }

    // 🔍 PASO 3: CIFRAR NÚMERO DE ORDEN CON 3DES ECB
    const cipher = crypto.createCipheriv('des-ede3', secretKey, null);
    cipher.setAutoPadding(true);

    let encryptedOrder = cipher.update(orderNumber, 'utf8');
    encryptedOrder = Buffer.concat([encryptedOrder, cipher.final()]);

    if (debug) {
      // PASO 3 - Cifrado 3DES ECB
      // Order original, length, cifrado hex/base64 y longitud disponibles para debug
    }

    // 🔍 PASO 4: MANTENER ORDEN ORIGINAL (NO ORDENAR)
    const orderedParams = merchantParams; // Mantener orden original para verificación

    if (debug) {
      // PASO 4 - Parámetros (orden original)
      // JSON.stringify(orderedParams, null, 2) disponible para debug
    }

    // 🔍 PASO 5: SERIALIZAR A JSON Y BASE64 (ORDEN ORIGINAL)
    const merchantParamsJson = JSON.stringify(orderedParams);
    const merchantParamsBase64 = Buffer.from(merchantParamsJson, 'utf8').toString('base64');

    if (debug) {
      // PASO 5 - Serialización (orden original)
      // JSON length, JSON y Base64 disponibles para debug
    }

    // 🔍 PASO 6: CALCULAR HMAC-SHA256
    const hmac = crypto.createHmac('sha256', encryptedOrder);
    hmac.update(merchantParamsBase64);
    const calculatedSignature = hmac.digest('base64');

    if (debug) {
      // PASO 6 - Firma HMAC
      // Clave derivada hex, datos a firmar, firma calculada y recibida disponibles para debug
    }

    return calculatedSignature === signature;
  } catch (error) {
    // ERROR EN VERIFICACIÓN DE FIRMA (ORDEN ORIGINAL)
    return false;
  }
} 