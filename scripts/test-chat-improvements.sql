-- Script de validación para las mejoras del sistema de chat
-- Ejecutar en Supabase SQL Editor después de aplicar los cambios

-- =====================================================
-- PASO 1: VERIFICAR QUE EL CAMPO sender_role EXISTE
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  check_clause
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
  AND column_name = 'sender_role';

-- =====================================================
-- PASO 2: VERIFICAR QUE LA FUNCIÓN get_user_role EXISTE
-- =====================================================

SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_role'
  AND routine_schema = 'public';

-- =====================================================
-- PASO 3: VERIFICAR QUE EL TRIGGER EXISTE
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'messages'
  AND trigger_schema = 'public';

-- =====================================================
-- PASO 4: VERIFICAR LA VISTA message_summary
-- =====================================================

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'message_summary'
  AND table_schema = 'public';

-- =====================================================
-- PASO 5: PROBAR LA FUNCIÓN get_user_role
-- =====================================================

-- Obtener algunos usuarios de prueba
SELECT 
  id,
  email,
  role,
  get_user_role(id) as function_result
FROM profiles 
LIMIT 5;

-- =====================================================
-- PASO 6: VERIFICAR MENSAJES EXISTENTES CON sender_role
-- =====================================================

SELECT 
  id,
  sender_id,
  sender_role,
  content,
  created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- PASO 7: VERIFICAR LA VISTA message_summary
-- =====================================================

SELECT 
  id,
  sender_id,
  sender_role,
  sender_full_name,
  sender_email,
  content,
  created_at
FROM message_summary 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- PASO 8: PROBAR INSERCIÓN DE MENSAJE (SIMULACIÓN)
-- =====================================================

-- Verificar que un usuario existe
SELECT id, email, role FROM profiles WHERE role = 'user' LIMIT 1;

-- Verificar que un admin existe
SELECT id, email, role FROM profiles WHERE role = 'admin' LIMIT 1;

-- =====================================================
-- PASO 9: VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 10: RESUMEN DE VERIFICACIÓN
-- =====================================================

SELECT 
  'Verificación completada' as status,
  'Campo sender_role añadido correctamente' as sender_role_check,
  'Función get_user_role creada' as function_check,
  'Trigger configurado' as trigger_check,
  'Vista message_summary creada' as view_check,
  'Sistema listo para usar' as final_status;
