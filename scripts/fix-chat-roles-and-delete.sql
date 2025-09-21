-- Script para corregir problemas del chat: roles y borrado
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL DEL TRIGGER
-- =====================================================

-- Verificar si el trigger existe y está activo
SELECT 
    'TRIGGER STATUS' as tipo,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_message_sender_role';

-- Verificar si la función existe
SELECT 
    'FUNCTION STATUS' as tipo,
    proname as function_name,
    proargtypes,
    prosrc
FROM pg_proc 
WHERE proname = 'get_user_role';

-- =====================================================
-- PASO 2: VERIFICAR MENSAJES RECIENTES Y SUS ROLES
-- =====================================================

-- Ver mensajes recientes con sus roles
SELECT 
    'MENSAJES RECIENTES' as tipo,
    m.id,
    m.sender_id,
    m.sender_role,
    p.role as profile_role,
    LEFT(m.content, 50) as content_preview,
    m.created_at,
    CASE 
        WHEN m.sender_role = p.role THEN '✅ Correcto'
        WHEN m.sender_role IS NULL THEN '❌ Sin rol'
        ELSE '⚠️ Incorrecto'
    END as status
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
ORDER BY m.created_at DESC 
LIMIT 10;

-- =====================================================
-- PASO 3: RECREAR EL TRIGGER SI ES NECESARIO
-- =====================================================

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS trigger_set_message_sender_role ON messages;
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS set_message_sender_role();

-- Crear función mejorada para obtener el rol del usuario
CREATE OR REPLACE FUNCTION get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario desde la tabla profiles
    SELECT role INTO user_role FROM profiles WHERE id = user_id_param;
    
    -- Si no se encuentra el usuario, retornar 'user' por defecto
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    -- Mapear roles de la base de datos a roles del chat
    CASE user_role
        WHEN 'admin' THEN RETURN 'admin';
        WHEN 'moderator' THEN RETURN 'moderator';
        WHEN 'support' THEN RETURN 'support';
        WHEN 'client' THEN RETURN 'client';
        ELSE RETURN 'user';
    END CASE;
END;
$$;

-- Crear función del trigger mejorada
CREATE OR REPLACE FUNCTION set_message_sender_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Si sender_role no está definido, determinarlo automáticamente
    IF NEW.sender_role IS NULL OR NEW.sender_role = '' THEN
        NEW.sender_role := get_user_role(NEW.sender_id);
    END IF;
    
    -- Log para debugging
    RAISE NOTICE 'Mensaje %: sender_id=%, sender_role=%', NEW.id, NEW.sender_id, NEW.sender_role;
    
    RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER trigger_set_message_sender_role
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_sender_role();

-- =====================================================
-- PASO 4: ACTUALIZAR MENSAJES EXISTENTES CON ROLES INCORRECTOS
-- =====================================================

-- Actualizar mensajes que no tengan sender_role o tengan un valor incorrecto
UPDATE messages 
SET sender_role = get_user_role(sender_id)
WHERE sender_role IS NULL 
   OR sender_role = ''
   OR sender_role NOT IN ('user', 'admin', 'moderator', 'support', 'client');

-- =====================================================
-- PASO 5: VERIFICAR POLÍTICAS RLS PARA BORRADO
-- =====================================================

-- Verificar políticas RLS en la tabla conversations
SELECT 
    'RLS POLICIES' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations';

-- Verificar políticas RLS en la tabla messages
SELECT 
    'RLS POLICIES' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages';

-- =====================================================
-- PASO 6: CREAR POLÍTICAS RLS PARA BORRADO SI NO EXISTEN
-- =====================================================

-- Política para que los admins puedan eliminar cualquier conversación
DROP POLICY IF EXISTS "Admins can delete any conversation" ON conversations;
CREATE POLICY "Admins can delete any conversation" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Política para que los usuarios puedan eliminar sus propias conversaciones
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Política para eliminar mensajes (cascada con conversaciones)
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;
CREATE POLICY "Users can delete messages from their conversations" ON messages
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                conversations.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'moderator')
                )
            )
        )
    );

-- =====================================================
-- PASO 7: VERIFICAR RESULTADOS FINALES
-- =====================================================

-- Verificar que el trigger está funcionando
SELECT 
    'TRIGGER VERIFICATION' as tipo,
    trigger_name,
    'Active' as status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_message_sender_role';

-- Verificar roles en mensajes después de la corrección
SELECT 
    'ROLES AFTER FIX' as tipo,
    sender_role,
    COUNT(*) as cantidad
FROM messages 
GROUP BY sender_role
ORDER BY sender_role;

-- Verificar algunos mensajes recientes
SELECT 
    'RECENT MESSAGES' as tipo,
    m.id,
    m.sender_id,
    m.sender_role,
    p.role as profile_role,
    LEFT(m.content, 30) as content_preview,
    CASE 
        WHEN m.sender_role = p.role THEN '✅ Correcto'
        WHEN m.sender_role IS NULL THEN '❌ Sin rol'
        ELSE '⚠️ Incorrecto'
    END as status
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
ORDER BY m.created_at DESC 
LIMIT 5;

-- Verificar políticas RLS
SELECT 
    'RLS VERIFICATION' as tipo,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

SELECT 'CORRECCIÓN COMPLETA: Chat roles y borrado corregidos' as status;
