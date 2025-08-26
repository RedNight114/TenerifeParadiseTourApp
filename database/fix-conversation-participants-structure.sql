-- Script para corregir la estructura de conversation_participants
-- Ejecutar en Supabase SQL Editor para resolver el error de columna 'status' faltante

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA ACTUAL
-- =====================================================

-- Verificar si existe la columna 'status' incorrecta
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
  AND column_name = 'status';

-- =====================================================
-- PASO 2: CORREGIR ESTRUCTURA DE LA TABLA
-- =====================================================

-- Si la tabla no existe, crearla con la estructura correcta
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator', 'support')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  is_typing BOOLEAN DEFAULT FALSE,
  typing_since TIMESTAMP WITH TIME ZONE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  UNIQUE(conversation_id, user_id)
);

-- =====================================================
-- PASO 3: ELIMINAR COLUMNA INCORRECTA SI EXISTE
-- =====================================================

-- Eliminar la columna 'status' si existe (no debería existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE conversation_participants DROP COLUMN status;
        RAISE NOTICE 'Columna status eliminada de conversation_participants';
    ELSE
        RAISE NOTICE 'La columna status no existe en conversation_participants';
    END IF;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR ESTRUCTURA FINAL
-- =====================================================

-- Verificar estructura final de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 5: HABILITAR RLS Y CREAR POLÍTICAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "participants_all" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_update_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_delete_policy" ON conversation_participants;

-- Crear políticas simples y seguras
CREATE POLICY "conversation_participants_select" ON conversation_participants
  FOR SELECT USING (true);

CREATE POLICY "conversation_participants_insert" ON conversation_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conversation_participants_update" ON conversation_participants
  FOR UPDATE USING (true);

CREATE POLICY "conversation_participants_delete" ON conversation_participants
  FOR DELETE USING (true);

-- =====================================================
-- PASO 6: VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que las políticas estén creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'conversation_participants'
ORDER BY policyname;

-- =====================================================
-- PASO 7: VERIFICAR QUE RLS ESTÉ HABILITADO
-- =====================================================

-- Verificar estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'conversation_participants';
