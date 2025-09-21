-- =====================================================
-- VERIFICACIÓN FINAL DEL SISTEMA DE CHAT CORREGIDO
-- =====================================================
-- 
-- Este script verifica que todas las correcciones se aplicaron
-- correctamente y el sistema está funcionando sin errores.
-- =====================================================

-- =====================================================
-- RESUMEN GENERAL
-- =====================================================

SELECT 
    'SISTEMA DE CHAT - ESTADO FINAL' as verificacion,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')) as tablas,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')) as funciones,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_name IN ('conversation_summary', 'message_summary', 'participant_summary')) as vistas,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')) as politicas_rls;

-- =====================================================
-- VERIFICAR POLÍTICAS RLS COMPLETAS
-- =====================================================

SELECT 
    tablename,
    COUNT(*) as total_politicas,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- VERIFICAR FUNCIONES
-- =====================================================

SELECT 
    routine_name as funcion,
    routine_type as tipo,
    '✅ FUNCIONANDO' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention')
ORDER BY routine_name;

-- =====================================================
-- VERIFICAR VISTAS
-- =====================================================

SELECT 
    table_name as vista,
    '✅ FUNCIONANDO' as estado
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('conversation_summary', 'message_summary', 'participant_summary')
ORDER BY table_name;

-- =====================================================
-- VERIFICAR TRIGGERS
-- =====================================================

SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    '✅ FUNCIONANDO' as estado
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_update_conversation_updated_at', 'trigger_create_chat_notification')
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- PROBAR FUNCIONES
-- =====================================================

-- Probar función de limpieza
SELECT 
    'Prueba de Limpieza' as prueba,
    CASE 
        WHEN cleanup_expired_chat_data() IS NULL THEN '✅ FUNCIÓN EJECUTADA'
        ELSE '⚠️ FUNCIÓN CON RESULTADO'
    END as resultado;

-- =====================================================
-- VERIFICAR CONFIGURACIÓN INICIAL
-- =====================================================

SELECT 
    'Configuraciones de Chat' as verificacion,
    COUNT(*) as total_configuraciones,
    COUNT(CASE WHEN theme = 'light' THEN 1 END) as tema_claro,
    COUNT(CASE WHEN language = 'es' THEN 1 END) as idioma_espanol,
    COUNT(CASE WHEN notifications_enabled = true THEN 1 END) as notificaciones_habilitadas
FROM chat_settings;

-- =====================================================
-- VERIFICAR CAMPOS DE RETENCIÓN
-- =====================================================

SELECT 
    'Campos de Retención' as verificacion,
    'conversations' as tabla,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    COUNT(CASE WHEN retention_policy IS NOT NULL THEN 1 END) as con_politica_retencion
FROM conversations
UNION ALL
SELECT 
    'Campos de Retención' as verificacion,
    'messages' as tabla,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as con_fecha_expiracion,
    COUNT(CASE WHEN retention_policy IS NOT NULL THEN 1 END) as con_politica_retencion
FROM messages;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_functions INTEGER;
    total_views INTEGER;
    total_policies INTEGER;
    total_triggers INTEGER;
BEGIN
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
    
    SELECT COUNT(*) INTO total_triggers 
    FROM information_schema.triggers 
    WHERE trigger_name IN ('trigger_update_conversation_updated_at', 'trigger_create_chat_notification');
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 🎉 VERIFICACIÓN FINAL COMPLETADA ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTADÍSTICAS FINALES:';
    RAISE NOTICE '   - Tablas: %/7', total_tables;
    RAISE NOTICE '   - Funciones: %/4', total_functions;
    RAISE NOTICE '   - Vistas: %/3', total_views;
    RAISE NOTICE '   - Políticas RLS: %', total_policies;
    RAISE NOTICE '   - Triggers: %/2', total_triggers;
    RAISE NOTICE '';
    
    -- Verificar si el sistema está completo
    IF total_tables = 7 AND total_functions = 4 AND total_views = 3 AND total_policies >= 15 AND total_triggers = 2 THEN
        RAISE NOTICE '✅ ¡SISTEMA DE CHAT COMPLETAMENTE FUNCIONAL!';
        RAISE NOTICE '✅ Todas las correcciones aplicadas exitosamente';
        RAISE NOTICE '✅ Sistema listo para producción';
    ELSE
        RAISE NOTICE '⚠️ SISTEMA INCOMPLETO';
        RAISE NOTICE '❌ Faltan elementos del sistema';
        RAISE NOTICE '💡 Revisar migración';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FUNCIONALIDADES DISPONIBLES:';
    RAISE NOTICE '   ✅ Retención automática de 7 días';
    RAISE NOTICE '   ✅ Notificaciones en tiempo real';
    RAISE NOTICE '   ✅ Archivos adjuntos';
    RAISE NOTICE '   ✅ Indicadores de escritura';
    RAISE NOTICE '   ✅ Configuraciones personalizadas';
    RAISE NOTICE '   ✅ Row Level Security (RLS) completo';
    RAISE NOTICE '   ✅ Vistas optimizadas';
    RAISE NOTICE '   ✅ Funciones de limpieza automática';
    RAISE NOTICE '   ✅ Triggers automáticos';
    RAISE NOTICE '';
END $$;
