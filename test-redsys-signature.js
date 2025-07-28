const crypto = require('crypto');

// DATOS
const secretKeyBase64 = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const order = 'e5e0cc38c984';
const merchantParams = {
  DS_MERCHANT_AMOUNT: '000000018000',
  DS_MERCHANT_ORDER: 'e5e0cc38c984',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: '1',
  DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/redsys/notify',
  DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/reserva/estado',
  DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/reserva/estado'
};

// 1. Decodificar la clave secreta de Base64
const key = Buffer.from(secretKeyBase64, 'base64');

// 2. Cifrar el orderNumber con 3DES ECB (sin IV, padding PKCS7)
const cipher = crypto.createCipheriv('des-ede3', key, null);
cipher.setAutoPadding(true);
let encrypted = cipher.update(order, 'utf8', 'base64');
encrypted += cipher.final('base64');
const derivedKey = Buffer.from(encrypted, 'base64');

// 3. Serializar merchantParams a JSON y codificar en Base64
const merchantParametersJson = JSON.stringify(merchantParams);
const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');

// 4. Firmar merchantParametersBase64 con HMAC-SHA256 usando la clave derivada
const hmac = crypto.createHmac('sha256', derivedKey);
hmac.update(merchantParametersBase64);
const signature = hmac.digest('base64');

console.log('merchantParametersJson:', merchantParametersJson);
console.log('merchantParametersBase64:', merchantParametersBase64);
console.log('signature:', signature);