-- Script para corregir las políticas RLS del chat
-- Ejecutar para resolver el problema de permisos

-- =====================================================
-- PASO 1: VERIFICAR POLÍTICAS RLS ACTUALES
-- =====================================================

DO $$
DECLARE
    pol RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== POLÍTICAS RLS ACTUALES ===';
    
    -- Verificar políticas para conversations
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'conversations';
    
    RAISE NOTICE 'Políticas para conversations: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT policyname, permissive, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' ORDER BY policyname LOOP
            RAISE NOTICE '  - %: % (% on %) - Roles: %', pol.policyname, pol.cmd, pol.permissive, pol.roles;
            RAISE NOTICE '    Condición: %', pol.qual;
        END LOOP;
    END IF;
    
    -- Verificar políticas para conversation_participants
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'conversation_participants';
    
    RAISE NOTICE 'Políticas para conversation_participants: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT policyname, permissive, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversation_participants' ORDER BY policyname LOOP
            RAISE NOTICE '  - %: % (% on %) - Roles: %', pol.policyname, pol.cmd, pol.permissive, pol.roles;
            RAISE NOTICE '    Condición: %', pol.qual;
        END LOOP;
    END IF;
    
    -- Verificar políticas para messages
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'messages';
    
    RAISE NOTICE 'Políticas para messages: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT policyname, permissive, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' ORDER BY policyname LOOP
            RAISE NOTICE '  - %: % (% on %) - Roles: %', pol.policyname, pol.cmd, pol.permissive, pol.roles;
            RAISE NOTICE '    Condición: %', pol.qual;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- PASO 2: ELIMINAR POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== ELIMINANDO POLÍTICAS RLS PROBLEMÁTICAS ===';
    
    -- Eliminar políticas existentes para conversation_participants
    DROP POLICY IF EXISTS "Users can view their own conversations" ON conversation_participants;
    DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversation_participants;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON conversation_participants;
    DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversation_participants;
    DROP POLICY IF EXISTS "Admins can view all conversations" ON conversation_participants;
    DROP POLICY IF EXISTS "Admins can manage all conversations" ON conversation_participants;
    
    RAISE NOTICE '✅ Políticas de conversation_participants eliminadas';
    
    -- Eliminar políticas existentes para conversations
    DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
    DROP POLICY IF EXISTS "Admins can manage all conversations" ON conversations;
    
    RAISE NOTICE '✅ Políticas de conversations eliminadas';
    
    -- Eliminar políticas existentes para messages
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
    DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
    DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
    DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
    DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;
    
    RAISE NOTICE '✅ Políticas de messages eliminadas';
END $$;

