# 📋 DOCUMENTACIÓN COMPLETA DEL SISTEMA DE PAGOS REDSYS

## **🎯 OBJETIVO DEL SISTEMA**

Nuestro sistema implementa un flujo de **pre-autorización** con Redsys donde:

1. **Cliente** → Hace reserva y autoriza el pago (no se cobra inmediatamente)
2. **Administrador** → Revisa disponibilidad y acepta la reserva
3. **Sistema** → Ejecuta el cobro real al cliente

---

## **🏗️ ARQUITECTURA DEL SISTEMA**

### **Frontend (React + Next.js 14)**
- **Página de reserva**: `/booking/[serviceId]`
- **Formulario de pago**: Integrado en la página de reserva
- **Redirección**: Usa Blob API para forzar navegación real

### **Backend (Next.js API Routes)**
- **Crear reserva**: `/api/reservas/create` → Crea reserva + genera Redsys
- **Notificación**: `/api/redsys/notify` → Recibe IPN de Redsys
- **Respuesta**: `/api/redsys/response` → Maneja retorno del usuario
- **Captura**: `/api/redsys/capture` → Ejecuta cobro real

### **Base de Datos (Supabase)**
- **Tabla `reservations`**: Almacena reservas con estado de pago
- **Tabla `payments`**: Rastrea transacciones de Redsys

---

## **🔐 IMPLEMENTACIÓN DE LA FIRMA HMAC_SHA256_V1**

### **Algoritmo de Firma**

```typescript
// lib/redsys/signature.ts
export function generateRedsysSignature(
  secretKeyBase64: string, 
  orderNumber: string, 
  merchantParams: object
): string {
  // PASO 1: Decodificar clave secreta de Base64
  const key = Buffer.from(secretKeyBase64, 'base64');
  
  // PASO 2: Cifrar orderNumber con 3DES ECB
  const cipher = crypto.createCipheriv('des-ede3', key, null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(orderNumber, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // PASO 3: Usar resultado como clave derivada
  const derivedKey = Buffer.from(encrypted, 'base64');
  
  // PASO 4: Serializar parámetros a JSON y codificar Base64
  const merchantParametersJson = JSON.stringify(merchantParams);
  const merchantParametersBase64 = Buffer.from(merchantParametersJson, 'utf8').toString('base64');
  
  // PASO 5: Calcular HMAC-SHA256
  const hmac = crypto.createHmac('sha256', derivedKey);
  hmac.update(merchantParametersBase64);
  const signature = hmac.digest('base64');
  
  return signature;
}
```

### **Parámetros Obligatorios (Ordenados)**

```typescript
const orderedKeys = [
  'DS_MERCHANT_AMOUNT',      // Monto en centavos (12 dígitos)
  'DS_MERCHANT_ORDER',       // Número de orden (máx 12 chars)
  'DS_MERCHANT_MERCHANTCODE', // Código de comercio
  'DS_MERCHANT_CURRENCY',    // Moneda (978 = EUR)
  'DS_MERCHANT_TRANSACTIONTYPE', // Tipo (1 = pre-autorización)
  'DS_MERCHANT_TERMINAL',    // Terminal
  'DS_MERCHANT_MERCHANTURL', // URL de notificación
  'DS_MERCHANT_URLOK',       // URL de éxito
  'DS_MERCHANT_URLKO'        // URL de error
];
```

---

## **🔄 FLUJO COMPLETO DEL SISTEMA**

### **1. Creación de Reserva y Pre-autorización**

