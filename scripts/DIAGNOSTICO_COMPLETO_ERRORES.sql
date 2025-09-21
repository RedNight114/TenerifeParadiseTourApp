-- =====================================================
-- DIAGNÓSTICO COMPLETO DE ERRORES Y WARNINGS
-- =====================================================
-- 
-- Este script identifica todos los errores y warnings
-- en el sistema de chat y proporciona soluciones.
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ERRORES EN TRIGGERS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE TRIGGERS ===';
    RAISE NOTICE '';
END $$;

-- Verificar triggers y sus funciones
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.event_manipulation,
    t.action_timing,
    t.action_statement,
    CASE 
        WHEN f.routine_name IS NOT NULL THEN '✅ FUNCIÓN EXISTE'
        ELSE '❌ FUNCIÓN NO EXISTE'
    END as estado_funcion,
    CASE 
        WHEN f.routine_type = 'FUNCTION' AND f.data_type = 'trigger' THEN '✅ TIPO CORRECTO'
        WHEN f.routine_type = 'FUNCTION' THEN '⚠️ TIPO INCORRECTO'
        ELSE '❌ NO ES FUNCIÓN'
    END as tipo_funcion
FROM information_schema.triggers t
LEFT JOIN information_schema.routines f ON f.routine_name = REGEXP_REPLACE(t.action_statement, 'EXECUTE FUNCTION (.+)\\(\\)', '\1')
WHERE t.trigger_schema = 'public' 
AND t.trigger_name IN ('trigger_update_conversation_updated_at', 'trigger_create_chat_notification')
ORDER BY t.event_object_table, t.trigger_name;

-- =====================================================
-- 2. VERIFICAR ERRORES EN FUNCIONES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE FUNCIONES ===';
    RAISE NOTICE '';
END $$;

-- Verificar funciones del sistema de chat
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    external_language,
    is_deterministic,
    CASE 
        WHEN routine_name IN ('update_conversation_updated_at', 'create_chat_notification') AND data_type = 'trigger' THEN '✅ FUNCIÓN TRIGGER CORRECTA'
        WHEN routine_name IN ('cleanup_expired_chat_data', 'extend_conversation_retention') AND data_type = 'void' THEN '✅ FUNCIÓN VOID CORRECTA'
        ELSE '⚠️ TIPO INESPERADO'
    END as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')
ORDER BY routine_name;

-- =====================================================
-- 3. VERIFICAR ERRORES EN POLÍTICAS RLS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE POLÍTICAS RLS ===';
    RAISE NOTICE '';
END $$;

-- Verificar políticas RLS problemáticas
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NULL AND with_check IS NULL THEN '❌ SIN RESTRICCIÓN'
        WHEN qual IS NOT NULL AND with_check IS NOT NULL THEN '⚠️ CON AMBAS RESTRICCIONES'
        WHEN qual IS NOT NULL THEN '✅ CON QUAL'
        WHEN with_check IS NOT NULL THEN '✅ CON WITH_CHECK'
        ELSE '⚠️ DESCONOCIDO'
    END as estado_restriccion,
    CASE 
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '✅ USA AUTH.UID'
        ELSE '⚠️ NO USA AUTH.UID'
    END as usa_auth_uid
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY tablename, policyname;

-- =====================================================
-- 4. VERIFICAR ERRORES EN VISTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE VISTAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar vistas del sistema
SELECT 
    table_name as vista,
    CASE 
        WHEN table_name IN ('conversation_summary', 'message_summary', 'participant_summary') THEN '✅ VISTA ESPERADA'
        ELSE '⚠️ VISTA NO ESPERADA'
    END as estado
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('conversation_summary', 'message_summary', 'participant_summary')
ORDER BY table_name;

-- =====================================================
-- 5. VERIFICAR ERRORES EN TABLAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE TABLAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar tablas del sistema
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings') THEN '✅ TABLA ESPERADA'
        ELSE '⚠️ TABLA NO ESPERADA'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY table_name;

-- =====================================================
-- 6. VERIFICAR ERRORES EN CAMPOS DE RETENCIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE CAMPOS DE RETENCIÓN ===';
    RAISE NOTICE '';
END $$;

