# 🚨 SOLUCIÓN ERROR: Columna 'status' faltante en conversation_participants

## 📋 **Descripción del Problema**

**Error**: `Could not find the 'status' column of 'conversation_participants' in the schema cache`

**Ubicación**: Función `createConversation` en `lib/chat-service.ts` línea 222

**Causa**: Supabase está buscando una columna llamada 'status' en la tabla `conversation_participants`, pero esta columna **NO EXISTE** en la estructura correcta de la tabla.

## 🔍 **Análisis del Problema**

### **Estructura Correcta de conversation_participants:**
```sql
CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator', 'support')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  is_typing BOOLEAN DEFAULT FALSE,
  typing_since TIMESTAMP WITH TIME ZONE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  UNIQUE(conversation_id, user_id)
);
```

### **Estructura Correcta de conversations:**
```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Nueva conversación',
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed', 'archived')),
  -- ... otros campos
);
```

**Nota**: La columna `status` está en la tabla `conversations`, NO en `conversation_participants`.

## 🛠️ **Soluciones Disponibles**

### **Opción 1: Script de Diagnóstico (Recomendado)**
Ejecutar en Supabase SQL Editor:
```sql
-- Archivo: database/diagnose-chat-error.sql
-- Este script identificará exactamente dónde está el problema
```

### **Opción 2: Script de Corrección Automática**
Ejecutar en Supabase SQL Editor:
```sql
-- Archivo: database/fix-conversation-participants-structure.sql
-- Este script corregirá la estructura de la tabla automáticamente
```

### **Opción 3: Verificación Manual**
Ejecutar en Supabase SQL Editor:
```sql
-- Archivo: database/verify-table-structure.sql
-- Este script verificará la estructura actual de todas las tablas
```

## 📝 **Pasos para Resolver el Problema**

### **Paso 1: Ejecutar Diagnóstico**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar y pegar el contenido de `database/diagnose-chat-error.sql`
3. Ejecutar el script
4. Revisar los resultados para identificar el problema exacto

### **Paso 2: Aplicar Corrección**
1. Basándose en el diagnóstico, ejecutar el script de corrección apropiado
2. Si hay una columna 'status' incorrecta, eliminarla
3. Si hay vistas o triggers problemáticos, eliminarlos
4. Verificar que la estructura de la tabla sea correcta

### **Paso 3: Verificar Solución**
1. Ejecutar el script de verificación
2. Confirmar que la tabla tiene la estructura correcta
3. Probar la funcionalidad del chat

## 🔧 **Posibles Causas del Problema**

1. **Columna incorrecta**: Alguien agregó una columna 'status' a `conversation_participants`
2. **Vista problemática**: Existe una vista que incluye la columna 'status'
3. **Trigger problemático**: Un trigger está intentando acceder a la columna 'status'
4. **Caché de Supabase**: El esquema en caché está desactualizado
5. **Script de migración**: Un script anterior modificó incorrectamente la tabla

## ✅ **Verificación de la Solución**

Después de aplicar la corrección, la tabla debe tener esta estructura:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| conversation_id | UUID | Referencia a la conversación |
| user_id | UUID | Referencia al usuario |
| role | TEXT | Rol del participante |
| joined_at | TIMESTAMP | Fecha de unión |
| left_at | TIMESTAMP | Fecha de salida (opcional) |
| last_read_at | TIMESTAMP | Última lectura |
| is_online | BOOLEAN | Estado online |
| is_typing | BOOLEAN | Estado de escritura |
| typing_since | TIMESTAMP | Inicio de escritura |
| notification_preferences | JSONB | Preferencias de notificación |

## 🚨 **Solución de Emergencia (Temporal)**

Si necesitas una solución inmediata mientras investigas:

```sql
-- SOLO PARA DESARROLLO - Permitir todo en conversation_participants
CREATE POLICY "emergency_allow_all" ON conversation_participants
  FOR ALL USING (true);
```

## 📞 **Soporte Adicional**

Si el problema persiste después de aplicar estas soluciones:

1. **Verificar logs de Supabase** para errores adicionales
2. **Revisar el esquema de caché** de Supabase
3. **Verificar que no hay migraciones pendientes**
4. **Comprobar que las políticas RLS están correctas**

## 🎯 **Estado Esperado Después de la Solución**

- ✅ Tabla `conversation_participants` tiene la estructura correcta
- ✅ No hay referencias a la columna 'status' incorrecta
- ✅ Las políticas RLS están configuradas correctamente
- ✅ El chat funciona sin errores de columna faltante
- ✅ Se pueden crear conversaciones y agregar participantes

---

**Nota**: Este error es común cuando se mezclan scripts de migración o cuando se modifica manualmente la estructura de la base de datos. La solución asegura que la tabla tenga la estructura correcta según el diseño del sistema de chat.

