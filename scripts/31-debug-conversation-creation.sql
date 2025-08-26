-- Script de diagnóstico para problemas de creación de conversaciones
-- Ejecutar para identificar el problema específico

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLA conversations
-- =====================================================

DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUCTURA COMPLETA DE TABLA conversations ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default, ordinal_position FROM information_schema.columns WHERE table_name = 'conversations' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE 'Columna %: % - % (Nullable: %, Default: %)', col.ordinal_position, col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
END $$;

-- =====================================================
-- PASO 2: VERIFICAR CONSTRAINTS Y FOREIGN KEYS
-- =====================================================

DO $$
DECLARE
    constr RECORD;
BEGIN
    RAISE NOTICE '=== CONSTRAINTS DE TABLA conversations ===';
    
    FOR constr IN SELECT tc.constraint_name, tc.constraint_type, tc.table_name, kcu.column_name, tc.is_deferrable, tc.initially_deferred FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'conversations' AND tc.table_schema = 'public' ORDER BY tc.constraint_name LOOP
        RAISE NOTICE 'Constraint: % - Tipo: % - Columna: % (Deferrable: %, Initially: %)', constr.constraint_name, constr.constraint_type, constr.column_name, constr.is_deferrable, constr.initially_deferred;
    END LOOP;
END $$;

-- =====================================================
-- PASO 3: VERIFICAR FOREIGN KEY A chat_categories
-- =====================================================

DO $$
DECLARE
    fk RECORD;
BEGIN
    RAISE NOTICE '=== FOREIGN KEYS DE TABLA conversations ===';
    
    FOR fk IN SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = 'conversations' LOOP
        RAISE NOTICE 'FK: % - Columna: % - Referencia: %.%', fk.constraint_name, fk.column_name, fk.foreign_table_name, fk.foreign_column_name;
    END LOOP;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR TABLA chat_categories
-- =====================================================

DO $$
DECLARE
    cat RECORD;
    cat_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAR TABLA chat_categories ===';
    
    -- Verificar si existe la tabla
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_categories' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabla chat_categories existe';
        
        -- Contar categorías
        SELECT COUNT(*) INTO cat_count FROM chat_categories;
        RAISE NOTICE 'Total de categorías: %', cat_count;
        
        -- Mostrar categorías disponibles
        IF cat_count > 0 THEN
            FOR cat IN SELECT id, name, description FROM chat_categories ORDER BY sort_order LOOP
                RAISE NOTICE '  - %: % (%)', cat.id, cat.name, cat.description;
            END LOOP;
        ELSE
            RAISE NOTICE '❌ No hay categorías en chat_categories';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabla chat_categories NO existe';
    END IF;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    pol RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== POLÍTICAS RLS PARA conversations ===';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'conversations';
    
    RAISE NOTICE 'Total de políticas RLS para conversations: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT policyname, permissive, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' ORDER BY policyname LOOP
            RAISE NOTICE 'Política: % - Tipo: % - Comando: % - Roles: %', pol.policyname, pol.permissive, pol.cmd, pol.roles;
            RAISE NOTICE '  Condición: %', pol.qual;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay políticas RLS para conversations';
    END IF;
END $$;

-- =====================================================
-- PASO 6: VERIFICAR PERMISOS DE USUARIO ACTUAL
-- =====================================================

DO $$
DECLARE
    current_user_role TEXT;
    current_user_id TEXT;
BEGIN
    RAISE NOTICE '=== PERMISOS DE USUARIO ACTUAL ===';
    
    -- Obtener información del usuario actual
    SELECT current_setting('role') INTO current_user_role;
    SELECT current_setting('request.jwt.claims')::json->>'sub' INTO current_user_id;
    
    RAISE NOTICE 'Rol actual: %', current_user_role;
    RAISE NOTICE 'ID de usuario actual: %', current_user_id;
    
    -- Verificar si el usuario actual puede insertar en conversations
    BEGIN
        PERFORM 1 FROM conversations LIMIT 1;
        RAISE NOTICE '✅ Usuario puede LEER conversations';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Usuario NO puede LEER conversations: %', SQLERRM;
    END;
    
    -- Verificar si el usuario actual puede insertar en conversation_participants
    BEGIN
        PERFORM 1 FROM conversation_participants LIMIT 1;
        RAISE NOTICE '✅ Usuario puede LEER conversation_participants';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Usuario NO puede LEER conversation_participants: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 7: INTENTAR INSERCIÓN MANUAL (SOLO PARA DIAGNÓSTICO)
