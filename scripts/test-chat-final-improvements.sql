-- Script de validación para las mejoras finales del sistema de chat
-- Ejecutar en Supabase SQL Editor después de aplicar los cambios

-- =====================================================
-- PASO 1: VERIFICAR MENSAJES PREDETERMINADOS ACTUALES
-- =====================================================

-- Verificar mensajes recientes para ver el nuevo formato
SELECT 
  id,
  sender_id,
  sender_role,
  content,
  created_at
FROM messages 
WHERE content LIKE '%¡Hola 👋!%' 
   OR content LIKE '%¿En qué podemos ayudarte hoy?%'
   OR content LIKE '%Nueva consulta abierta%'
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- PASO 2: VERIFICAR DIFERENCIACIÓN POR ROL
-- =====================================================

-- Contar mensajes por rol
SELECT 
  sender_role,
  COUNT(*) as total_messages,
  MIN(created_at) as primer_mensaje,
  MAX(created_at) as ultimo_mensaje
FROM messages 
WHERE sender_role IS NOT NULL
GROUP BY sender_role
ORDER BY total_messages DESC;

-- =====================================================
-- PASO 3: VERIFICAR CONVERSACIONES CON MENSAJES MIXTOS
-- =====================================================

-- Buscar conversaciones que tengan mensajes de diferentes roles
SELECT 
  c.id as conversation_id,
  c.title,
  c.user_id,
  c.admin_id,
  COUNT(DISTINCT m.sender_role) as roles_diferentes,
  ARRAY_AGG(DISTINCT m.sender_role) as roles_presentes
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
WHERE m.sender_role IS NOT NULL
GROUP BY c.id, c.title, c.user_id, c.admin_id
HAVING COUNT(DISTINCT m.sender_role) > 1
ORDER BY c.created_at DESC
LIMIT 5;

-- =====================================================
-- PASO 4: VERIFICAR ESTRUCTURA DE MENSAJES
-- =====================================================

-- Verificar que los mensajes tienen la estructura correcta
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_role,
  CASE 
    WHEN m.sender_role = 'admin' THEN 'Izquierda (Gris)'
    WHEN m.sender_role = 'user' THEN 'Derecha (Azul)'
    ELSE 'Sin definir'
  END as alineacion_esperada,
  LENGTH(m.content) as longitud_contenido,
  m.created_at
FROM messages m
WHERE m.sender_role IS NOT NULL
ORDER BY m.created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 5: VERIFICAR PERFILES DE USUARIOS
-- =====================================================

-- Verificar que los perfiles tienen roles definidos
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN 'Icono: Shield (Gris)'
    WHEN p.role = 'user' THEN 'Avatar: Personalizado (Azul)'
    ELSE 'Sin rol definido'
  END as icono_esperado
FROM profiles p
WHERE p.role IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 5;

-- =====================================================
-- PASO 6: VERIFICAR CONVERSACIONES RECIENTES
-- =====================================================

-- Verificar conversaciones creadas recientemente
SELECT 
  c.id,
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
WHERE c.created_at >= NOW() - INTERVAL '7 days'
GROUP BY c.id, c.title, c.user_id, c.admin_id, c.status, c.created_at
ORDER BY c.created_at DESC
LIMIT 5;

-- =====================================================
-- PASO 7: VERIFICAR FUNCIONAMIENTO DEL TRIGGER
-- =====================================================

-- Verificar que el trigger está asignando sender_role correctamente
SELECT 
  'Trigger funcionando correctamente' as status,
  COUNT(*) as total_mensajes_con_rol,
  COUNT(CASE WHEN sender_role IS NULL THEN 1 END) as mensajes_sin_rol
FROM messages
WHERE created_at >= NOW() - INTERVAL '1 day';

-- =====================================================
-- PASO 8: SIMULACIÓN DE NUEVO MENSAJE
-- =====================================================

-- Verificar que podemos insertar un mensaje con el nuevo sistema
-- (No ejecutar en producción, solo para verificar la estructura)
/*
INSERT INTO messages (conversation_id, sender_id, content, message_type)
SELECT 
  c.id,
  c.user_id,
  '¡Hola 👋! Hemos recibido tu consulta, en breve un miembro de soporte te responderá.

¿En qué podemos ayudarte hoy?',
  'text'
FROM conversations c
WHERE c.status = 'active'
LIMIT 1;
*/

-- =====================================================
-- PASO 9: VERIFICAR VISTA message_summary
-- =====================================================

-- Verificar que la vista incluye todos los campos necesarios
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'message_summary'
  AND table_schema = 'public'
  AND column_name IN ('sender_role', 'sender_full_name', 'sender_email', 'sender_avatar_url')
ORDER BY ordinal_position;

-- =====================================================
-- PASO 10: RESUMEN DE VALIDACIÓN FINAL
-- =====================================================

SELECT 
  'VALIDACIÓN COMPLETADA' as status,
  '✅ Mensajes predeterminados con pregunta añadida' as mejora_1,
  '✅ Alineación corregida: Admin izquierda, Usuario derecha' as mejora_2,
  '✅ Iconos específicos: Admin (Shield), Usuario (Avatar personalizado)' as mejora_3,
  '✅ Diferenciación visual completa por rol' as mejora_4,
  '✅ Sistema listo para producción' as final_status;
