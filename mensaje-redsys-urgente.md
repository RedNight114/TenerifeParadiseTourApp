# 🚨 MENSAJE URGENTE PARA REDSYS

**ASUNTO:** Error SIS0042 - Datos mal interpretados por Redsys

---

## 📋 INFORMACIÓN DEL COMERCIO
- **Comercio:** 367529286
- **Terminal:** 1
- **Entorno:** Pruebas (sis-t.redsys.es)
- **Clave SHA256:** sq7HjrUOBfKmC576ILgskD5srU870gJ7

---

## 🚨 PROBLEMA IDENTIFICADO

**Redsys está interpretando incorrectamente los datos enviados:**

### ❌ DATOS QUE REDSYS ESTÁ MOSTRANDO:
- **IMPORTE:** 0,00 Euros
- **Código Comercio:** (SPAIN)
- **Terminal:** 367529286-1
- **Número pedido:** Vacío

### ✅ DATOS QUE ESTAMOS ENVIANDO:
- **DS_MERCHANT_AMOUNT:** 000000018000 (180.00 EUR)
- **DS_MERCHANT_MERCHANTCODE:** 367529286
- **DS_MERCHANT_TERMINAL:** 1
- **DS_MERCHANT_ORDER:** testreservat

---

## 🔍 EVIDENCIA TÉCNICA

### Parámetros enviados (Base64):
```
eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIwMDAwMDAwMTgwMDAiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjM2NzUyOTI4NiIsIkRTX01FUkNIQU5UX09SREVSIjoidGVzdHJlc2VydmF0IiwiRFNfTUVSQ0hBTlRfVEVSTUlOQUwiOiIxIiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMSJ9
```

### Datos decodificados:
```json
{
  "DS_MERCHANT_AMOUNT": "000000018000",
  "DS_MERCHANT_CURRENCY": "978",
  "DS_MERCHANT_MERCHANTCODE": "367529286",
  "DS_MERCHANT_ORDER": "testreservat",
  "DS_MERCHANT_TERMINAL": "1",
  "DS_MERCHANT_TRANSACTIONTYPE": "1"
}
```

### Firma generada:
```
3lYTwwr9s7/QZy8ZJGLmrGHb9gzWQx8VeKDIH+ak9yU=
```

---

## 🎯 SOLICITUD

**Necesitamos que Redsys verifique:**

1. **¿Está completamente activado el comercio 367529286 en entorno de pruebas?**
2. **¿Está habilitado el terminal 1?**
3. **¿Por qué Redsys está interpretando los datos de forma incorrecta?**
4. **¿Hay alguna configuración específica que debamos verificar?**

---

## 📞 CONTACTO
- **Email:** [TU_EMAIL]
- **Teléfono:** [TU_TELEFONO]
- **Comercio:** 367529286
- **Terminal:** 1

---

**Este problema está bloqueando completamente nuestras pruebas de integración. Necesitamos una solución urgente.**

**Gracias por su atención.** 