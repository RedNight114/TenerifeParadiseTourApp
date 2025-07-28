require('dotenv').config({path: '.env.local'});

console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO');
console.log('=======================================');
console.log('REDSYS_MERCHANT_CODE:', process.env.REDSYS_MERCHANT_CODE || 'NO DEFINIDA');
console.log('REDSYS_TERMINAL:', process.env.REDSYS_TERMINAL || 'NO DEFINIDA');
console.log('REDSYS_SECRET_KEY:', process.env.REDSYS_SECRET_KEY || 'NO DEFINIDA');
console.log('REDSYS_ENVIRONMENT:', process.env.REDSYS_ENVIRONMENT || 'NO DEFINIDA');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NO DEFINIDA');

if (process.env.REDSYS_SECRET_KEY === 'sq7HjrUOBfKmC576ILgskD5srU870gJ7') {
  console.log('\n✅ CLAVE CORRECTA DETECTADA');
} else {
  console.log('\n❌ CLAVE INCORRECTA O NO DEFINIDA');
} 