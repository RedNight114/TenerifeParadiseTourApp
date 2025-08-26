-- Script de prueba para verificar la funcionalidad del chat
-- Ejecutar después de crear todas las tablas del chat

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICANDO ESTRUCTURA DE TABLAS ===';
    
    -- Contar tablas del chat
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    -- Contar vistas del chat
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('conversation_summary', 'message_summary', 'participant_summary');
    
    -- Contar funciones del chat
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_typing_indicators', 'update_user_online_status');
    
    RAISE NOTICE 'Tablas del chat: %', table_count;
    RAISE NOTICE 'Vistas del chat: %', view_count;
    RAISE NOTICE 'Funciones del chat: %', function_count;
    
    IF table_count = 7 AND view_count = 3 AND function_count = 4 THEN
        RAISE NOTICE '✅ Estructura del chat correcta';
    ELSE
        RAISE NOTICE '❌ Problema con la estructura del chat';
    END IF;
END $$;

-- =====================================================
-- PASO 2: VERIFICAR CATEGORÍAS DE CHAT
-- =====================================================

DO $$
DECLARE
    category_count INTEGER;
    cat RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO CATEGORÍAS DE CHAT ===';
    
    SELECT COUNT(*) INTO category_count FROM chat_categories;
    RAISE NOTICE 'Categorías de chat disponibles: %', category_count;
    
    IF category_count > 0 THEN
        RAISE NOTICE '✅ Categorías de chat disponibles';
        RAISE NOTICE 'Categorías:';
        FOR cat IN SELECT id, name, description FROM chat_categories ORDER BY sort_order LOOP
            RAISE NOTICE '  - %: % (%)', cat.id, cat.name, cat.description;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay categorías de chat';
    END IF;
END $$;

-- =====================================================
-- PASO 3: VERIFICAR USUARIOS DE PRUEBA
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    usr RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO USUARIOS ===';
    
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    RAISE NOTICE 'Usuarios en auth.users: %', user_count;
    RAISE NOTICE 'Perfiles en profiles: %', profile_count;
    
    IF user_count > 0 AND profile_count > 0 THEN
        RAISE NOTICE '✅ Usuarios disponibles para pruebas';
        
        -- Mostrar algunos usuarios de ejemplo
        RAISE NOTICE 'Usuarios de ejemplo:';
        FOR usr IN SELECT id, email FROM auth.users LIMIT 3 LOOP
            RAISE NOTICE '  - %: %', usr.id, usr.email;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay usuarios para probar el chat';
    END IF;
END $$;

-- =====================================================
-- PASO 4: VERIFICAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
    pol RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS RLS ===';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'messages', 'conversation_participants');
    
    RAISE NOTICE 'Políticas RLS activas: %', policy_count;
    
    IF policy_count > 0 THEN
        RAISE NOTICE '✅ Políticas RLS configuradas';
        
        -- Mostrar políticas
        RAISE NOTICE 'Políticas:';
        FOR pol IN SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('conversations', 'messages', 'conversation_participants') LOOP
            RAISE NOTICE '  - %: % (% on %)', pol.tablename, pol.policyname, pol.cmd, pol.roles;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay políticas RLS configuradas';
    END IF;
END $$;

-- =====================================================
-- PASO 5: VERIFICAR VISTAS
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
-- PASO 6: VERIFICAR FUNCIONES
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
-- PASO 7: VERIFICAR TRIGGERS
-- =====================================================

DO $$
DECLARE
    trigger_count INTEGER;
    trig RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TRIGGERS ===';
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name LIKE '%chat%';
    
    RAISE NOTICE 'Triggers del chat: %', trigger_count;
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Triggers configurados';
        
        -- Mostrar triggers
        RAISE NOTICE 'Triggers:';
        FOR trig IN SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE '%chat%' LOOP
            RAISE NOTICE '  - %: % on %', trig.trigger_name, trig.event_manipulation, trig.event_object_table;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay triggers configurados';
    END IF;
END $$;

-- =====================================================
-- PASO 8: VERIFICAR ÍNDICES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
    idx RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO ÍNDICES ===';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'messages', 'conversation_participants');
    
    RAISE NOTICE 'Índices del chat: %', index_count;
    
    IF index_count > 0 THEN
        RAISE NOTICE '✅ Índices configurados';
        
        -- Mostrar índices importantes
        RAISE NOTICE 'Índices principales:';
        FOR idx IN SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('conversations', 'messages', 'conversation_participants') ORDER BY tablename, indexname LOOP
            RAISE NOTICE '  - %: %', idx.tablename, idx.indexname;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No hay índices configurados';
    END IF;
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE VERIFICACIÓN ===';
    RAISE NOTICE '✅ Si todas las verificaciones anteriores son exitosas, el chat está listo';
    RAISE NOTICE '❌ Si hay errores, revisar los scripts de migración';
    RAISE NOTICE '';
    RAISE NOTICE 'Para probar el chat:';
    RAISE NOTICE '1. Crear una conversación desde la aplicación';
    RAISE NOTICE '2. Enviar un mensaje';
    RAISE NOTICE '3. Verificar que aparezca en la base de datos';
    RAISE NOTICE '';
    RAISE NOTICE 'Si hay problemas, revisar:';
    RAISE NOTICE '- Logs de la aplicación';
    RAISE NOTICE '- Políticas RLS';
    RAISE NOTICE '- Permisos de usuario';
    RAISE NOTICE '- Estructura de las tablas';
END $$;
