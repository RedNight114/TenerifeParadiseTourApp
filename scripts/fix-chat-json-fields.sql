-- Script para corregir campos JSON en las tablas del chat
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual de los campos de forma segura
SELECT 
  'conversations' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN title ~ '^\{.*\}$' THEN 1 END) as json_title_count,
  COUNT(CASE WHEN description ~ '^\{.*\}$' THEN 1 END) as json_description_count
FROM conversations;

-- 2. Mostrar ejemplos de campos JSON (solo los que realmente son JSON)
SELECT 
  id,
  title,
  description,
  CASE 
    WHEN title IS NULL THEN 'NULL'
    WHEN title ~ '^\{.*\}$' THEN 'JSON: ' || title
    ELSE 'TEXT: ' || title
  END as title_type,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN description ~ '^\{.*\}$' THEN 'JSON: ' || description
    ELSE 'TEXT: ' || description
  END as description_type
FROM conversations 
WHERE title ~ '^\{.*\}$' 
   OR description ~ '^\{.*\}$'
LIMIT 10;

-- 3. Corregir campos JSON en title (solo los que realmente son JSON)
UPDATE conversations 
SET title = CASE 
  WHEN title IS NULL THEN 'Nueva consulta'
  WHEN title ~ '^\{.*\}$' THEN 
    COALESCE(
      (title::jsonb)->>'title', 
      (title::jsonb)->>'description', 
      'Nueva consulta'
    )
  ELSE title
END
WHERE title ~ '^\{.*\}$';

-- 4. Corregir campos JSON en description (solo los que realmente son JSON)
UPDATE conversations 
SET description = CASE 
  WHEN description IS NULL THEN NULL
  WHEN description ~ '^\{.*\}$' THEN 
    COALESCE(
      (description::jsonb)->>'description', 
      (description::jsonb)->>'title', 
      NULL
    )
  ELSE description
END
WHERE description ~ '^\{.*\}$';

-- 5. Verificar que los campos ahora son texto
SELECT 
  id,
  title,
  description,
  CASE 
    WHEN title IS NULL THEN 'NULL'
    WHEN title ~ '^\{.*\}$' THEN 'JSON: ' || title
    ELSE 'TEXT: ' || title
  END as title_type,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN description ~ '^\{.*\}$' THEN 'JSON: ' || description
    ELSE 'TEXT: ' || description
  END as description_type
FROM conversations 
LIMIT 10;

-- 6. Verificar que las vistas funcionan correctamente
SELECT 
  id,
  title,
  description,
  user_full_name,
  user_email,
  user_avatar_url,
  created_at
FROM conversation_summary 
LIMIT 5;

-- 7. Si hay problemas con las vistas, recrearlas
-- (Descomentar solo si es necesario)
/*
DROP VIEW IF EXISTS conversation_summary CASCADE;

CREATE VIEW conversation_summary AS
SELECT 
  c.id,
  c.user_id,
  c.admin_id,
  c.title,
  c.description,
  c.status,
  c.priority,
  c.category_id,
  c.tags,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  c.closed_at,
  c.closed_by,
  c.closed_reason,
  -- Información del último mensaje
  lm.content as last_message_content,
  lm.created_at as last_message_created_at,
  lm.sender_id as last_message_sender_id,
  -- Información del usuario
  up.full_name as user_full_name,
  up.email as user_email,
  up.role as user_role,
  up.avatar_url as user_avatar_url,
  -- Información del admin
  ap.full_name as admin_full_name,
  ap.email as admin_email,
  ap.role as admin_role,
  -- Información de la categoría
  cat.name as category_name,
  -- Conteo de mensajes no leídos
  COALESCE(unread.unread_count, 0) as unread_count,
  -- Conteo total de mensajes
  COALESCE(msg_count.total_messages, 0) as total_messages
FROM conversations c
LEFT JOIN LATERAL (
  SELECT m.content, m.created_at, m.sender_id
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON true
LEFT JOIN profiles up ON c.user_id = up.id
LEFT JOIN profiles ap ON c.admin_id = ap.id
LEFT JOIN chat_categories cat ON c.category_id = cat.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) as unread_count
  FROM messages m
  WHERE m.conversation_id = c.id
  AND m.is_read = false
  AND m.sender_id != c.user_id
) unread ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) as total_messages
  FROM messages m
  WHERE m.conversation_id = c.id
) msg_count ON true;
*/

