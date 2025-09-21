-- Script para insertar mensajes de prueba con diferentes roles
-- Ejecutar en Supabase SQL Editor para crear mensajes de prueba

-- =====================================================
-- PASO 1: VERIFICAR USUARIOS DISPONIBLES
-- =====================================================

-- Ver usuarios disponibles para crear mensajes de prueba
SELECT 
  id,
  email,
  full_name,
  role
FROM profiles
ORDER BY role;

-- =====================================================
-- PASO 2: OBTENER UNA CONVERSACIÓN DE PRUEBA
-- =====================================================

-- Seleccionar una conversación para agregar mensajes de prueba
SELECT 
  id,
  title,
  user_id,
  admin_id,
  status
FROM conversations
WHERE status = 'active'
LIMIT 1;

-- =====================================================
-- PASO 3: INSERTAR MENSAJES DE PRUEBA
-- =====================================================

-- NOTA: Reemplazar los UUIDs con IDs reales de la consulta anterior

-- Insertar mensaje de usuario (si tienes un usuario con role = 'user')
/*
INSERT INTO messages (conversation_id, sender_id, content, message_type)
SELECT 
  c.id,
  p.id,
  '¡Hola! Necesito ayuda con mi reserva.',
  'text'
FROM conversations c
CROSS JOIN profiles p
WHERE c.status = 'active' 
  AND p.role = 'user'
LIMIT 1;
*/

-- Insertar mensaje de administrador (si tienes un admin con role = 'admin')
/*
INSERT INTO messages (conversation_id, sender_id, content, message_type)
SELECT 
  c.id,
  p.id,
  'Hola! Soy un administrador. ¿En qué puedo ayudarte?',
  'text'
FROM conversations c
CROSS JOIN profiles p
WHERE c.status = 'active' 
  AND p.role = 'admin'
LIMIT 1;
*/

-- =====================================================
-- PASO 4: INSERTAR MENSAJES CON ROLES ESPECÍFICOS
-- =====================================================

-- Crear mensajes de prueba con roles específicos
DO $$
DECLARE
    conv_id UUID;
    user_id UUID;
    admin_id UUID;
BEGIN
    -- Obtener una conversación activa
    SELECT id INTO conv_id FROM conversations WHERE status = 'active' LIMIT 1;
    
    -- Obtener un usuario
    SELECT id INTO user_id FROM profiles WHERE role = 'user' LIMIT 1;
    
    -- Obtener un admin
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- Si tenemos todos los IDs necesarios, insertar mensajes
    IF conv_id IS NOT NULL AND user_id IS NOT NULL THEN
        -- Mensaje del usuario
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        VALUES (conv_id, user_id, '¡Hola! Necesito ayuda con mi reserva. ¿Pueden ayudarme?', 'text');
        
        RAISE NOTICE 'Mensaje de usuario insertado';
    END IF;
    
    IF conv_id IS NOT NULL AND admin_id IS NOT NULL THEN
        -- Mensaje del admin
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        VALUES (conv_id, admin_id, '¡Hola! Soy un administrador. ¿En qué puedo ayudarte?', 'text');
        
        RAISE NOTICE 'Mensaje de admin insertado';
    END IF;
    
    IF conv_id IS NULL THEN
        RAISE NOTICE 'No se encontró conversación activa';
    END IF;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No se encontró usuario con role = user';
    END IF;
    
    IF admin_id IS NULL THEN
        RAISE NOTICE 'No se encontró usuario con role = admin';
    END IF;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR MENSAJES INSERTADOS
-- =====================================================

-- Ver los mensajes recién insertados
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.created_at,
  p.full_name as sender_full_name,
  p.email as sender_email,
  p.role as sender_profile_role
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.created_at >= NOW() - INTERVAL '1 minute'
ORDER BY m.created_at DESC;

-- =====================================================
-- PASO 6: VERIFICAR QUE LOS ROLES SE ASIGNARON CORRECTAMENTE
-- =====================================================

-- Verificar que el trigger asignó los sender_role correctamente
SELECT 
  m.id,
  m.sender_role,
  m.content,
  p.role as profile_role,
  CASE 
    WHEN m.sender_role = p.role THEN '✅ Correcto'
    ELSE '❌ Error'
  END as estado_rol
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.created_at >= NOW() - INTERVAL '1 minute'
ORDER BY m.created_at DESC;

-- =====================================================
-- PASO 7: CREAR USUARIOS DE PRUEBA SI NO EXISTEN
-- =====================================================

-- Verificar si necesitamos crear usuarios de prueba
SELECT 
  role,
  COUNT(*) as cantidad
FROM profiles
GROUP BY role
ORDER BY role;

-- Si no hay usuarios con role = 'user' o 'admin', crear algunos de prueba
-- (Esto solo es para desarrollo/testing)
/*
INSERT INTO profiles (id, email, full_name, role)
VALUES 
  (gen_random_uuid(), 'usuario@test.com', 'Usuario Prueba', 'user'),
  (gen_random_uuid(), 'admin@test.com', 'Admin Prueba', 'admin')
ON CONFLICT (email) DO NOTHING;
*/

-- =====================================================
-- PASO 8: RESUMEN FINAL
-- =====================================================

SELECT 
  'MENSAJES DE PRUEBA INSERTADOS' as status,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'user') as mensajes_usuario,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'admin') as mensajes_admin,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'moderator') as mensajes_moderator,
  'Ahora prueba el dashboard para ver la diferenciación' as siguiente_paso;