```typescript
// app/api/reservas/create/route.ts
export async function POST(req: NextRequest) {
  // 1. Recibir datos de reserva del frontend
  const { user_id, service_id, total_amount, ... } = await req.json();
  
  // 2. Crear reserva en Supabase
  const { data: reservation } = await supabase
    .from('reservations')
    .insert({ user_id, service_id, total_amount, status: 'pendiente', payment_status: 'pendiente' })
    .select()
    .single();
  
  // 3. Generar parámetros Redsys
  const order = reservation.id.replace(/-/g, '').slice(0, 12);
  const amountCents = Math.round(Number(total_amount) * 100).toString().padStart(12, '0');
  
  const merchantParams = {
    DS_MERCHANT_AMOUNT: amountCents,
    DS_MERCHANT_ORDER: order,
    DS_MERCHANT_MERCHANTCODE: process.env.REDSYS_MERCHANT_CODE!,
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '1', // Pre-autorización
    DS_MERCHANT_TERMINAL: process.env.REDSYS_TERMINAL!,
    DS_MERCHANT_MERCHANTURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/redsys/notify`,
    DS_MERCHANT_URLOK: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado`,
    DS_MERCHANT_URLKO: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/estado`
  };
  
  // 4. Generar firma
  const signature = generateRedsysSignature(
    process.env.REDSYS_SECRET_KEY!, 
    order, 
    merchantParams
  );
  
  // 5. Devolver formulario HTML auto-enviable
  const html = `<!DOCTYPE html>...<form action="${ENVIRONMENT}" method="POST">...</form>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
```

### **2. Frontend - Redirección a Redsys**

```typescript
// app/(main)/booking/[serviceId]/page.tsx
const handleSubmit = async (formData: FormData) => {
  // 1. Enviar datos a la API
  const response = await fetch('/api/reservas/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  });
  
  // 2. Recibir HTML de Redsys
  const html = await response.text();
  
  // 3. Crear Blob y redirigir (fuerza navegación real)
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.location.href = url;
};
```

### **3. Notificación Asíncrona (IPN)**

```typescript
// app/api/redsys/notify/route.ts
export async function POST(req: NextRequest) {
  // 1. Recibir datos de Redsys
  const { Ds_MerchantParameters, Ds_Signature } = await req.formData();
  
  // 2. Decodificar parámetros
  const merchantParams = JSON.parse(
    Buffer.from(Ds_MerchantParameters as string, 'base64').toString('utf8')
  );
  
  // 3. Verificar firma
  const isValid = verifyRedsysSignature(
    process.env.REDSYS_SECRET_KEY!,
    merchantParams.DS_MERCHANT_ORDER,
    merchantParams,
    Ds_Signature as string
  );
  
  // 4. Actualizar estado en Supabase
  if (isValid && merchantParams.DS_RESPONSE === '0000') {
    await supabase
      .from('reservations')
      .update({ payment_status: 'preautorizado' })
      .eq('id', reservationId);
  }
  
  return new NextResponse('OK');
}
```

### **4. Captura del Pago (Admin)**

```typescript
// app/api/redsys/capture/route.ts
export async function POST(req: NextRequest) {
  // 1. Recibir ID de reserva
  const { reservationId } = await req.json();
  
  // 2. Verificar que esté pre-autorizada
  const reservation = await supabase
    .from('reservations')
    .select()
    .eq('id', reservationId)
    .eq('payment_status', 'preautorizado')
    .single();
  
  // 3. Generar parámetros de captura
  const merchantParams = {
    ...baseParams,
    DS_MERCHANT_TRANSACTIONTYPE: '2', // Captura
    DS_MERCHANT_ORDER: reservation.order_number
  };
  
  // 4. Llamar API REST de Redsys
  const response = await fetch(REDSYS_REST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchantParams, signature })
  });
  
  // 5. Actualizar estado
  if (response.ok) {
    await supabase
      .from('reservations')
      .update({ 
        payment_status: 'pagado',
        status: 'confirmado' 
      })
      .eq('id', reservationId);
  }
}
```

---

## **⚙️ CONFIGURACIÓN DE VARIABLES DE ENTORNO**

```bash
# .env.local
REDSYS_MERCHANT_CODE=367529286
REDSYS_TERMINAL=1
REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_ENVIRONMENT=https://sis-t.redsys.es:25443/sis/realizarPago
NEXT_PUBLIC_SITE_URL=https://tenerifeparadisetoursexcursions.com
```

