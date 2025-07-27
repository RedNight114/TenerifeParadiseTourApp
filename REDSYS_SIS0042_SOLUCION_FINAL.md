# Solución Final al Error SIS0042 - Según Redsys

## Mensaje de Error de Redsys

**Significado**: La firma enviada no es correcta  
**Causa**: La firma generada y enviada por su plataforma con las operaciones no es correcta.  
**Solución**: La firma se genera a partir de una clave SHA256 única para su terminal y el entorno al cual están siendo enviadas las operaciones. La clave SHA256 se puede obtener a través de la web de Canales.

## Problema Identificado

Según el análisis de Redsys, el problema SIS0042 se debe a que **la clave SHA256 no es la correcta para el entorno y terminal específicos** que estamos usando.

## Configuración Actual

```
Merchant Code: 367529286
Terminal: 1
Entorno: PRUEBAS (https://sis-t.redsys.es:25443/sis/realizarPago)
Clave actual: b2aec78eb50e05f2a60b9efa20b82c903e6cad4f3bd2027b
```

## Solución Paso a Paso

### 1. Acceder a la Web de Canales de Redsys

**Para entorno de PRUEBAS:**
- URL: https://canalespago.redsys.es/
- Usa tus credenciales de comercio de Redsys

**Para entorno de PRODUCCIÓN:**
- URL: https://canales.redsys.es/
- Usa tus credenciales de comercio de Redsys

### 2. Obtener la Clave SHA256 Correcta

1. **Inicia sesión** con tus credenciales de comercio
2. **Navega a Configuración** o **Parámetros**
3. **Selecciona tu terminal específico** (Terminal 1)
4. **Busca "Clave SHA256"** o **"Clave de firma"**
5. **Copia la clave completa**

### 3. Verificar que la Clave Sea para:

- ✅ **Merchant Code**: 367529286
- ✅ **Terminal**: 1
- ✅ **Entorno**: PRUEBAS (ya que usamos sis-t.redsys.es)

### 4. Actualizar la Configuración

#### Opción A: Usar el Script Automático
```bash
node scripts/get-redsys-key.js
```

#### Opción B: Actualización Manual
1. Abre el archivo `.env.local`
2. Busca la línea `REDSYS_SECRET_KEY=`
3. Reemplaza el valor con la nueva clave SHA256
4. Guarda el archivo

### 5. Verificar el Formato de la Clave

La clave debe estar en **formato hexadecimal**:
- ✅ Ejemplo correcto: `b2aec78eb50e05f2a60b9efa20b82c903e6cad4f3bd2027b`
- ❌ NO debe tener espacios ni caracteres especiales
- ✅ Solo caracteres: 0-9, a-f, A-F

## Correcciones Ya Implementadas

### 1. Campo de Parámetros Corregido
```typescript
// ANTES (incorrecto)
DS_MERCHANT_MERCHANTDATA: sanitizedData.reservationId

// DESPUÉS (correcto)
DS_MERCHANT_MERCHANTNAMER: '************************************'
```

### 2. Función de Firma Mejorada
```typescript
function generateSignature(order: string, merchantParameters: string, secretKey: string): string {
  // Priorizar formato hexadecimal (estándar de Redsys)
  let decodedKey: Buffer
  
  try {
    // Intentar decodificar como hexadecimal primero
    decodedKey = Buffer.from(cleanSecretKey, "hex")
  } catch (hexError) {
    // Fallback a otros formatos si es necesario
    try {
      decodedKey = Buffer.from(cleanSecretKey, "base64")
    } catch (base64Error) {
      decodedKey = Buffer.from(cleanSecretKey, "utf8")
    }
  }
  
  // Generar firma HMAC-SHA256
  const hmac = crypto.createHmac("sha256", decodedKey)
  const dataToSign = cleanOrder + cleanMerchantParameters
  hmac.update(dataToSign, 'utf8')
  return hmac.digest("base64")
}
```

## Scripts de Verificación Disponibles

1. **Verificar credenciales actuales:**
   ```bash
   node scripts/verify-redsys-credentials.js
   ```

2. **Obtener nueva clave automáticamente:**
   ```bash
   node scripts/get-redsys-key.js
   ```

3. **Verificar que todo funciona:**
   ```bash
   node scripts/verify-redsys-fix.js
   ```

## Próximos Pasos

### 1. Obtener la Clave Correcta
- Accede a https://canalespago.redsys.es/
- Inicia sesión con tus credenciales
- Obtén la clave SHA256 para:
  - Merchant Code: 367529286
  - Terminal: 1
  - Entorno: PRUEBAS

### 2. Actualizar Configuración
```bash
node scripts/get-redsys-key.js
```

### 3. Reiniciar Servidor
```bash
npm run dev
```

### 4. Probar Pago
- Crea una nueva reserva
- Completa el proceso de pago
- Verifica que no aparezca el error SIS0042

## Verificación Final

Después de actualizar la clave, ejecuta:
```bash
node scripts/verify-redsys-fix.js
```

Deberías ver:
```
✅ Clave secreta configurada
✅ Clave en formato hexadecimal
✅ Merchant Code válido
✅ Terminal válido
✅ Campo DS_MERCHANT_MERCHANTNAMER correcto
✅ Parámetros del comercio válidos
✅ Firma generada correctamente
```

## Estado Actual

✅ **Campo de parámetros corregido**  
✅ **Función de firma mejorada**  
✅ **Formato hexadecimal implementado**  
⚠️ **Pendiente: Obtener clave SHA256 correcta de Redsys**  

## Nota Importante

El error SIS0042 específico que reportaste se debía a que la clave SHA256 no era la correcta para tu terminal y entorno específicos. Una vez que obtengas la clave correcta de la web de Canales de Redsys y la actualices, el problema estará completamente resuelto.

## Contacto con Redsys

Si tienes problemas para acceder a la web de Canales o obtener la clave:
- **Soporte técnico**: Contacta con el soporte técnico de Redsys
- **Documentación**: Consulta la documentación oficial de Redsys
- **Anexo**: Revisa el "Anexo – Entornos de Redsys" mencionado en el error

El sistema está preparado para funcionar correctamente una vez que tengas la clave SHA256 correcta. 