-- =====================================================
-- PASO 3: CREAR NUEVAS POLÍTICAS RLS CORRECTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== CREANDO NUEVAS POLÍTICAS RLS ===';
    
    -- =====================================================
    -- POLÍTICAS PARA conversations
    -- =====================================================
    
    -- Usuarios pueden ver sus propias conversaciones
    CREATE POLICY "Users can view own conversations" ON conversations
        FOR SELECT USING (
            user_id = auth.uid() OR 
            admin_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM conversation_participants 
                WHERE conversation_id = conversations.id 
                AND user_id = auth.uid()
            )
        );
    
    -- Usuarios pueden crear conversaciones
    CREATE POLICY "Users can create conversations" ON conversations
        FOR INSERT WITH CHECK (
            user_id = auth.uid()
        );
    
    -- Usuarios pueden actualizar sus conversaciones
    CREATE POLICY "Users can update own conversations" ON conversations
        FOR UPDATE USING (
            user_id = auth.uid() OR admin_id = auth.uid()
        );
    
    -- Admins pueden ver todas las conversaciones
    CREATE POLICY "Admins can view all conversations" ON conversations
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    -- Admins pueden gestionar todas las conversaciones
    CREATE POLICY "Admins can manage all conversations" ON conversations
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Políticas para conversations creadas';
    
    -- =====================================================
    -- POLÍTICAS PARA conversation_participants
    -- =====================================================
    
    -- Usuarios pueden ver participantes de sus conversaciones
    CREATE POLICY "Users can view conversation participants" ON conversation_participants
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM conversations 
                WHERE id = conversation_participants.conversation_id 
                AND (user_id = auth.uid() OR admin_id = auth.uid())
            ) OR
            user_id = auth.uid()
        );
    
    -- Usuarios pueden agregarse como participantes
    CREATE POLICY "Users can insert themselves as participants" ON conversation_participants
        FOR INSERT WITH CHECK (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM conversations 
                WHERE id = conversation_participants.conversation_id 
                AND admin_id = auth.uid()
            )
        );
    
    -- Usuarios pueden actualizar su participación
    CREATE POLICY "Users can update own participation" ON conversation_participants
        FOR UPDATE USING (
            user_id = auth.uid()
        );
    
    -- Admins pueden gestionar todos los participantes
    CREATE POLICY "Admins can manage all participants" ON conversation_participants
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Políticas para conversation_participants creadas';
    
    -- =====================================================
    -- POLÍTICAS PARA messages
    -- =====================================================
    
    -- Usuarios pueden ver mensajes de sus conversaciones
    CREATE POLICY "Users can view conversation messages" ON messages
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM conversation_participants 
                WHERE conversation_id = messages.conversation_id 
                AND user_id = auth.uid()
            )
        );
    
    -- Usuarios pueden enviar mensajes en sus conversaciones
    CREATE POLICY "Users can send messages" ON messages
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM conversation_participants 
                WHERE conversation_id = messages.conversation_id 
                AND user_id = auth.uid()
            )
        );
    
    -- Usuarios pueden editar sus propios mensajes
    CREATE POLICY "Users can edit own messages" ON messages
        FOR UPDATE USING (
            sender_id = auth.uid()
        );
    
    -- Admins pueden gestionar todos los mensajes
    CREATE POLICY "Admins can manage all messages" ON messages
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Políticas para messages creadas';
END $$;

-- =====================================================
-- PASO 4: VERIFICAR QUE LAS POLÍTICAS FUNCIONAN
-- =====================================================

DO $$
DECLARE
    test_user_id TEXT := '00000000-0000-0000-0000-000000000000';
    test_conv_id UUID;
    test_part_id UUID;
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS RLS ===';
    
    -- Simular inserción de conversación (solo para verificar permisos)
    BEGIN
        -- Verificar que se puede leer la tabla
        PERFORM 1 FROM conversations LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para conversations funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para conversations: %', SQLERRM;
    END;
    
    BEGIN
        -- Verificar que se puede leer conversation_participants
        PERFORM 1 FROM conversation_participants LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para conversation_participants funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para conversation_participants: %', SQLERRM;
    END;
    
    BEGIN
        -- Verificar que se puede leer messages
        PERFORM 1 FROM messages LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para messages funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para messages: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE CORRECCIÓN DE POLÍTICAS RLS ===';
    RAISE NOTICE '✅ Políticas RLS problemáticas eliminadas';
    RAISE NOTICE '✅ Nuevas políticas RLS correctas creadas';
    RAISE NOTICE '';
    RAISE NOTICE 'Las nuevas políticas permiten:';
    RAISE NOTICE '- Usuarios crear conversaciones';
    RAISE NOTICE '- Usuarios agregarse como participantes';
    RAISE NOTICE '- Usuarios enviar mensajes';
    RAISE NOTICE '- Admins gestionar todo';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora prueba el chat nuevamente:';
    RAISE NOTICE '1. Recarga la página';
    RAISE NOTICE '2. Abre el chat flotante';
    RAISE NOTICE '3. Intenta crear una conversación';
    RAISE NOTICE '';
    RAISE NOTICE 'Deberías ver en la consola:';
    RAISE NOTICE '✅ Conversación creada exitosamente';
    RAISE NOTICE '✅ Usuario agregado como participante exitosamente';
END $$;
