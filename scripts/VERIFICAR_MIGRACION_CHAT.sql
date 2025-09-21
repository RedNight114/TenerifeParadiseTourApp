-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE MIGRACIÓN DEL SISTEMA DE CHAT
-- =====================================================
-- 
-- Este script verifica que la migración del sistema de chat
-- se ejecutó correctamente y todas las funcionalidades están disponibles.
--
-- 📋 INSTRUCCIONES:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Revisar todos los resultados
-- 3. Si hay errores, ejecutar el script de migración nuevamente
-- =====================================================

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 VERIFICANDO ESTRUCTURA DE TABLAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar que las tablas principales existen
SELECT 
    'conversations' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'messages' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'conversation_participants' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'chat_notifications' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_notifications') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'chat_attachments' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_attachments') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'typing_indicators' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'typing_indicators') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'chat_settings' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_settings') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado;

-- =====================================================
-- PASO 2: VERIFICAR CAMPOS DE RETENCIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 📅 VERIFICANDO CAMPOS DE RETENCIÓN ===';
    RAISE NOTICE '';
END $$;

-- Verificar campos de retención en conversations
SELECT 
    'conversations' as tabla,
    'expires_at' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'expires_at'
        ) 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'conversations' as tabla,
    'retention_policy' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'retention_policy'
        ) 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'messages' as tabla,
    'expires_at' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'expires_at'
        ) 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'messages' as tabla,
    'retention_policy' as campo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'retention_policy'
        ) 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as estado;

-- =====================================================
-- PASO 3: VERIFICAR ÍNDICES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 📊 VERIFICANDO ÍNDICES ===';
    RAISE NOTICE '';
END $$;

-- Verificar índices importantes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators')
ORDER BY tablename, indexname;

-- =====================================================
-- PASO 4: VERIFICAR FUNCIONES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ⚙️ VERIFICANDO FUNCIONES ===';
    RAISE NOTICE '';
END $$;

-- Verificar funciones importantes
SELECT 
    routine_name as funcion,
    routine_type as tipo,
    CASE 
        WHEN routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')
        THEN '✅ EXISTE'
        ELSE '⚠️ NO ESPERADA'
    END as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')
ORDER BY routine_name;

-- =====================================================
-- PASO 5: VERIFICAR VISTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 👁️ VERIFICANDO VISTAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar vistas optimizadas
SELECT 
    table_name as vista,
    CASE 
        WHEN table_name IN ('conversation_summary', 'message_summary', 'participant_summary')
        THEN '✅ EXISTE'
        ELSE '⚠️ NO ESPERADA'
    END as estado
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('conversation_summary', 'message_summary', 'participant_summary')
ORDER BY table_name;

-- =====================================================
-- PASO 6: VERIFICAR ROW LEVEL SECURITY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔒 VERIFICANDO ROW LEVEL SECURITY ===';
    RAISE NOTICE '';
END $$;

-- Verificar RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity = true THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END as estado
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 7: VERIFICAR TRIGGERS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔄 VERIFICANDO TRIGGERS ===';
    RAISE NOTICE '';
END $$;

-- Verificar triggers importantes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_update_conversation_updated_at', 'trigger_create_chat_notification')
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- PASO 8: VERIFICAR DATOS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 📊 VERIFICANDO DATOS ===';
    RAISE NOTICE '';
END $$;

-- Contar registros en cada tabla
SELECT 
    'conversations' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    COUNT(CASE WHEN retention_policy IS NOT NULL THEN 1 END) as con_politica_retencion
FROM conversations
UNION ALL
SELECT 
    'messages' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    COUNT(CASE WHEN retention_policy IS NOT NULL THEN 1 END) as con_politica_retencion
FROM messages
UNION ALL
SELECT 
    'conversation_participants' as tabla,
    COUNT(*) as total_registros,
    0 as con_fecha_expiracion,
    0 as con_politica_retencion
FROM conversation_participants
UNION ALL
SELECT 
    'chat_notifications' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    0 as con_politica_retencion
FROM chat_notifications
UNION ALL
SELECT 
    'chat_attachments' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    0 as con_politica_retencion
FROM chat_attachments
UNION ALL
SELECT 
    'typing_indicators' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    0 as con_politica_retencion
FROM typing_indicators
UNION ALL
SELECT 
    'chat_settings' as tabla,
    COUNT(*) as total_registros,
    0 as con_fecha_expiracion,
    0 as con_politica_retencion
FROM chat_settings;

-- =====================================================
-- PASO 9: PROBAR FUNCIONES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 🧪 PROBANDO FUNCIONES ===';
    RAISE NOTICE '';
END $$;

