-- Script para corregir las políticas RLS del sistema de chat
-- Este script agrega las políticas faltantes para permitir operaciones básicas

-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA conversation_participants
-- =====================================================

-- Eliminar políticas existentes para conversation_participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;

-- Crear políticas completas para conversation_participants
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para INSERT - usuarios pueden agregarse a sus propias conversaciones
CREATE POLICY "Users can insert themselves as participants" ON conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para UPDATE - usuarios pueden actualizar su participación
CREATE POLICY "Users can update their participation" ON conversation_participants
  FOR UPDATE USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para DELETE - usuarios pueden eliminar su participación
CREATE POLICY "Users can delete their participation" ON conversation_participants
  FOR DELETE USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA conversations
-- =====================================================

-- Política para INSERT - usuarios pueden crear conversaciones
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - usuarios pueden actualizar sus conversaciones
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA messages
-- =====================================================

-- Política para INSERT - usuarios pueden enviar mensajes en sus conversaciones
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Verificar que las políticas se crearon correctamente
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
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, policyname;

-- Mostrar resumen de políticas por tabla
SELECT 
  'conversations' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversations'
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'messages'
UNION ALL
SELECT 
  'conversation_participants' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversation_participants';

-- =====================================================
-- PRUEBA DE PERMISOS
-- =====================================================

-- Verificar que el usuario actual puede crear conversaciones
DO $$
DECLARE
    current_user_id UUID;
    test_conversation_id UUID;
BEGIN
    -- Obtener el usuario actual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '⚠️ No hay usuario autenticado para probar permisos';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Usuario autenticado: %', current_user_id;
    
    -- Verificar permisos en conversations
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'conversations' 
        AND cmd = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Política INSERT para conversations: OK';
    ELSE
        RAISE NOTICE '❌ Política INSERT para conversations: FALTANTE';
    END IF;
    
    -- Verificar permisos en conversation_participants
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'conversation_participants' 
        AND cmd = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Política INSERT para conversation_participants: OK';
    ELSE
        RAISE NOTICE '❌ Política INSERT para conversation_participants: FALTANTE';
    END IF;
    
    -- Verificar permisos en messages
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND cmd = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Política INSERT para messages: OK';
    ELSE
        RAISE NOTICE '❌ Política INSERT para messages: FALTANTE';
    END IF;
    
END $$;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== INSTRUCCIONES DE USO ===';
    RAISE NOTICE '';
    RAISE NOTICE '1. Ejecuta este script en tu base de datos Supabase';
    RAISE NOTICE '2. Verifica que las políticas se crearon correctamente';
    RAISE NOTICE '3. Prueba crear una nueva conversación desde la aplicación';
    RAISE NOTICE '';
    RAISE NOTICE 'Si sigues teniendo problemas, verifica:';
    RAISE NOTICE '- Que el usuario esté autenticado (auth.uid() no sea NULL)';
    RAISE NOTICE '- Que el usuario tenga un perfil en la tabla profiles';
    RAISE NOTICE '- Que las políticas RLS estén habilitadas en las tablas';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Script de corrección RLS completado!';
END $$;