-- =====================================================

DO $$
DECLARE
    test_conv_id UUID;
    test_part_id UUID;
    test_msg_id UUID;
BEGIN
    RAISE NOTICE '=== PRUEBA DE INSERCIÓN MANUAL ===';
    
    -- Intentar insertar una conversación de prueba
    BEGIN
        INSERT INTO conversations (id, user_id, title, description, priority, status, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000', -- ID de prueba
            'Conversación de prueba',
            'Descripción de prueba',
            'normal',
            'open',
            NOW(),
            NOW()
        ) RETURNING id INTO test_conv_id;
        
        RAISE NOTICE '✅ Inserción en conversations exitosa, ID: %', test_conv_id;
        
        -- Limpiar la inserción de prueba
        DELETE FROM conversations WHERE id = test_conv_id;
        RAISE NOTICE '✅ Conversación de prueba eliminada';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error al insertar en conversations: %', SQLERRM;
            RAISE NOTICE '  Código de error: %', SQLSTATE;
    END;
END $$;

-- =====================================================
-- PASO 8: VERIFICAR TRIGGERS
-- =====================================================

DO $$
DECLARE
    trig RECORD;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '=== TRIGGERS EN conversations ===';
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND event_object_table = 'conversations';
    
    RAISE NOTICE 'Total de triggers en conversations: %', trigger_count;
    
    IF trigger_count > 0 THEN
        FOR trig IN SELECT trigger_name, event_manipulation, action_timing, action_statement FROM information_schema.triggers WHERE trigger_schema = 'public' AND event_object_table = 'conversations' ORDER BY trigger_name LOOP
            RAISE NOTICE 'Trigger: % - Evento: % - Timing: %', trig.trigger_name, trig.event_manipulation, trig.action_timing;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay triggers en conversations';
    END IF;
END $$;

-- =====================================================
-- PASO 9: VERIFICAR CONSTRAINT DE STATUS (PROBLEMA IDENTIFICADO)
-- =====================================================

DO $$
DECLARE
    check_constraint RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAR CONSTRAINT DE STATUS ===';
    
    -- Buscar el constraint específico que está causando el problema
    FOR check_constraint IN SELECT conname, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid = 'conversations'::regclass AND contype = 'c' AND conname LIKE '%status%' LOOP
        RAISE NOTICE 'Constraint de status: %', check_constraint.conname;
        RAISE NOTICE 'Definición: %', check_constraint.definition;
    END LOOP;
    
    -- Verificar qué valores están permitidos para status
    RAISE NOTICE 'Valores permitidos para status:';
    RAISE NOTICE '  - Verificar si "open" está en la lista de valores permitidos';
    RAISE NOTICE '  - Verificar si hay un enum o check constraint específico';
END $$;

-- =====================================================
-- RESUMEN DE DIAGNÓSTICO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DEL DIAGNÓSTICO ===';
    RAISE NOTICE '✅ Si todas las verificaciones anteriores son exitosas, la estructura está correcta';
    RAISE NOTICE '❌ Si hay errores, revisar:';
    RAISE NOTICE '   - Estructura de la tabla conversations';
    RAISE NOTICE '   - Políticas RLS y permisos';
    RAISE NOTICE '   - Foreign keys y constraints';
    RAISE NOTICE '   - Triggers y funciones';
    RAISE NOTICE '';
    RAISE NOTICE 'Para resolver el problema:';
    RAISE NOTICE '1. Verificar que chat_categories tenga datos';
    RAISE NOTICE '2. Verificar que las políticas RLS permitan INSERT';
    RAISE NOTICE '3. Verificar que el usuario tenga permisos';
    RAISE NOTICE '4. Revisar los logs de error completos en la consola';
END $$;