---

## **🔍 DEBUGGING Y LOGS**

### **Logs del Endpoint de Creación**
```typescript
console.log('🔍 REDSYS DEBUG DATOS REALES');
console.log('Reservation ID:', reservation.id);
console.log('order:', order);
console.log('amountCents:', amountCents);
console.log('merchantParams (original):', merchantParams);
console.log('orderedParams (para firma):', orderedParams);
console.log('merchantParametersJson (ordenado):', merchantParametersJson);
console.log('merchantParametersBase64:', merchantParametersBase64);
console.log('signature:', signature);
```

### **Script de Verificación de Firma**
```bash
node scripts/verify-exact-signature.js
```

---

## **🚨 PROBLEMAS CONOCIDOS Y SOLUCIONES**

### **Error SIS0042 - Error en el cálculo de la firma**
- **Causa**: Firma no coincide con lo esperado por Redsys
- **Solución**: Verificar orden de parámetros, codificación, padding

### **Error de Redirección**
- **Causa**: `dangerouslySetInnerHTML` no fuerza navegación real
- **Solución**: Usar Blob API con `window.location.href`

### **Error de Configuración**
- **Causa**: Comercio no configurado correctamente en Redsys
- **Solución**: Contactar con Redsys para verificar configuración

---

## **📊 ESTADOS DEL SISTEMA**

### **Estados de Reserva**
- `pendiente` → Reserva creada, pago pendiente
- `confirmado` → Reserva aceptada por admin
- `cancelado` → Reserva cancelada

### **Estados de Pago**
- `pendiente` → Pago no iniciado
- `preautorizado` → Pago autorizado, no cobrado
- `pagado` → Pago cobrado exitosamente
- `error` → Error en el pago

---

## **🔧 MANTENIMIENTO**

### **Limpieza de Datos**
```bash
# Limpiar reservas canceladas
npm run cleanup-reservations

# Verificar integridad de datos
npm run verify-data
```

### **Monitoreo**
- Logs de transacciones en Supabase
- Auditoría de firmas
- Verificación de URLs de notificación

---

## **📁 ESTRUCTURA DE ARCHIVOS**

```
app/
├── api/
│   ├── reservas/
│   │   └── create/
│   │       └── route.ts          # Crear reserva + generar Redsys
│   └── redsys/
│       ├── notify/
│       │   └── route.ts          # Recibir IPN de Redsys
│       ├── response/
│       │   └── route.ts          # Manejar retorno del usuario
│       └── capture/
│           └── route.ts          # Ejecutar cobro real
├── (main)/
│   └── booking/
│       └── [serviceId]/
│           └── page.tsx          # Página de reserva y pago
└── admin/
    └── dashboard/
        └── page.tsx              # Panel de administración

lib/
└── redsys/
    ├── signature.ts              # Lógica de firma HMAC_SHA256_V1
    └── params.ts                 # Generación de parámetros

components/
└── admin/
    └── reservations-management.tsx # Gestión de reservas en admin

scripts/
├── 31-create-payments-table.sql  # Crear tabla de pagos
└── verify-exact-signature.js     # Verificar firma localmente
```

---

## **🔐 DETALLES TÉCNICOS DE LA FIRMA**

### **Proceso de Generación de Firma**

1. **Clave Secreta**: Decodificar de Base64
2. **Order Number**: Cifrar con 3DES ECB usando la clave secreta
3. **Clave Derivada**: Usar el resultado del cifrado como nueva clave
4. **Parámetros**: Serializar a JSON ordenado y codificar en Base64
5. **HMAC**: Calcular HMAC-SHA256 con la clave derivada
6. **Resultado**: Devolver firma en Base64

### **Ejemplo de Cálculo**

