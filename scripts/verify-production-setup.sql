-- Script de verificación del sistema de chat para PRODUCCIÓN
-- Este script verifica que todas las configuraciones estén correctas

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA DE BASE DE DATOS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO ESTRUCTURA DE BASE DE DATOS ===';
    RAISE NOTICE '';
END $$;

-- Verificar que las tablas principales existan
SELECT 
    'conversations' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'messages' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'conversation_participants' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'chat_notifications' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_notifications') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'chat_attachments' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_attachments') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'typing_indicators' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'typing_indicators') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'chat_settings' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_settings') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status;

-- =====================================================
-- PASO 2: VERIFICAR VISTAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO VISTAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar que las vistas existan
SELECT 
    'conversation_summary' as view_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'conversation_summary') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'message_summary' as view_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'message_summary') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status;

-- =====================================================
-- PASO 3: VERIFICAR RLS Y POLÍTICAS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO RLS Y POLÍTICAS ===';
    RAISE NOTICE '';
END $$;

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO' 
        ELSE '❌ DESHABILITADO' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings')
GROUP BY tablename
ORDER BY tablename;

-- Mostrar políticas específicas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN permissive THEN 'PERMISIVA' 
        ELSE 'RESTRICTIVA' 
    END as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 4: VERIFICAR ÍNDICES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO ÍNDICES ===';
    RAISE NOTICE '';
END $$;

-- Verificar índices existentes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, indexname;

-- =====================================================
-- PASO 5: VERIFICAR FUNCIONES Y TRIGGERS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO FUNCIONES Y TRIGGERS ===';
    RAISE NOTICE '';
END $$;

-- Verificar funciones de seguridad
SELECT 
    'is_conversation_participant' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_conversation_participant') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'is_admin' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status
UNION ALL
SELECT 
    'validate_message_sender' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_message_sender') 
        THEN '✅ EXISTE' 
        ELSE '❌ NO EXISTE' 
    END as status;

-- Verificar triggers
SELECT 
    schemaname,
    tablename,
    triggername,
    tgtype,
    CASE 
        WHEN tgtype & 66 > 0 THEN 'BEFORE' 
        WHEN tgtype & 130 > 0 THEN 'AFTER' 
        ELSE 'INSTEAD OF' 
    END as trigger_timing,
    CASE 
        WHEN tgtype & 28 > 0 THEN 'INSERT' 
        WHEN tgtype & 56 > 0 THEN 'UPDATE' 
        WHEN tgtype & 112 > 0 THEN 'DELETE' 
        ELSE 'ALL' 
    END as trigger_events
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename, triggername;

-- =====================================================
-- PASO 6: VERIFICAR PERMISOS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO PERMISOS ===';
    RAISE NOTICE '';
END $$;

-- Verificar permisos de tabla
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'profiles')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- =====================================================
-- PASO 7: VERIFICAR DATOS DE PRUEBA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO DATOS DE PRUEBA ===';
    RAISE NOTICE '';
END $$;

-- Verificar que existan usuarios de prueba
SELECT 
    'Usuarios en profiles' as check_name,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Usuarios admin' as check_name,
    COUNT(*) as count
FROM profiles 
WHERE role = 'admin'
UNION ALL
SELECT 
    'Conversaciones existentes' as check_name,
    COUNT(*) as count
FROM conversations
UNION ALL
SELECT 
    'Mensajes existentes' as check_name,
    COUNT(*) as count
FROM messages
UNION ALL
SELECT 
    'Participantes existentes' as check_name,
    COUNT(*) as count
FROM conversation_participants;

-- =====================================================
-- PASO 8: VERIFICAR CONFIGURACIÓN DE AUTENTICACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICANDO CONFIGURACIÓN DE AUTENTICACIÓN ===';
    RAISE NOTICE '';
END $$;

-- Verificar configuración de auth
SELECT 
    'auth.uid() disponible' as check_name,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ FUNCIONA' 
        ELSE '⚠️ NO DISPONIBLE (esperado si no hay sesión)' 
    END as status
UNION ALL
SELECT 
    'auth.role() disponible' as check_name,
    CASE 
        WHEN auth.role() IS NOT NULL THEN '✅ FUNCIONA' 
        ELSE '⚠️ NO DISPONIBLE (esperado si no hay sesión)' 
    END as status;

-- =====================================================
-- PASO 9: RESUMEN FINAL
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN FINAL ===';
    RAISE NOTICE '';
    
    -- Contar elementos
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('conversations', 'messages', 'conversation_participants', 'profiles', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    SELECT COUNT(*) INTO view_count FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('conversation_summary', 'message_summary');
    
    SELECT COUNT(*) INTO policy_count FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');
    
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'messages', 'conversation_participants');
    
    SELECT COUNT(*) INTO function_count FROM pg_proc 
    WHERE proname IN ('is_conversation_participant', 'is_admin', 'validate_message_sender');
    
    SELECT COUNT(*) INTO trigger_count FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relname IN ('conversations', 'messages', 'conversation_participants');
    
    RAISE NOTICE '📊 ESTADÍSTICAS DEL SISTEMA:';
    RAISE NOTICE '- Tablas principales: %', table_count;
    RAISE NOTICE '- Vistas: %', view_count;
    RAISE NOTICE '- Políticas RLS: %', policy_count;
    RAISE NOTICE '- Índices: %', index_count;
    RAISE NOTICE '- Funciones de seguridad: %', function_count;
    RAISE NOTICE '- Triggers: %', trigger_count;
    RAISE NOTICE '';
    
    -- Evaluación general
    IF table_count >= 8 AND view_count >= 2 AND policy_count >= 20 AND function_count >= 3 THEN
        RAISE NOTICE '🎉 SISTEMA COMPLETAMENTE CONFIGURADO PARA PRODUCCIÓN!';
        RAISE NOTICE '✅ Todas las tablas, vistas y políticas están en su lugar';
        RAISE NOTICE '✅ Las funciones de seguridad están implementadas';
        RAISE NOTICE '✅ El sistema está listo para uso en producción';
    ELSIF table_count >= 6 AND view_count >= 1 AND policy_count >= 12 THEN
        RAISE NOTICE '⚠️ SISTEMA PARCIALMENTE CONFIGURADO';
        RAISE NOTICE '✅ Las funcionalidades básicas están disponibles';
        RAISE NOTICE '⚠️ Algunas características avanzadas pueden no funcionar';
    ELSE
        RAISE NOTICE '❌ SISTEMA INCOMPLETO';
        RAISE NOTICE '❌ Faltan elementos críticos para el funcionamiento';
        RAISE NOTICE '⚠️ Ejecuta el script de configuración antes de usar en producción';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔧 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Si el sistema está completo, prueba crear una conversación';
    RAISE NOTICE '2. Si hay problemas, ejecuta scripts/fix-chat-rls-simple.sql';
    RAISE NOTICE '3. Para configuración completa, ejecuta scripts/production-chat-setup.sql';
    RAISE NOTICE '';
    
END $$;
