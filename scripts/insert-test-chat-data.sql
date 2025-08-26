-- Script para insertar datos de prueba en el sistema de chat
-- Ejecutar en Supabase SQL Editor para crear conversaciones de prueba

-- 1. Insertar usuarios de prueba (si no existen)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'usuario1@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Usuario Test 1"}', false, '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', 'usuario2@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Usuario Test 2"}', false, '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', 'admin@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Test"}', false, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar perfiles de usuario (si no existen)
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Usuario Test 1', 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=U1', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Usuario Test 2', 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=U2', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Admin Test', 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=A', now(), now())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

-- 3. Insertar conversaciones de prueba
INSERT INTO public.conversations (id, user_id, title, status, priority, created_at, updated_at)
VALUES 
  ('conv-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Problema con reserva de excursión', 'open', 'high', now() - interval '2 days', now() - interval '2 days'),
  ('conv-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Consulta sobre precios', 'open', 'normal', now() - interval '1 day', now() - interval '1 day'),
  ('conv-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Información sobre horarios', 'assigned', 'low', now() - interval '3 days', now() - interval '1 hour'),
  ('conv-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Solicitud de reembolso', 'open', 'urgent', now() - interval '6 hours', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar participantes de conversación
INSERT INTO public.conversation_participants (id, conversation_id, user_id, role, is_online, created_at, updated_at)
VALUES 
  ('part-1111-1111-1111-111111111111', 'conv-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'user', false, now(), now()),
  ('part-2222-2222-2222-222222222222', 'conv-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'user', false, now(), now()),
  ('part-3333-3333-3333-333333333333', 'conv-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'user', false, now(), now()),
  ('part-3333-3333-3333-333333333334', 'conv-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'admin', false, now(), now()),
  ('part-4444-4444-4444-444444444444', 'conv-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'user', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Insertar mensajes de prueba
INSERT INTO public.messages (id, conversation_id, sender_id, content, message_type, is_read, created_at)
VALUES 
  ('msg-1111-1111-1111-111111111111', 'conv-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hola, tengo un problema con mi reserva de excursión. No puedo ver los detalles en mi perfil.', 'text', false, now() - interval '2 days'),
  ('msg-2222-2222-2222-222222222222', 'conv-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Buenos días, me gustaría saber los precios de las excursiones para grupos de 6 personas.', 'text', false, now() - interval '1 day'),
  ('msg-3333-3333-3333-333333333333', 'conv-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '¿Podrían informarme sobre los horarios de salida de las excursiones?', 'text', false, now() - interval '3 days'),
  ('msg-3333-3333-3333-333333333334', 'conv-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Hola! Los horarios de salida son a las 8:00 AM desde el punto de encuentro. ¿Te gustaría que te envíe más información?', 'text', false, now() - interval '2 days'),
  ('msg-3333-3333-3333-333333333335', 'conv-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Perfecto, gracias por la información. ¿Podrían enviarme también el mapa del punto de encuentro?', 'text', false, now() - interval '1 day'),
  ('msg-4444-4444-4444-444444444444', 'conv-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'URGENTE: Necesito solicitar un reembolso por mi reserva cancelada. ¿Cómo puedo proceder?', 'text', false, now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 6. Actualizar la conversación asignada para que tenga admin_id
UPDATE public.conversations 
SET admin_id = '33333333-3333-3333-3333-333333333333'
WHERE id = 'conv-3333-3333-3333-333333333333';

-- 7. Verificar que los datos se insertaron correctamente
SELECT 'Verificación de datos insertados:' as info;

SELECT 
  'conversations' as table_name,
  COUNT(*) as row_count
FROM conversations
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as row_count
FROM messages
UNION ALL
SELECT 
  'conversation_participants' as table_name,
  COUNT(*) as row_count
FROM conversation_participants;

-- 8. Verificar las vistas
SELECT 
  'conversation_summary' as view_name,
  COUNT(*) as row_count
FROM conversation_summary
UNION ALL
SELECT 
  'message_summary' as view_name,
  COUNT(*) as row_count
FROM message_summary;

-- 9. Verificar conversaciones sin asignar
SELECT 
  'Conversaciones sin asignar:' as info,
  COUNT(*) as count
FROM conversation_summary 
WHERE admin_id IS NULL 
  AND status = 'open';

-- 10. Verificar conversaciones asignadas
SELECT 
  'Conversaciones asignadas:' as info,
  COUNT(*) as count
FROM conversation_summary 
WHERE admin_id IS NOT NULL;