```typescript
// Datos de entrada
const secretKeyBase64 = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
const orderNumber = 'ffd769c9489c';
const merchantParams = {
  DS_MERCHANT_AMOUNT: '000000018000',
  DS_MERCHANT_ORDER: 'ffd769c9489c',
  DS_MERCHANT_MERCHANTCODE: '367529286',
  DS_MERCHANT_CURRENCY: '978',
  DS_MERCHANT_TRANSACTIONTYPE: '1',
  DS_MERCHANT_TERMINAL: '1',
  DS_MERCHANT_MERCHANTURL: 'https://tenerifeparadisetoursexcursions.com/api/redsys/notify',
  DS_MERCHANT_URLOK: 'https://tenerifeparadisetoursexcursions.com/reserva/estado',
  DS_MERCHANT_URLKO: 'https://tenerifeparadisetoursexcursions.com/reserva/estado'
};

// Resultado esperado
const signature = 'UmefBUCXvqePBALXiY4yt8hLPNWR8xTTQ39dMh9LevI=';
```

---

## **🎛️ PANEL DE ADMINISTRACIÓN**

### **Funcionalidades del Admin**

1. **Ver Reservas**: Lista todas las reservas con estado de pago
2. **Autorizar Pagos**: Cambiar estado de `preautorizado` a `pagado`
3. **Gestionar Estados**: Aceptar, rechazar o cancelar reservas
4. **Ver Detalles**: Información completa de cada reserva

### **Estados en el Panel**

- **Pendiente**: Reserva creada, pago no iniciado
- **Pre-autorizado**: Pago autorizado por el banco, pendiente de captura
- **Pagado**: Pago cobrado exitosamente
- **Error**: Error en el proceso de pago

---

## **🧪 TESTING Y DESARROLLO**

### **Entorno de Pruebas**

- **URL Redsys**: `https://sis-t.redsys.es:25443/sis/realizarPago`
- **Comercio de Prueba**: `999008881`
- **Terminal**: `001`
- **Clave Secreta**: `sq7HjrUOBfKmC576ILgskD5srU870gJ7`

### **Comandos de Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar firma localmente
node scripts/verify-exact-signature.js

# Limpiar caché
npm run clean

# Verificar configuración
npm run check-config
```

---

## **📈 MONITOREO Y LOGS**

### **Logs Importantes**

1. **Creación de Reserva**: Datos enviados a Redsys
2. **Notificación IPN**: Respuesta de Redsys
3. **Captura de Pago**: Confirmación de cobro
4. **Errores de Firma**: Problemas de validación

### **Métricas a Seguir**

- Tasa de éxito de pre-autorizaciones
- Tiempo de respuesta de Redsys
- Errores de firma (SIS0042)
- Conversión de pre-autorización a pago

---

## **🔒 SEGURIDAD**

### **Medidas Implementadas**

1. **Validación de Firma**: Verificación HMAC-SHA256
2. **Validación de Parámetros**: Schema con Zod
3. **Autenticación**: Supabase Auth
4. **Autorización**: Roles y permisos
5. **Logs de Auditoría**: Rastreo de transacciones

### **Buenas Prácticas**

- Nunca exponer la clave secreta
- Validar todos los inputs
- Registrar todas las transacciones
- Manejar errores de forma segura
- Usar HTTPS en producción

---

## **🚀 DESPLIEGUE**

### **Vercel**

1. **Variables de Entorno**: Configurar en Vercel Dashboard
2. **Dominio**: Configurar `NEXT_PUBLIC_SITE_URL`
3. **Webhooks**: Verificar URLs de notificación
4. **SSL**: Asegurar certificados válidos

### **Verificación Post-Despliegue**

1. **Test de Firma**: Verificar cálculo local vs servidor
2. **Test de Redirección**: Confirmar flujo completo
3. **Test de Notificación**: Verificar IPN
4. **Test de Captura**: Confirmar cobro real

---

Esta documentación proporciona una visión completa de cómo funciona nuestro sistema de pagos Redsys, desde la implementación técnica hasta el flujo de usuario y administración. 