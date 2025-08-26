-- Script para agregar usuarios como participantes de conversaciones existentes
-- Ejecutar en Supabase SQL Editor para resolver el problema de mensajes no visibles

-- 1. Ver conversaciones existentes
SELECT 
  c.id,
  c.title,
  c.user_id,
  c.status,
  c.created_at
FROM conversations c
ORDER BY c.created_at DESC;

-- 2. Ver participantes existentes
SELECT 
  cp.conversation_id,
  cp.user_id,
  cp.role,
  cp.status,
  cp.joined_at
FROM conversation_participants cp
ORDER BY cp.joined_at DESC;

-- 3. Agregar usuario como participante de conversaciones donde no esté
-- Reemplaza 'TU_USER_ID_AQUI' con el ID real del usuario
INSERT INTO conversation_participants (
  conversation_id,
  user_id,
  role,
  joined_at,
  last_read_at,
  is_online,
  status
)
SELECT 
  c.id,
  'TU_USER_ID_AQUI', -- REEMPLAZAR CON ID REAL
  'user',
  NOW(),
  NOW(),
  true,
  'active'
FROM conversations c
WHERE c.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id 
    AND cp.user_id = 'TU_USER_ID_AQUI' -- REEMPLAZAR CON ID REAL
  );

-- 4. Verificar que se agregaron los participantes
SELECT 
  cp.conversation_id,
  cp.user_id,
  cp.role,
  cp.status,
  cp.joined_at
FROM conversation_participants cp
WHERE cp.user_id = 'TU_USER_ID_AQUI' -- REEMPLAZAR CON ID REAL
ORDER BY cp.joined_at DESC;
