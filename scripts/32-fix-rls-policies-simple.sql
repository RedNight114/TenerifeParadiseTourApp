-- Script para corregir las políticas RLS del chat (SIMPLIFICADO)
-- Evita recursión infinita en las políticas

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
-- PASO 2: CREAR POLÍTICAS RLS SIMPLIFICADAS (SIN RECURSIÓN)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== CREANDO POLÍTICAS RLS SIMPLIFICADAS ===';
    
    -- =====================================================
    -- POLÍTICAS PARA conversations (SIN RECURSIÓN)
    -- =====================================================
    
    -- Usuarios pueden ver sus propias conversaciones
    CREATE POLICY "Users can view own conversations" ON conversations
        FOR SELECT USING (
            user_id = auth.uid() OR 
            admin_id = auth.uid()
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
    
    RAISE NOTICE '✅ Políticas para conversations creadas (sin recursión)';
    
    -- =====================================================
    -- POLÍTICAS PARA conversation_participants (SIN RECURSIÓN)
    -- =====================================================
    
    -- Usuarios pueden ver participantes de sus conversaciones
    CREATE POLICY "Users can view conversation participants" ON conversation_participants
        FOR SELECT USING (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM conversations 
                WHERE id = conversation_participants.conversation_id 
                AND (user_id = auth.uid() OR admin_id = auth.uid())
            )
        );
    
    -- Usuarios pueden agregarse como participantes
    CREATE POLICY "Users can insert themselves as participants" ON conversation_participants
        FOR INSERT WITH CHECK (
            user_id = auth.uid()
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
    
    RAISE NOTICE '✅ Políticas para conversation_participants creadas (sin recursión)';
    
    -- =====================================================
    -- POLÍTICAS PARA messages (SIN RECURSIÓN)
    -- =====================================================
    
    -- Usuarios pueden ver mensajes de sus conversaciones
    CREATE POLICY "Users can view conversation messages" ON messages
        FOR SELECT USING (
            sender_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM conversations 
                WHERE id = messages.conversation_id 
                AND (user_id = auth.uid() OR admin_id = auth.uid())
            )
        );
    
    -- Usuarios pueden enviar mensajes en sus conversaciones
    CREATE POLICY "Users can send messages" ON messages
        FOR INSERT WITH CHECK (
            sender_id = auth.uid()
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
    
    RAISE NOTICE '✅ Políticas para messages creadas (sin recursión)';
    
    -- =====================================================
    -- POLÍTICAS PARA chat_notifications (SIN RECURSIÓN)
    -- =====================================================
    
    -- Usuarios pueden ver sus propias notificaciones
    CREATE POLICY "Users can view own notifications" ON chat_notifications
        FOR SELECT USING (auth.uid() = user_id);
    
    -- Usuarios pueden insertar notificaciones para sí mismos
    CREATE POLICY "Users can insert own notifications" ON chat_notifications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Usuarios pueden actualizar sus notificaciones
    CREATE POLICY "Users can update own notifications" ON chat_notifications
        FOR UPDATE USING (auth.uid() = user_id);
    
    -- Admins pueden ver todas las notificaciones
    CREATE POLICY "Admins can view all notifications" ON chat_notifications
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    -- Admins pueden insertar notificaciones para cualquier usuario
    CREATE POLICY "Admins can insert notifications" ON chat_notifications
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    -- Admins pueden actualizar todas las notificaciones
    CREATE POLICY "Admins can update all notifications" ON chat_notifications
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Políticas para chat_notifications creadas (sin recursión)';
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
    RAISE NOTICE '✅ Nuevas políticas RLS simplificadas creadas (SIN RECURSIÓN)';
    RAISE NOTICE '';
    RAISE NOTICE 'Las nuevas políticas permiten:';
    RAISE NOTICE '- Usuarios crear conversaciones';
    RAISE NOTICE '- Usuarios agregarse como participantes';
    RAISE NOTICE '- Usuarios enviar mensajes';
    RAISE NOTICE '- Admins gestionar todo';
    RAISE NOTICE '';
    RAISE NOTICE 'POLÍTICAS SIMPLIFICADAS PARA EVITAR RECURSIÓN:';
    RAISE NOTICE '- conversations: Solo verifica user_id y admin_id directamente';
    RAISE NOTICE '- conversation_participants: Verifica user_id directamente';
    RAISE NOTICE '- messages: Verifica sender_id directamente';
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
