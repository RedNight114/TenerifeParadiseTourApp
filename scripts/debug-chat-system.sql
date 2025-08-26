-- Script de debug para el sistema de chat
-- Ejecutar en Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar que las vistas existen
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname IN ('conversation_summary', 'message_summary')
ORDER BY viewname;

-- 2. Verificar que las tablas base existen y tienen datos
SELECT 
  schemaname,
  relname as tablename,
  n_tup_ins as rows_inserted,
  n_tup_upd as rows_updated,
  n_tup_del as rows_deleted
FROM pg_stat_user_tables 
WHERE relname IN ('conversations', 'messages', 'conversation_participants')
ORDER BY relname;

-- 3. Verificar datos en las tablas base
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as row_count FROM conversation_participants;

-- 4. Verificar datos en las vistas
SELECT 'conversation_summary' as view_name, COUNT(*) as row_count FROM conversation_summary
UNION ALL
SELECT 'message_summary' as view_name, COUNT(*) as row_count FROM message_summary;

-- 5. Verificar conversaciones sin asignar (admin_id IS NULL)
SELECT 
  id,
  title,
  user_id,
  admin_id,
  status,
  priority,
  created_at,
  user_full_name,
  user_email
FROM conversation_summary 
WHERE admin_id IS NULL 
  AND status = 'open'
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar conversaciones asignadas a un admin específico
-- (reemplaza 'ADMIN_USER_ID' con un ID real de admin)
SELECT 
  id,
  title,
  user_id,
  admin_id,
  status,
  priority,
  created_at,
  user_full_name,
  user_email
FROM conversation_summary 
WHERE admin_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 7. Verificar permisos RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

-- 8. Verificar si hay errores en las vistas
-- Intentar ejecutar las consultas que usa el servicio
SELECT 
  id,
  title,
  user_id,
  admin_id,
  status,
  priority,
  created_at,
  user_full_name,
  user_email,
  user_avatar_url
FROM conversation_summary 
LIMIT 5;

-- 9. Verificar la estructura de la vista conversation_summary
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_summary'
ORDER BY ordinal_position;

-- 10. Verificar si hay datos de prueba
SELECT 
  'conversations' as source,
  id,
  title,
  user_id,
  admin_id,
  status,
  created_at
FROM conversations 
ORDER BY created_at DESC
LIMIT 5;