-- Probar función de limpieza (no debería dar error)
DO $$
BEGIN
    PERFORM cleanup_expired_chat_data();
    RAISE NOTICE '✅ Función cleanup_expired_chat_data() ejecutada correctamente';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en cleanup_expired_chat_data(): %', SQLERRM;
END $$;

-- =====================================================
-- PASO 10: PROBAR VISTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== 👁️ PROBANDO VISTAS ===';
    RAISE NOTICE '';
END $$;

-- Probar vista conversation_summary
DO $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result FROM conversation_summary;
    RAISE NOTICE '✅ Vista conversation_summary: % registros', count_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en conversation_summary: %', SQLERRM;
END $$;

-- Probar vista message_summary
DO $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result FROM message_summary;
    RAISE NOTICE '✅ Vista message_summary: % registros', count_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en message_summary: %', SQLERRM;
END $$;

-- Probar vista participant_summary
DO $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result FROM participant_summary;
    RAISE NOTICE '✅ Vista participant_summary: % registros', count_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en participant_summary: %', SQLERRM;
END $$;

-- =====================================================
-- PASO 11: VERIFICAR CONFIGURACIÓN INICIAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ⚙️ VERIFICANDO CONFIGURACIÓN INICIAL ===';
    RAISE NOTICE '';
END $$;

-- Verificar configuraciones de chat para usuarios
SELECT 
    COUNT(*) as total_configuraciones,
    COUNT(CASE WHEN theme = 'light' THEN 1 END) as tema_claro,
    COUNT(CASE WHEN language = 'es' THEN 1 END) as idioma_espanol,
    COUNT(CASE WHEN notifications_enabled = true THEN 1 END) as notificaciones_habilitadas
FROM chat_settings;

-- =====================================================
-- PASO 12: RESUMEN FINAL
-- =====================================================

DO $$
DECLARE
    conversations_count INTEGER;
    messages_count INTEGER;
    participants_count INTEGER;
    notifications_count INTEGER;
    attachments_count INTEGER;
    typing_count INTEGER;
    settings_count INTEGER;
    total_tables INTEGER;
    total_functions INTEGER;
    total_views INTEGER;
    total_policies INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO conversations_count FROM conversations;
    SELECT COUNT(*) INTO messages_count FROM messages;
    SELECT COUNT(*) INTO participants_count FROM conversation_participants;
    SELECT COUNT(*) INTO notifications_count FROM chat_notifications;
    SELECT COUNT(*) INTO attachments_count FROM chat_attachments;
    SELECT COUNT(*) INTO typing_count FROM typing_indicators;
    SELECT COUNT(*) INTO settings_count FROM chat_settings;
    
    -- Contar elementos del sistema
    SELECT COUNT(*) INTO total_tables 
    FROM information_schema.tables 
    WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    SELECT COUNT(*) INTO total_functions 
    FROM information_schema.routines 
    WHERE routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention');
    
    SELECT COUNT(*) INTO total_views 
    FROM information_schema.views 
    WHERE table_name IN ('conversation_summary', 'message_summary', 'participant_summary');
    
    SELECT COUNT(*) INTO total_policies 
    FROM pg_policies 
    WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 📋 RESUMEN DE VERIFICACIÓN ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATOS:';
    RAISE NOTICE '   - Conversaciones: %', conversations_count;
    RAISE NOTICE '   - Mensajes: %', messages_count;
    RAISE NOTICE '   - Participantes: %', participants_count;
    RAISE NOTICE '   - Notificaciones: %', notifications_count;
    RAISE NOTICE '   - Archivos adjuntos: %', attachments_count;
    RAISE NOTICE '   - Indicadores de escritura: %', typing_count;
    RAISE NOTICE '   - Configuraciones: %', settings_count;
    RAISE NOTICE '';
    RAISE NOTICE '🏗️ ESTRUCTURA:';
    RAISE NOTICE '   - Tablas: %/7', total_tables;
    RAISE NOTICE '   - Funciones: %/4', total_functions;
    RAISE NOTICE '   - Vistas: %/3', total_views;
    RAISE NOTICE '   - Políticas RLS: %', total_policies;
    RAISE NOTICE '';
    
    -- Verificar si la migración fue exitosa
    IF total_tables = 7 AND total_functions = 4 AND total_views = 3 AND total_policies > 0 THEN
        RAISE NOTICE '🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';
        RAISE NOTICE '✅ Todas las tablas, funciones, vistas y políticas están en su lugar';
        RAISE NOTICE '✅ El sistema de chat mejorado está listo para usar';
    ELSE
        RAISE NOTICE '⚠️ MIGRACIÓN INCOMPLETA';
        RAISE NOTICE '❌ Faltan elementos del sistema';
        RAISE NOTICE '💡 Ejecuta el script de migración nuevamente';
    END IF;
    
    RAISE NOTICE '';
END $$;
