-- Script de prueba para verificar el flujo completo del chat
-- Ejecutar después de crear todas las tablas del chat

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA BÁSICA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO ESTRUCTURA BÁSICA ===';
    
    -- Verificar tablas principales
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
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabla profiles existe';
    ELSE
        RAISE NOTICE '❌ Tabla profiles NO existe';
        RETURN;
    END IF;
END $$;

-- =====================================================
-- PASO 2: VERIFICAR CATEGORÍAS Y USUARIOS
-- =====================================================

DO $$
DECLARE
    cat RECORD;
    usr RECORD;
    user_count INTEGER;
    category_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO CATEGORÍAS Y USUARIOS ===';
    
    -- Contar categorías
    SELECT COUNT(*) INTO category_count FROM chat_categories;
    RAISE NOTICE 'Categorías de chat disponibles: %', category_count;
    
    IF category_count > 0 THEN
        FOR cat IN SELECT id, name, description FROM chat_categories ORDER BY sort_order LOOP
            RAISE NOTICE '  - %: % (%)', cat.id, cat.name, cat.description;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay categorías de chat';
    END IF;
    
    -- Contar usuarios
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Usuarios en auth.users: %', user_count;
    
    IF user_count > 0 THEN
        FOR usr IN SELECT id, email FROM auth.users LIMIT 5 LOOP
            RAISE NOTICE '  - Usuario: % - %', usr.id, usr.email;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay usuarios disponibles';
    END IF;
    
    -- Verificar perfiles
    RAISE NOTICE 'Perfiles en profiles:';
    FOR usr IN SELECT id, email, role FROM profiles LIMIT 5 LOOP
        RAISE NOTICE '  - Perfil: % - % (Rol: %)', usr.id, usr.email, usr.role;
    END LOOP;
END $$;

-- =====================================================
-- PASO 3: VERIFICAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    pol RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS RLS ===';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'conversation_participants', 'messages');
    
    RAISE NOTICE 'Total de políticas RLS: %', policy_count;
    
    IF policy_count > 0 THEN
        FOR pol IN SELECT tablename, policyname, permissive, cmd, roles FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('conversations', 'conversation_participants', 'messages') ORDER BY tablename, policyname LOOP
            RAISE NOTICE '  - %: % (% on %) - Roles: %', pol.tablename, pol.policyname, pol.cmd, pol.roles;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay políticas RLS configuradas';
    END IF;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR VISTAS
-- =====================================================

DO $$
DECLARE
    view_works BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICANDO VISTAS ===';
    
    BEGIN
        -- Probar que las vistas se pueden consultar
        PERFORM 1 FROM conversation_summary LIMIT 1;
        PERFORM 1 FROM message_summary LIMIT 1;
        PERFORM 1 FROM participant_summary LIMIT 1;
        
        view_works := TRUE;
        RAISE NOTICE '✅ Todas las vistas funcionan correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            view_works := FALSE;
            RAISE NOTICE '❌ Error en las vistas: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR FUNCIONES
-- =====================================================

DO $$
DECLARE
    func_works BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICANDO FUNCIONES ===';
    
    BEGIN
        -- Probar que las funciones se pueden llamar
        PERFORM update_conversation_updated_at();
        PERFORM create_chat_notification();
        PERFORM cleanup_expired_typing_indicators();
        PERFORM update_user_online_status();
        
        func_works := TRUE;
        RAISE NOTICE '✅ Todas las funciones funcionan correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            func_works := FALSE;
            RAISE NOTICE '❌ Error en las funciones: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 6: VERIFICAR PERMISOS DE USUARIO
-- =====================================================

DO $$
DECLARE
    current_user_role TEXT;
    current_user_id TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICANDO PERMISOS DE USUARIO ===';
    
    -- Obtener información del usuario actual
    SELECT current_setting('role') INTO current_user_role;
    SELECT current_setting('request.jwt.claims')::json->>'sub' INTO current_user_id;
    
    RAISE NOTICE 'Rol actual: %', current_user_role;
    RAISE NOTICE 'ID de usuario actual: %', current_user_id;
    
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
-- PASO 7: VERIFICAR ESTRUCTURA DE COLUMNAS
-- =====================================================

DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUCTURA DE TABLA conversations ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'conversations' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE '  - %: % (Nullable: %, Default: %)', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUCTURA DE TABLA conversation_participants ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'conversation_participants' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE '  - %: % (Nullable: %, Default: %)', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUCTURA DE TABLA messages ===';
    
    FOR col IN SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'messages' AND table_schema = 'public' ORDER BY ordinal_position LOOP
        RAISE NOTICE '  - %: % (Nullable: %, Default: %)', col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
END $$;

-- =====================================================
-- PASO 8: VERIFICAR ÍNDICES
-- =====================================================

DO $$
DECLARE
    idx RECORD;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO ÍNDICES ===';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'conversation_participants', 'messages');
    
    RAISE NOTICE 'Total de índices: %', index_count;
    
    IF index_count > 0 THEN
        FOR idx IN SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('conversations', 'conversation_participants', 'messages') ORDER BY tablename, indexname LOOP
            RAISE NOTICE '  - %: %', idx.tablename, idx.indexname;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay índices configurados';
    END IF;
END $$;

-- =====================================================
-- PASO 9: VERIFICAR TRIGGERS
-- =====================================================

DO $$
DECLARE
    trig RECORD;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TRIGGERS ===';
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name LIKE '%chat%';
    
    RAISE NOTICE 'Total de triggers del chat: %', trigger_count;
    
    IF trigger_count > 0 THEN
        FOR trig IN SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE '%chat%' ORDER BY trigger_name LOOP
            RAISE NOTICE '  - %: % on %', trig.trigger_name, trig.event_manipulation, trig.event_object_table;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay triggers configurados';
    END IF;
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE VERIFICACIÓN ===';
    RAISE NOTICE '✅ Si todas las verificaciones anteriores son exitosas, el chat está listo para funcionar';
    RAISE NOTICE '❌ Si hay errores, revisar los scripts de migración';
    RAISE NOTICE '';
    RAISE NOTICE 'Para probar el flujo completo del chat:';
    RAISE NOTICE '1. Crear una conversación desde la aplicación (usuario)';
    RAISE NOTICE '2. Verificar que aparece en la base de datos';
    RAISE NOTICE '3. Asignar un administrador desde el panel admin';
    RAISE NOTICE '4. Enviar mensajes en ambas direcciones';
    RAISE NOTICE '';
    RAISE NOTICE 'Si hay problemas, revisar:';
    RAISE NOTICE '- Logs de la aplicación en la consola del navegador';
    RAISE NOTICE '- Políticas RLS y permisos de usuario';
    RAISE NOTICE '- Estructura de las tablas y vistas';
    RAISE NOTICE '- Funciones y triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema debe permitir:';
    RAISE NOTICE '- Usuarios crear conversaciones con administradores';
    RAISE NOTICE '- Administradores asignarse a conversaciones';
    RAISE NOTICE '- Envío de mensajes en ambas direcciones';
    RAISE NOTICE '- Visualización en tiempo real';
END $$;
