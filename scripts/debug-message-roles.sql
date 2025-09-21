-- Script para debuggear los roles de los mensajes
-- Ejecutar en Supabase SQL Editor para verificar el sender_role

-- =====================================================
-- PASO 1: VERIFICAR MENSAJES Y SUS ROLES
-- =====================================================

-- Ver todos los mensajes con su sender_role
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
ORDER BY m.created_at DESC
LIMIT 20;

-- =====================================================
-- PASO 2: VERIFICAR MENSAJES SIN sender_role
-- =====================================================

-- Buscar mensajes que no tengan sender_role definido
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.created_at,
  p.role as sender_profile_role
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.sender_role IS NULL
ORDER BY m.created_at DESC;

-- =====================================================
-- PASO 3: VERIFICAR MENSAJES POR CONVERSACIÓN ESPECÍFICA
-- =====================================================

-- Ver mensajes de una conversación específica (reemplazar con ID real)
WITH sample_conversation AS (
  SELECT id FROM conversations WHERE status = 'active' LIMIT 1
)
SELECT 
  m.id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.created_at,
  p.full_name as sender_full_name,
  p.email as sender_email,
  p.role as sender_profile_role,
  CASE 
    WHEN m.sender_role = 'admin' OR m.sender_role = 'moderator' THEN 'Admin (Izquierda - Gris)'
    WHEN m.sender_role = 'user' THEN 'Usuario (Derecha - Azul)'
    ELSE 'Sin rol definido'
  END as estilo_esperado
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.conversation_id IN (SELECT id FROM sample_conversation)
ORDER BY m.created_at ASC;

-- =====================================================
-- PASO 4: VERIFICAR QUE EL TRIGGER ESTÁ FUNCIONANDO
-- =====================================================

-- Verificar mensajes recientes para ver si el trigger está asignando sender_role
SELECT 
  m.id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.created_at,
  p.role as profile_role,
  CASE 
    WHEN m.sender_role = p.role THEN '✅ Correcto'
    WHEN m.sender_role IS NULL THEN '❌ Sin sender_role'
    ELSE '⚠️ Inconsistente'
  END as estado_trigger
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.created_at >= NOW() - INTERVAL '1 day'
ORDER BY m.created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 5: VERIFICAR USUARIOS Y SUS ROLES
-- =====================================================

-- Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY role, created_at DESC;

-- =====================================================
-- PASO 6: VERIFICAR CONVERSACIONES CON MENSAJES MIXTOS
-- =====================================================

-- Buscar conversaciones que tengan mensajes de diferentes roles
SELECT 
  c.id as conversation_id,
  c.title,
  c.user_id,
  c.admin_id,
  COUNT(DISTINCT m.sender_role) as roles_diferentes,
  ARRAY_AGG(DISTINCT m.sender_role) as roles_presentes,
  COUNT(m.id) as total_mensajes
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
WHERE m.sender_role IS NOT NULL
GROUP BY c.id, c.title, c.user_id, c.admin_id
HAVING COUNT(DISTINCT m.sender_role) > 1
ORDER BY c.created_at DESC;

-- =====================================================
-- PASO 7: FORZAR ACTUALIZACIÓN DE sender_role
-- =====================================================

-- Actualizar mensajes que no tengan sender_role o tengan un valor incorrecto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL 
   OR sender_role != get_user_role(sender_id);

-- Verificar el resultado
SELECT 
  'Mensajes actualizados' as status,
  COUNT(*) as total_mensajes
FROM messages
WHERE sender_role IS NOT NULL;

-- =====================================================
-- PASO 8: VERIFICAR FUNCIÓN get_user_role
-- =====================================================

-- Probar la función get_user_role con algunos usuarios
SELECT 
  p.id,
  p.email,
  p.role as profile_role,
  get_user_role(p.id) as function_result,
  CASE 
    WHEN p.role = get_user_role(p.id) THEN '✅ Correcto'
    ELSE '❌ Error'
  END as estado_funcion
FROM profiles p
ORDER BY p.role, p.created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 9: RESUMEN DE DEBUG
-- =====================================================

SELECT 
  'DEBUG COMPLETADO' as status,
  (SELECT COUNT(*) FROM messages WHERE sender_role IS NULL) as mensajes_sin_rol,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'admin') as mensajes_admin,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'user') as mensajes_usuario,
  (SELECT COUNT(*) FROM messages WHERE sender_role = 'moderator') as mensajes_moderator,
  'Verificar que hay mensajes de ambos roles' as siguiente_paso;
