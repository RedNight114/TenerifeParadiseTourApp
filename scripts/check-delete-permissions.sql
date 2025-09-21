-- Script para verificar permisos de eliminación
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- VERIFICAR POLÍTICAS RLS PARA ELIMINACIÓN
-- =====================================================

-- Verificar políticas de eliminación en conversations
SELECT 
    'POLÍTICAS DELETE CONVERSATIONS' as tipo,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'conversations' 
  AND cmd = 'DELETE'
ORDER BY policyname;

-- Verificar políticas de eliminación en messages
SELECT 
    'POLÍTICAS DELETE MESSAGES' as tipo,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages' 
  AND cmd = 'DELETE'
ORDER BY policyname;

-- =====================================================
-- CREAR POLÍTICAS DE ELIMINACIÓN SI NO EXISTEN
-- =====================================================

-- Política para que admins puedan eliminar conversaciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
          AND policyname = 'admins_can_delete_conversations'
    ) THEN
        CREATE POLICY "admins_can_delete_conversations" ON conversations
        FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                  AND profiles.role IN ('admin', 'moderator')
            )
        );
        
        RAISE NOTICE 'Política de eliminación para admins creada en conversations';
    ELSE
        RAISE NOTICE 'Política de eliminación para admins ya existe en conversations';
    END IF;
END $$;

-- Política para que usuarios puedan eliminar sus propias conversaciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
          AND policyname = 'users_can_delete_own_conversations'
    ) THEN
        CREATE POLICY "users_can_delete_own_conversations" ON conversations
        FOR DELETE
        TO authenticated
        USING (user_id = auth.uid());
        
        RAISE NOTICE 'Política de eliminación para usuarios creada en conversations';
    ELSE
        RAISE NOTICE 'Política de eliminación para usuarios ya existe en conversations';
    END IF;
END $$;

-- Política para que admins puedan eliminar mensajes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
          AND policyname = 'admins_can_delete_messages'
    ) THEN
        CREATE POLICY "admins_can_delete_messages" ON messages
        FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                  AND profiles.role IN ('admin', 'moderator')
            )
        );
        
        RAISE NOTICE 'Política de eliminación para admins creada en messages';
    ELSE
        RAISE NOTICE 'Política de eliminación para admins ya existe en messages';
    END IF;
END $$;

-- Política para que usuarios puedan eliminar sus propios mensajes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
          AND policyname = 'users_can_delete_own_messages'
    ) THEN
        CREATE POLICY "users_can_delete_own_messages" ON messages
        FOR DELETE
        TO authenticated
        USING (sender_id = auth.uid());
        
        RAISE NOTICE 'Política de eliminación para usuarios creada en messages';
    ELSE
        RAISE NOTICE 'Política de eliminación para usuarios ya existe en messages';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================

-- Ver todas las políticas de eliminación
SELECT 
    'TODAS LAS POLÍTICAS DELETE' as tipo,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE cmd = 'DELETE'
ORDER BY tablename, policyname;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

SELECT 'VERIFICACIÓN COMPLETA: Políticas de eliminación configuradas' as status;
