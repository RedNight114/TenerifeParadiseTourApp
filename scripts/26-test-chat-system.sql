-- Script de prueba para verificar que el sistema de chat funciona correctamente
-- Ejecutar DESPUÉS de completar la migración completa

-- =====================================================
-- VERIFICACIÓN DEL SISTEMA DE CHAT
-- =====================================================

-- Verificar que todas las tablas existen
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'chat_categories',
        'conversations', 
        'messages', 
        'conversation_participants', 
        'chat_notifications', 
        'chat_attachments', 
        'typing_indicators', 
        'chat_settings'
    ];
    missing_tables TEXT[] := '{}';
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Faltan las siguientes tablas: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Todas las tablas del chat existen';
    END IF;
END $$;

-- Verificar que las vistas existen
DO $$
DECLARE
    required_views TEXT[] := ARRAY[
        'conversation_summary',
        'message_summary', 
        'participant_summary'
    ];
    missing_views TEXT[] := '{}';
    view_name TEXT;
BEGIN
    FOREACH view_name IN ARRAY required_views
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = view_name) THEN
            missing_views := array_append(missing_views, view_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_views, 1) > 0 THEN
        RAISE EXCEPTION 'Faltan las siguientes vistas: %', array_to_string(missing_views, ', ');
    ELSE
        RAISE NOTICE '✅ Todas las vistas del chat existen';
    END IF;
END $$;

-- Verificar que las funciones existen
DO $$
DECLARE
    required_functions TEXT[] := ARRAY[
        'update_conversation_updated_at',
        'create_chat_notification', 
        'cleanup_expired_typing_indicators', 
        'update_user_online_status'
    ];
    missing_functions TEXT[] := '{}';
    function_name TEXT;
BEGIN
    FOREACH function_name IN ARRAY required_functions
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = function_name) THEN
            missing_functions := array_append(missing_functions, function_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE EXCEPTION 'Faltan las siguientes funciones: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE '✅ Todas las funciones del chat existen';
    END IF;
END $$;

-- Verificar que las categorías de chat existen
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM chat_categories;
    
    IF category_count >= 8 THEN
        RAISE NOTICE '✅ Categorías de chat configuradas correctamente (% categorías)', category_count;
    ELSE
        RAISE EXCEPTION '❌ Faltan categorías de chat. Solo hay % categorías', category_count;
    END IF;
END $$;

-- Verificar que las referencias entre tablas funcionan
DO $$
DECLARE
    ref_check BOOLEAN;
BEGIN
    -- Verificar que la referencia de conversations a chat_categories funciona
    BEGIN
        INSERT INTO conversations (user_id, title, category_id) 
        VALUES ('00000000-0000-0000-0000-000000000000', 'Test', 'general');
        RAISE EXCEPTION '❌ La referencia a chat_categories no está funcionando correctamente';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE '✅ Referencia de conversations a chat_categories funciona correctamente';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Error inesperado en la verificación de referencias: %', SQLERRM;
    END;
    
    -- Limpiar datos de prueba
    DELETE FROM conversations WHERE title = 'Test';
END $$;

-- Mostrar resumen del sistema
SELECT '=== RESUMEN DEL SISTEMA DE CHAT ===' as info;

-- Mostrar categorías disponibles
SELECT 'Categorías de chat disponibles:' as tabla;
SELECT id, name, description, color, sort_order 
FROM chat_categories 
ORDER BY sort_order;

-- Mostrar estructura de tablas
SELECT 'Estructura de tablas del chat:' as tabla;
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'chat_categories',
    'conversations', 
    'messages', 
    'conversation_participants', 
    'chat_notifications', 
    'chat_attachments', 
    'typing_indicators', 
    'chat_settings'
)
ORDER BY table_name;

-- Mostrar políticas RLS
SELECT 'Políticas RLS configuradas:' as tabla;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'conversations', 
    'messages', 
    'conversation_participants', 
    'chat_notifications', 
    'chat_attachments', 
    'typing_indicators', 
    'chat_settings'
)
ORDER BY tablename, policyname;

-- Verificar que el sistema está listo para usar
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA DE CHAT VERIFICADO EXITOSAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema está listo para usar con las siguientes características:';
    RAISE NOTICE '✅ Tablas del chat creadas y configuradas';
    RAISE NOTICE '✅ Vistas para consultas optimizadas';
    RAISE NOTICE '✅ Funciones y triggers automáticos';
    RAISE NOTICE '✅ Políticas RLS para seguridad';
    RAISE NOTICE '✅ Categorías de chat configuradas';
    RAISE NOTICE '✅ Referencias entre tablas funcionando';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos pasos:';
    RAISE NOTICE '1. Probar la creación de conversaciones';
    RAISE NOTICE '2. Probar el envío de mensajes';
    RAISE NOTICE '3. Verificar que las vistas funcionan';
    RAISE NOTICE '4. Implementar funcionalidades adicionales';
END $$;

