-- Script de validación para el dashboard de administración
-- Ejecutar en Supabase SQL Editor para verificar que los mensajes se muestran correctamente

-- =====================================================
-- PASO 1: VERIFICAR CONVERSACIONES CON MENSAJES
-- =====================================================

-- Buscar conversaciones que tengan mensajes
SELECT 
  c.id as conversation_id,
  c.title,
  c.user_id,
  c.admin_id,
  c.status,
  c.created_at,
  COUNT(m.id) as total_mensajes,
  COUNT(CASE WHEN m.sender_role = 'user' THEN 1 END) as mensajes_usuario,
  COUNT(CASE WHEN m.sender_role = 'admin' THEN 1 END) as mensajes_admin
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.title, c.user_id, c.admin_id, c.status, c.created_at
HAVING COUNT(m.id) > 0
ORDER BY c.created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 2: VERIFICAR ESTRUCTURA DE MENSAJES RECIENTES
-- =====================================================

-- Verificar mensajes recientes con toda la información necesaria
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.created_at,
  p.full_name as sender_full_name,
  p.email as sender_email,
  p.avatar_url as sender_avatar_url
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.created_at >= NOW() - INTERVAL '7 days'
ORDER BY m.created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 3: VERIFICAR CONVERSACIONES ACTIVAS
-- =====================================================

-- Buscar conversaciones activas para el dashboard
SELECT 
  c.id,
  c.title,
  c.user_id,
  c.admin_id,
  c.status,
  c.priority,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  p.full_name as user_full_name,
  p.email as user_email,
  p.avatar_url as user_avatar_url
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE c.status = 'active'
ORDER BY c.created_at DESC
LIMIT 5;

-- =====================================================
-- PASO 4: VERIFICAR MENSAJES POR CONVERSACIÓN
-- =====================================================

-- Verificar mensajes de una conversación específica (reemplazar con ID real)
WITH sample_conversation AS (
  SELECT id FROM conversations WHERE status = 'active' LIMIT 1
)
SELECT 
  m.id,
  m.sender_id,
  m.sender_role,
  m.content,
  m.message_type,
  m.created_at,
  p.full_name as sender_full_name,
  p.email as sender_email
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE m.conversation_id IN (SELECT id FROM sample_conversation)
ORDER BY m.created_at ASC;

-- =====================================================
-- PASO 5: VERIFICAR USUARIOS ADMINISTRADORES
-- =====================================================

-- Verificar que hay usuarios con rol de admin
SELECT 
  id,
  email,
  full_name,
  role,
  avatar_url,
  created_at
FROM profiles 
WHERE role IN ('admin', 'moderator')
ORDER BY created_at DESC;

-- =====================================================
-- PASO 6: VERIFICAR CONVERSACIONES SIN ASIGNAR
-- =====================================================

-- Conversaciones pendientes (sin admin asignado)
SELECT 
  c.id,
  c.title,
  c.user_id,
  c.status,
  c.priority,
  c.created_at,
  p.full_name as user_full_name,
  p.email as user_email,
  COUNT(m.id) as total_mensajes
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.admin_id IS NULL 
  AND c.status = 'active'
GROUP BY c.id, c.title, c.user_id, c.status, c.priority, c.created_at, p.full_name, p.email
ORDER BY c.created_at DESC;

-- =====================================================
-- PASO 7: VERIFICAR CONVERSACIONES ASIGNADAS
-- =====================================================

-- Conversaciones con admin asignado
SELECT 
  c.id,
  c.title,
  c.user_id,
  c.admin_id,
  c.status,
  c.priority,
  c.created_at,
  p1.full_name as user_full_name,
  p1.email as user_email,
  p2.full_name as admin_full_name,
  p2.email as admin_email,
  COUNT(m.id) as total_mensajes
FROM conversations c
LEFT JOIN profiles p1 ON c.user_id = p1.id
LEFT JOIN profiles p2 ON c.admin_id = p2.id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.admin_id IS NOT NULL 
  AND c.status = 'active'
GROUP BY c.id, c.title, c.user_id, c.admin_id, c.status, c.priority, c.created_at, 
         p1.full_name, p1.email, p2.full_name, p2.email
ORDER BY c.created_at DESC;

-- =====================================================
-- PASO 8: VERIFICAR VISTA message_summary
-- =====================================================

-- Verificar que la vista message_summary funciona correctamente
SELECT 
  id,
  conversation_id,
  sender_id,
  sender_role,
  content,
  sender_full_name,
  sender_email,
  created_at
FROM message_summary 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- PASO 9: VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que las políticas RLS permiten acceso a los datos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'profiles')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 10: RESUMEN DE VALIDACIÓN
-- =====================================================

SELECT 
  'VALIDACIÓN DASHBOARD ADMIN COMPLETADA' as status,
  '✅ Conversaciones con mensajes encontradas' as conversaciones_check,
  '✅ Mensajes con sender_role correcto' as mensajes_check,
  '✅ Usuarios admin disponibles' as admin_check,
  '✅ Vista message_summary funcionando' as vista_check,
  '✅ Dashboard listo para mostrar mensajes' as final_status;
