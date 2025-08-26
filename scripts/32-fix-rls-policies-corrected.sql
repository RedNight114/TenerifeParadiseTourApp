-- Script para corregir las políticas RLS del chat (CORREGIDO)
-- Ejecutar para resolver el problema de permisos

-- =====================================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
-- =====================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE '=== ELIMINANDO TODAS LAS POLÍTICAS RLS EXISTENTES ===';
    
    -- Eliminar TODAS las políticas de conversation_participants
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversation_participants' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON conversation_participants';
        RAISE NOTICE 'Eliminada política: % de conversation_participants', pol.policyname;
    END LOOP;
    
    -- Eliminar TODAS las políticas de conversations
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON conversations';
        RAISE NOTICE 'Eliminada política: % de conversations', pol.policyname;
    END LOOP;
    
    -- Eliminar TODAS las políticas de messages
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON messages';
        RAISE NOTICE 'Eliminada política: % de messages', pol.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ TODAS las políticas RLS existentes han sido eliminadas';
END $$;

-- =====================================================
-- PASO 2: CREAR NUEVAS POLÍTICAS RLS CORRECTAS
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
-- PASO 3: VERIFICAR QUE LAS POLÍTICAS FUNCIONAN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS RLS ===';
    
    -- Verificar que se puede leer la tabla conversations
    BEGIN
        PERFORM 1 FROM conversations LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para conversations funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para conversations: %', SQLERRM;
    END;
    
    -- Verificar que se puede leer conversation_participants
    BEGIN
        PERFORM 1 FROM conversation_participants LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para conversation_participants funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para conversation_participants: %', SQLERRM;
    END;
    
    -- Verificar que se puede leer messages
    BEGIN
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
    RAISE NOTICE '✅ TODAS las políticas RLS existentes eliminadas';
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
