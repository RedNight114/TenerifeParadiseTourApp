# 🚀 INSTRUCCIONES PARA IMPLEMENTAR EL SISTEMA DE RANGOS DE EDAD

## 📋 PASOS A SEGUIR

### 1️⃣ EJECUTAR EL SCRIPT SQL EN SUPABASE

**IMPORTANTE**: Debes ejecutar este script en el **SQL Editor de Supabase**, NO en tu terminal local.

1. Ve a tu proyecto de Supabase
2. Haz clic en "SQL Editor" en el menú lateral
3. Crea un nuevo query
4. Copia y pega el contenido del archivo `scripts/implement-functions-only.sql`
5. Haz clic en "Run" para ejecutar el script

**El script creará:**
- ✅ Función `upsert_service_age_ranges`
- ✅ Función `get_service_age_ranges`
- ✅ Trigger `update_service_age_ranges_trigger`
- ✅ Función `update_updated_at_column`
- ✅ Trigger `set_age_price_ranges_updated_at`

### 2️⃣ VERIFICAR LA IMPLEMENTACIÓN

Después de ejecutar el script SQL, ejecuta este comando en tu terminal:

```bash
node scripts/test-correct-service-insert.js
```

**Este script verificará:**
- ✅ Que las funciones SQL estén disponibles
- ✅ Que se pueda insertar un servicio con rangos de edad
- ✅ Que los rangos se guarden en la tabla `age_price_ranges`
- ✅ Que la función `get_service_age_ranges` funcione

### 3️⃣ PROBAR EL FRONTEND

Una vez que la verificación sea exitosa:

1. Ve a tu aplicación
2. Intenta crear o editar un servicio
3. Configura rangos de edad en el formulario
4. Guarda el servicio

**Deberías ver:**
- ✅ El formulario se guarda sin errores
- ✅ Los rangos de edad se configuran correctamente
- ✅ No aparece el error "Función no disponible en versión de debug"

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Si las funciones SQL no están disponibles:
- Verifica que ejecutaste el script SQL en Supabase
- Asegúrate de que no haya errores en la consola de Supabase
- Ejecuta el script nuevamente

### ❌ Si hay errores de columnas:
- La tabla `services` ya tiene la columna `age_ranges`
- La tabla `age_price_ranges` ya existe
- No necesitas crear tablas adicionales

### ❌ Si el trigger no funciona:
- Verifica que el trigger `update_service_age_ranges_trigger` esté creado
- Asegúrate de que la función `handle_service_age_ranges_update` exista

## 📁 ARCHIVOS IMPORTANTES

- `scripts/implement-functions-only.sql` - Script SQL principal
- `scripts/test-correct-service-insert.js` - Script de verificación
- `components/admin/age-pricing-editor.tsx` - Editor de rangos de edad
- `components/admin/service-form.tsx` - Formulario de servicios

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos, deberías poder:
1. ✅ Crear servicios con rangos de edad personalizados
2. ✅ Editar rangos de edad existentes
3. ✅ Guardar servicios sin errores
4. ✅ Ver los rangos de edad en la base de datos

## 🆘 SI ALGO NO FUNCIONA

1. Ejecuta `node scripts/check-age-pricing-status.js` para diagnosticar
2. Verifica los logs de Supabase para errores SQL
3. Asegúrate de que todas las funciones estén creadas correctamente

---

**¿Necesitas ayuda?** Ejecuta primero el script SQL y luego el script de verificación para identificar exactamente dónde está el problema.
