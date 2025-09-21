# 🚀 Guía de Configuración de Supabase para Chat Funcional

## ✅ **Chat Híbrido Implementado**

He implementado un sistema de chat **híbrido** que funciona de dos maneras:

1. **Con Supabase configurado**: Usa datos reales de la base de datos
2. **Sin Supabase configurado**: Usa datos mock para desarrollo

## 🔧 **Configuración de Supabase**

### **1. Crear Archivo `.env.local`**

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Next.js Configuration
NEXTAUTH_SECRET=tu-nextauth-secret-aqui
NEXTAUTH_URL=http://localhost:3000
```

### **2. Obtener Credenciales de Supabase**

1. **Ve a [supabase.com](https://supabase.com)**
2. **Crea un nuevo proyecto** o usa uno existente
3. **Ve a Settings > API**
4. **Copia las credenciales**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### **3. Configurar Base de Datos**

Ejecuta estas consultas SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla de conversaciones
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  admin_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de mensajes
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de participantes
CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_typing BOOLEAN DEFAULT FALSE,
  typing_since TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear vistas para facilitar consultas
CREATE VIEW conversation_summary AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.user_id,
  c.admin_id,
  c.status,
  c.priority,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  p.full_name as user_full_name,
  p.email as user_email,
  COUNT(m.id) as unread_count
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
LEFT JOIN messages m ON c.id = m.conversation_id AND m.sender_id != c.user_id
WHERE c.status = 'active'
GROUP BY c.id, c.title, c.description, c.user_id, c.admin_id, c.status, c.priority, c.created_at, c.updated_at, c.last_message_at, p.full_name, p.email;

CREATE VIEW message_summary AS
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.content,
  m.message_type,
  m.metadata,
  m.created_at,
  p.full_name as sender_full_name,
  p.email as sender_email
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id;

-- Habilitar RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id);

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid() OR admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Insertar datos de prueba
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('user-123', 'usuario@ejemplo.com', 'Usuario de Prueba', 'user'),
  ('admin-456', 'admin@tenerifeparadise.com', 'Soporte Tenerife Paradise Tour', 'admin');

INSERT INTO conversations (id, title, description, user_id, admin_id, status) VALUES
  ('conv-1', 'Nueva consulta', 'Consulta sobre tours disponibles', 'user-123', 'admin-456', 'active'),
  ('conv-2', 'Consulta sobre reservas', 'Información sobre disponibilidad', 'user-123', 'admin-456', 'active');

INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
  ('conv-1', 'user-123', 'client'),
  ('conv-1', 'admin-456', 'admin'),
  ('conv-2', 'user-123', 'client'),
  ('conv-2', 'admin-456', 'admin');

INSERT INTO messages (conversation_id, sender_id, content) VALUES
  ('conv-1', 'user-123', 'Hola, tengo una consulta sobre los tours disponibles'),
  ('conv-1', 'admin-456', '¡Hola! Estaré encantado de ayudarte con información sobre nuestros tours. ¿Qué tipo de experiencia estás buscando?'),
  ('conv-1', 'user-123', 'Me interesan los tours de senderismo y los paseos en barco'),
  ('conv-2', 'user-123', '¿Cuáles son los horarios disponibles para las reservas?'),
  ('conv-2', 'admin-456', 'Los horarios disponibles son de 9:00 a 18:00 todos los días. ¿Qué fecha te interesa?');
```

## 🎯 **Funcionalidades del Chat**

### **Con Supabase Configurado:**
- ✅ **Datos reales** de la base de datos
- ✅ **Autenticación** completa
- ✅ **Suscripciones en tiempo real** para mensajes
- ✅ **Persistencia** de conversaciones y mensajes
- ✅ **Múltiples usuarios** y administradores
- ✅ **Estados de lectura** y typing indicators

### **Sin Supabase (Modo Desarrollo):**
- ✅ **Datos mock** para desarrollo
- ✅ **Funcionalidad completa** del chat
- ✅ **Interfaz idéntica** a la versión real
- ✅ **Logging detallado** para debugging
- ✅ **Sin dependencias** externas

## 🔍 **Verificación**

### **Para Probar con Supabase:**
1. **Configura `.env.local`** con tus credenciales
2. **Ejecuta las consultas SQL** en Supabase
3. **Reinicia el servidor** (`npm run dev`)
4. **Accede a `/chat`** - Debe usar datos reales
5. **Revisa consola** - Debe mostrar "Supabase client obtained successfully"

### **Para Probar sin Supabase:**
1. **Sin archivo `.env.local`** o con credenciales inválidas
2. **Accede a `/chat`** - Debe usar datos mock
3. **Revisa consola** - Debe mostrar "Supabase not configured, using mock data"

## 🚀 **Beneficios**

### **Desarrollo Flexible:**
- **Funciona inmediatamente** sin configuración
- **Fácil transición** a datos reales
- **Mismo código** para ambos modos
- **Debugging eficiente** con logging detallado

### **Producción Robusta:**
- **Datos reales** cuando está configurado
- **Persistencia completa** de conversaciones
- **Tiempo real** para mensajes
- **Escalabilidad** con Supabase

## ✅ **Conclusión**

El chat ahora es **completamente funcional** en ambos modos:

1. **Modo Desarrollo**: Usa datos mock, funciona inmediatamente
2. **Modo Producción**: Usa Supabase real, completamente funcional

Solo necesitas configurar Supabase cuando quieras datos reales y persistencia completa.


