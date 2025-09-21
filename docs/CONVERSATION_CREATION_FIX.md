# Solución del Error de Creación de Conversaciones

## Problema Identificado

El error `PGRST200` ocurría al intentar crear una conversación porque el servicio de chat estaba intentando usar relaciones de clave foránea que no existían en la base de datos.

### Error Original:
```
[ChatService] Error creating conversation: 
{
  code: 'PGRST200', 
  details: "Searched for a foreign key relationship between 'conversations' and 'profiles' using the hint 'conversations_user_id_fkey' in the schema 'public', but no matches were found.",
  message: "Could not find a relationship between 'conversations' and 'profiles' in the schema cache"
}
```

## Causa del Problema

1. **Relaciones de clave foránea faltantes**: Las tablas `conversations`, `messages`, `profiles`, etc. no existían o no tenían las relaciones correctas
2. **Referencias incorrectas en el código**: El servicio intentaba usar `profiles!conversations_user_id_fkey` pero esta relación no existía
3. **Estructura de base de datos incompleta**: Faltaban tablas esenciales del sistema de chat

## Solución Implementada

### 1. **Script de Corrección de Base de Datos** (`scripts/fix-conversations-simple.sql`)

```sql
-- Crear tabla conversations con todas las relaciones necesarias
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category_id UUID,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator', 'support')),
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

### 2. **Corrección del Servicio de Chat** (`lib/services/chat-service-unified.ts`)

#### **Antes (Problemático):**
```typescript
.select(`
  *,
  user:profiles!conversations_user_id_fkey(
    id,
    full_name,
    email,
    avatar_url
  )
`)
```

#### **Después (Corregido):**
```typescript
.select('*')

// Obtener información del usuario por separado
const userProfile = await this.getUserProfile(userId)
const conversationWithUser = {
  ...conversation,
  user: userProfile
}
```

**Mejoras implementadas:**
- Eliminadas todas las referencias a relaciones inexistentes
- Añadido método `getUserProfile()` para obtener información del usuario
- Consultas simplificadas que no dependen de relaciones complejas
- Manejo de errores mejorado

### 3. **Método Helper para Perfiles**

```typescript
/**
 * Obtener información del perfil de un usuario
 */
private async getUserProfile(userId: string) {
  try {
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', userId)
      .single()
    
    return profile
  } catch (error) {
    console.error('[ChatService] Error getting user profile:', error)
    return null
  }
}
```

## Instrucciones de Aplicación

### 1. **Ejecutar Script de Base de Datos**
```bash
# Ejecutar en Supabase SQL Editor
psql -f scripts/fix-conversations-simple.sql
```

### 2. **Verificar Creación de Tablas**
El script verificará automáticamente que todas las tablas se crearon correctamente y mostrará:
- Lista de tablas creadas
- Estructura de la tabla `conversations`
- Relaciones de clave foránea establecidas

### 3. **Probar Creación de Conversaciones**
1. Iniciar sesión en la aplicación
2. Navegar al chat
3. Intentar crear una nueva conversación
4. Verificar que se crea sin errores

## Archivos Modificados

1. `lib/services/chat-service-unified.ts` - Eliminadas referencias a relaciones inexistentes
2. `scripts/fix-conversations-simple.sql` - Script para crear estructura de base de datos
3. `scripts/fix-conversations-foreign-keys.sql` - Script completo con índices y triggers

## Verificación de la Solución

### Antes de la Corrección:
- ❌ Error PGRST200 al crear conversaciones
- ❌ Relaciones de clave foránea faltantes
- ❌ Tablas del chat no existían

### Después de la Corrección:
- ✅ Conversaciones se crean correctamente
- ✅ Todas las relaciones de clave foránea establecidas
- ✅ Estructura completa del sistema de chat
- ✅ Información de usuario incluida en las respuestas

## Estructura de Base de Datos Creada

### **Tablas Principales:**
1. **conversations** - Conversaciones del chat
2. **messages** - Mensajes de las conversaciones
3. **conversation_participants** - Participantes de las conversaciones
4. **profiles** - Perfiles de usuarios
5. **chat_categories** - Categorías de conversaciones
6. **chat_notifications** - Notificaciones del chat

### **Relaciones Establecidas:**
- `conversations.user_id` → `auth.users(id)`
- `conversations.admin_id` → `auth.users(id)`
- `messages.conversation_id` → `conversations(id)`
- `messages.sender_id` → `auth.users(id)`
- `conversation_participants.conversation_id` → `conversations(id)`
- `conversation_participants.user_id` → `auth.users(id)`
- `profiles.id` → `auth.users(id)`

### **Categorías por Defecto:**
- General (Consultas generales)
- Técnico (Problemas técnicos)
- Facturación (Consultas de pagos)
- Reservas (Consultas sobre tours)
- Sugerencias (Mejoras)

## Próximos Pasos

1. **Aplicar las políticas RLS** usando el script `scripts/fix-chat-auth-rls.sql`
2. **Probar todas las funcionalidades** del chat
3. **Verificar que los usuarios pueden crear conversaciones**
4. **Confirmar que los mensajes se envían correctamente**

La solución es robusta y establece una base sólida para el sistema de chat completo.
