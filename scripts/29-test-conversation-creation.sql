-- Script de prueba para verificar la creación de conversaciones
-- Ejecutar después de crear todas las tablas del chat

-- =====================================================
-- PASO 1: VERIFICAR QUE LAS TABLAS EXISTEN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO EXISTENCIA DE TABLAS ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE '✅ Tabla conversations existe';
    ELSE
        RAISE NOTICE '❌ Tabla conversations NO existe';
        RETURN;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        RAISE NOTICE '✅ Tabla conversation_participants existe';
    ELSE
        RAISE NOTICE '❌ Tabla conversation_participants NO existe';
        RETURN;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE '✅ Tabla messages existe';
    ELSE
        RAISE NOTICE '❌ Tabla messages NO existe';
        RETURN;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_categories') THEN
        RAISE NOTICE '✅ Tabla chat_categories existe';
    ELSE
        RAISE NOTICE '❌ Tabla chat_categories NO existe';
        RETURN;
    END IF;
END $$;

-- =====================================================
-- PASO 2: VERIFICAR CATEGORÍAS DISPONIBLES
-- =====================================================

DO $$
DECLARE
    cat RECORD;
BEGIN
    RAISE NOTICE '=== CATEGORÍAS DISPONIBLES ===';
    
    FOR cat IN SELECT id, name, description FROM chat_categories ORDER BY sort_order LOOP
        RAISE NOTICE 'Categoría: % - % (%)', cat.id, cat.name, cat.description;
    END LOOP;
END $$;

-- =====================================================
-- PASO 3: VERIFICAR USUARIOS DISPONIBLES
-- =====================================================

DO $$
DECLARE
    usr RECORD;
    user_count INTEGER;
BEGIN
    RAISE NOTICE '=== USUARIOS DISPONIBLES ===';
    
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Total de usuarios: %', user_count;
    
    IF user_count > 0 THEN
        FOR usr IN SELECT id, email FROM auth.users LIMIT 5 LOOP
            RAISE NOTICE 'Usuario: % - %', usr.id, usr.email;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay usuarios disponibles';
    END IF;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    pol RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== POLÍTICAS RLS ===';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'conversation_participants', 'messages');
    
    RAISE NOTICE 'Total de políticas: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT tablename, policyname, permissive, cmd, qual FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('conversations', 'conversation_participants', 'messages') ORDER BY tablename, policyname LOOP
            RAISE NOTICE 'Política: % - % (% on %)', pol.tablename, pol.policyname, pol.cmd, pol.permissive;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay políticas RLS configuradas';
    END IF;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR PERMISOS DE USUARIO
-- =====================================================

DO $$
DECLARE
    current_user_role TEXT;
BEGIN
    RAISE NOTICE '=== PERMISOS DE USUARIO ACTUAL ===';
    
    -- Obtener el rol del usuario actual
    SELECT current_setting('role') INTO current_user_role;
    RAISE NOTICE 'Rol actual: %', current_user_role;
    
    -- Verificar si el usuario actual puede leer las tablas
    BEGIN
        PERFORM 1 FROM conversations LIMIT 1;
        RAISE NOTICE '✅ Usuario puede leer conversations';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Usuario NO puede leer conversations: %', SQLERRM;
    END;
    
    BEGIN
        PERFORM 1 FROM conversation_participants LIMIT 1;
        RAISE NOTICE '✅ Usuario puede leer conversation_participants';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Usuario NO puede leer conversation_participants: %', SQLERRM;
    END;
    
    BEGIN
        PERFORM 1 FROM messages LIMIT 1;
        RAISE NOTICE '✅ Usuario puede leer messages';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Usuario NO puede leer messages: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 6: VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUCTURA DE TABLA conversations ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'conversations' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE 'Columna: % - % - Nullable: % - Default: %', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUCTURA DE TABLA conversation_participants ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'conversation_participants' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE 'Columna: % - % - Nullable: % - Default: %', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUCTURA DE TABLA messages ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'messages' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE 'Columna: % - % - Nullable: % - Default: %', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE VERIFICACIÓN ===';
    RAISE NOTICE '✅ Si todas las verificaciones anteriores son exitosas, las tablas están configuradas correctamente';
    RAISE NOTICE '❌ Si hay errores, revisar los scripts de migración';
    RAISE NOTICE '';
    RAISE NOTICE 'Para probar la creación de conversaciones:';
    RAISE NOTICE '1. Ejecutar este script desde la aplicación';
    RAISE NOTICE '2. Verificar que no hay errores de permisos';
    RAISE NOTICE '3. Intentar crear una conversación desde la UI';
    RAISE NOTICE '';
    RAISE NOTICE 'Si hay problemas de permisos:';
    RAISE NOTICE '- Verificar que las políticas RLS están configuradas correctamente';
    RAISE NOTICE '- Verificar que el usuario autenticado tiene acceso a las tablas';
    RAISE NOTICE '- Verificar que las funciones de trigger están funcionando';
END $$;

