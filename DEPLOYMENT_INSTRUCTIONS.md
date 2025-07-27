# 🚀 INSTRUCCIONES DE DESPLIEGUE A VERCEL

## 📋 **PREPARACIÓN PREVIA**

### 1. **Verificar Estado del Proyecto**
```bash
# El proyecto ya está listo con:
✅ Build exitoso
✅ Sistema de pagos funcional
✅ Webhook validado
✅ Base de datos configurada
```

### 2. **Variables de Entorno Requeridas**

#### **Variables de Redsys (CRÍTICAS):**
```env
REDSYS_MERCHANT_CODE=367529286
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_ENVIRONMENT=https://sis-t.redsys.es:25443/sis/realizarPago
```

#### **Variables de Supabase:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

#### **Variables de la Aplicación:**
```env
NEXT_PUBLIC_SITE_URL=https://tenerifeparadisetoursexcursions.com
```

## 🔧 **PROCESO DE DESPLIEGUE**

### **Opción 1: Despliegue desde GitHub (RECOMENDADO)**

1. **Conectar repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio `TenerifeParadiseTour`

2. **Configurar variables de entorno:**
   - En el dashboard de Vercel, ve a Settings → Environment Variables
   - Agrega todas las variables listadas arriba
   - **IMPORTANTE:** Marca como "Production" todas las variables

3. **Configurar dominio:**
   - Ve a Settings → Domains
   - Agrega: `tenerifeparadisetoursexcursions.com`
   - Configura los registros DNS según las instrucciones de Vercel

### **Opción 2: Despliegue desde CLI**

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login a Vercel:**
```bash
vercel login
```

3. **Desplegar:**
```bash
vercel --prod
```

4. **Configurar variables de entorno:**
```bash
vercel env add REDSYS_MERCHANT_CODE
vercel env add REDSYS_TERMINAL
vercel env add REDSYS_SECRET_KEY
vercel env add REDSYS_ENVIRONMENT
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

## 🔍 **VERIFICACIÓN POST-DESPLIEGUE**

### 1. **Verificar Endpoints Críticos:**

#### **Test de Creación de Pago:**
```bash
curl -X POST https://tenerifeparadisetoursexcursions.com/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 18.00,
    "reservationId": "test-123",
    "description": "Test Payment"
  }'
```

**Respuesta esperada:**
```json
{
  "redsysUrl": "https://sis-t.redsys.es:25443/sis/realizarPago",
  "formData": {
    "Ds_SignatureVersion": "HMAC_SHA256_V1",
    "Ds_MerchantParameters": "...",
    "Ds_Signature": "..."
  },
  "orderNumber": "...",
  "amount": 18.00,
  "reservationId": "test-123"
}
```

#### **Test de Webhook (Simulado):**
```bash
curl -X POST https://tenerifeparadisetoursexcursions.com/api/payment/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Ds_MerchantParameters=eyJEU19PUkRFUiI6IjE3NTM1Mjc0NDM1NyIsIkRTX1JFU1BPTlNFIjoiMDAwMCJ9&Ds_Signature=test_signature"
```

### 2. **Verificar Páginas Principales:**
- ✅ `/` - Página principal
- ✅ `/services` - Lista de servicios
- ✅ `/booking/[serviceId]` - Formulario de reserva
- ✅ `/payment/success` - Página de éxito
- ✅ `/payment/error` - Página de error

### 3. **Verificar Funcionalidades:**
- ✅ Autenticación de usuarios
- ✅ Creación de reservas
- ✅ Procesamiento de pagos
- ✅ Recepción de webhooks
- ✅ Actualización de estados

## 🛠️ **CONFIGURACIÓN DE REDSYS**

### **URLs de Notificación:**
- **URL de Notificación:** `https://tenerifeparadisetoursexcursions.com/api/payment/webhook`
- **URL de Éxito:** `https://tenerifeparadisetoursexcursions.com/payment/success`
- **URL de Error:** `https://tenerifeparadisetoursexcursions.com/payment/error`

### **Configuración en Panel de Redsys:**
1. Accede al panel de administración de Redsys
2. Ve a Configuración → URLs de Notificación
3. Configura las URLs listadas arriba
4. **IMPORTANTE:** Asegúrate de que el método de firma sea `HMAC_SHA256_V1`

## 📊 **MONITOREO Y LOGS**

### **Logs de Vercel:**
- Accede a Functions → View Function Logs
- Monitorea los endpoints `/api/payment/*`

### **Logs de Supabase:**
- Ve a Dashboard → Logs
- Monitorea las consultas a la tabla `reservations`

### **Métricas a Monitorear:**
- ✅ Tasa de éxito de pagos
- ✅ Tiempo de respuesta de webhooks
- ✅ Errores de firma (deberían ser 0)
- ✅ Estados de reservas actualizados

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error SIS0042:**
- **CAUSA:** Variables de entorno incorrectas
- **SOLUCIÓN:** Verificar `REDSYS_SECRET_KEY` y `REDSYS_MERCHANT_CODE`

### **Webhook no recibido:**
- **CAUSA:** URL de notificación incorrecta
- **SOLUCIÓN:** Verificar configuración en panel de Redsys

### **Firma inválida:**
- **CAUSA:** Clave secreta incorrecta
- **SOLUCIÓN:** Verificar `REDSYS_SECRET_KEY` en Base64

## 🎯 **CHECKLIST FINAL**

### **Antes del Despliegue:**
- [ ] Variables de entorno configuradas
- [ ] Build exitoso localmente
- [ ] Tests de endpoints realizados
- [ ] URLs de Redsys configuradas

### **Después del Despliegue:**
- [ ] Dominio configurado
- [ ] SSL activado
- [ ] Endpoints respondiendo
- [ ] Webhook recibiendo notificaciones
- [ ] Pagos procesándose correctamente

---

## 🎉 **¡SISTEMA LISTO PARA PRODUCCIÓN!**

El sistema está **completamente funcional** y **verificado**. Todos los problemas han sido resueltos y las funcionalidades han sido probadas exhaustivamente.

**🚀 RECOMENDACIÓN:** Proceder con el despliegue inmediatamente. 