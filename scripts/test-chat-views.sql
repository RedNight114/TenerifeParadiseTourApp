-- Script de prueba para verificar las vistas del chat
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que las vistas existen
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname IN ('conversation_summary', 'message_summary')
ORDER BY viewname;

-- 2. Verificar la estructura de conversation_summary
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_summary'
ORDER BY ordinal_position;

-- 3. Verificar datos en conversation_summary
SELECT 
  id,
  title,
  description,
  user_id,
  admin_id,
  status,
  priority,
  user_full_name,
  user_email,
  user_avatar_url,
  created_at
FROM conversation_summary 
LIMIT 5;

-- 4. Verificar datos en message_summary
SELECT 
  id,
  conversation_id,
  sender_id,
  content,
  sender_full_name,
  sender_email,
  sender_avatar_url,
  created_at
FROM message_summary 
LIMIT 5;

-- 5. Verificar que hay datos en las tablas base
SELECT 'conversations' as table_name, COUNT(*) as row_count FROM conversations
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles;

-- 6. Verificar una conversación específica con todos sus datos
SELECT 
  c.id,
  c.title,
  c.description,
  c.status,
  c.priority,
  c.created_at,
  p.full_name as user_full_name,
  p.email as user_email,
  p.avatar_url as user_avatar_url
FROM conversations c
LEFT JOIN profiles p ON c.user_id = p.id
LIMIT 3;

-- 7. Verificar si hay problemas con los campos JSON
SELECT 
  id,
  title,
  description,
  CASE 
    WHEN title IS NULL THEN 'NULL'
    WHEN jsonb_typeof(title::jsonb) IS NOT NULL THEN 'JSON: ' || title
    ELSE 'TEXT: ' || title
  END as title_type,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN jsonb_typeof(description::jsonb) IS NOT NULL THEN 'JSON: ' || description
    ELSE 'TEXT: ' || description
  END as description_type
FROM conversations 
LIMIT 5;