-- Verificar campos de retención
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('expires_at', 'retention_policy') THEN '✅ CAMPO DE RETENCIÓN'
        ELSE '⚠️ CAMPO NO DE RETENCIÓN'
    END as estado
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'chat_notifications', 'chat_attachments', 'typing_indicators')
AND column_name IN ('expires_at', 'retention_policy')
ORDER BY table_name, column_name;

-- =====================================================
-- 7. VERIFICAR ERRORES EN ÍNDICES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 DIAGNÓSTICO DE ÍNDICES ===';
    RAISE NOTICE '';
END $$;

-- Verificar índices importantes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ ÍNDICE OPTIMIZADO'
        ELSE '⚠️ ÍNDICE NO OPTIMIZADO'
    END as estado
FROM pg_indexes 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. PROBAR FUNCIONES PARA DETECTAR ERRORES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 PRUEBAS DE FUNCIONES ===';
    RAISE NOTICE '';
END $$;

-- Probar función de limpieza
DO $$
BEGIN
    BEGIN
        PERFORM cleanup_expired_chat_data();
        RAISE NOTICE '✅ cleanup_expired_chat_data() ejecutada correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en cleanup_expired_chat_data(): %', SQLERRM;
    END;
END $$;

-- Probar función de extensión de retención
DO $$
BEGIN
    BEGIN
        PERFORM extend_conversation_retention('00000000-0000-0000-0000-000000000000'::uuid, 7);
        RAISE NOTICE '✅ extend_conversation_retention() ejecutada correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en extend_conversation_retention(): %', SQLERRM;
    END;
END $$;

-- =====================================================
-- 9. RESUMEN DE ERRORES ENCONTRADOS
-- =====================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_functions INTEGER;
    total_views INTEGER;
    total_policies INTEGER;
    total_triggers INTEGER;
    total_indexes INTEGER;
    errors_found INTEGER := 0;
BEGIN
    -- Contar elementos del sistema
    SELECT COUNT(*) INTO total_tables 
    FROM information_schema.tables 
    WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
    AND table_schema = 'public';
    
    SELECT COUNT(*) INTO total_functions 
    FROM information_schema.routines 
    WHERE routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')
    AND routine_schema = 'public';
    
    SELECT COUNT(*) INTO total_views 
    FROM information_schema.views 
    WHERE table_name IN ('conversation_summary', 'message_summary', 'participant_summary')
    AND table_schema = 'public';
    
    SELECT COUNT(*) INTO total_policies 
    FROM pg_policies 
    WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    SELECT COUNT(*) INTO total_triggers 
    FROM information_schema.triggers 
    WHERE trigger_name IN ('trigger_update_conversation_updated_at', 'trigger_create_chat_notification')
    AND trigger_schema = 'public';
    
    SELECT COUNT(*) INTO total_indexes 
    FROM pg_indexes 
    WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators')
    AND schemaname = 'public';
    
    -- Calcular errores
    IF total_tables < 7 THEN errors_found := errors_found + 1; END IF;
    IF total_functions < 4 THEN errors_found := errors_found + 1; END IF;
    IF total_views < 3 THEN errors_found := errors_found + 1; END IF;
    IF total_policies < 15 THEN errors_found := errors_found + 1; END IF;
    IF total_triggers < 2 THEN errors_found := errors_found + 1; END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 📋 RESUMEN DE DIAGNÓSTICO ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ELEMENTOS DEL SISTEMA:';
    RAISE NOTICE '   - Tablas: %/7', total_tables;
    RAISE NOTICE '   - Funciones: %/4', total_functions;
    RAISE NOTICE '   - Vistas: %/3', total_views;
    RAISE NOTICE '   - Políticas RLS: %', total_policies;
    RAISE NOTICE '   - Triggers: %/2', total_triggers;
    RAISE NOTICE '   - Índices: %', total_indexes;
    RAISE NOTICE '';
    
    IF errors_found = 0 THEN
        RAISE NOTICE '🎉 ¡SISTEMA SIN ERRORES DETECTADOS!';
        RAISE NOTICE '✅ Todas las verificaciones pasaron correctamente';
    ELSE
        RAISE NOTICE '⚠️ ERRORES DETECTADOS: %', errors_found;
        RAISE NOTICE '❌ Revisar elementos faltantes o mal configurados';
    END IF;
    
    RAISE NOTICE '';
END $$;
