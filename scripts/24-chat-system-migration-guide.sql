-- =====================================================
-- GUÍA DE MIGRACIÓN COMPLETA DEL SISTEMA DE CHAT
-- =====================================================
-- 
-- Este script proporciona la secuencia completa de migración
-- para implementar el sistema de chat corregido.
--
-- IMPORTANTE: Ejecutar los scripts en el orden especificado
-- =====================================================

-- NOTA SOBRE LA EXTENSIÓN CRON:
-- El script 25 intentará usar la extensión pg_cron si está disponible.
-- Si no está disponible (como en algunos planes de Supabase), el sistema
-- funcionará correctamente pero la limpieza automática se debe hacer manualmente
-- usando el script 27.

-- PASO 1: Verificar que existe la tabla categories (para servicios)
-- (No ejecutar - solo verificar)
-- SELECT 'Verificando tabla categories para servicios...' as paso;
-- SELECT COUNT(*) as total_categories FROM categories;

-- PASO 2: Eliminar categorías de chat de la tabla categories
-- Ejecutar: scripts/22-remove-chat-categories.sql
-- \i scripts/22-remove-chat-categories.sql

-- PASO 3: Crear nueva tabla chat_categories
-- Ejecutar: scripts/23-create-chat-categories-table.sql
-- \i scripts/23-create-chat-categories-table.sql

-- PASO 4: Crear sistema de chat completo
-- Ejecutar: scripts/25-cleanup-and-recreate-chat-tables.sql
-- \i scripts/25-cleanup-and-recreate-chat-tables.sql

-- PASO 5: Verificar que el sistema funciona
-- Ejecutar: scripts/26-test-chat-system.sql
-- \i scripts/26-test-chat-system.sql

-- PASO 6: (OPCIONAL) Limpieza manual del sistema
-- Ejecutar: scripts/27-manual-cleanup-chat.sql cuando sea necesario
-- \i scripts/27-manual-cleanup-chat.sql

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que la migración fue exitosa
DO $$
DECLARE
    chat_categories_count INTEGER;
    conversations_count INTEGER;
    messages_count INTEGER;
    chat_notifications_count INTEGER;
BEGIN
    -- Contar categorías de chat
    SELECT COUNT(*) INTO chat_categories_count FROM chat_categories;
    
    -- Contar conversaciones (debería ser 0 inicialmente)
    SELECT COUNT(*) INTO conversations_count FROM conversations;
    
    -- Contar mensajes (debería ser 0 inicialmente)
    SELECT COUNT(*) INTO messages_count FROM messages;
    
    -- Contar notificaciones (debería ser 0 inicialmente)
    SELECT COUNT(*) INTO chat_categories_count FROM chat_notifications;
    
    RAISE NOTICE '=== VERIFICACIÓN DE MIGRACIÓN ===';
    RAISE NOTICE 'Categorías de chat creadas: %', chat_categories_count;
    RAISE NOTICE 'Conversaciones existentes: %', conversations_count;
    RAISE NOTICE 'Mensajes existentes: %', messages_count;
    RAISE NOTICE 'Notificaciones existentes: %', chat_categories_count;
    
    IF chat_categories_count >= 8 THEN
        RAISE NOTICE '✅ Migración del sistema de chat COMPLETADA exitosamente';
    ELSE
        RAISE NOTICE '❌ Error en la migración - verificar pasos anteriores';
    END IF;
END $$;

-- Mostrar estructura final
SELECT '=== ESTRUCTURA FINAL DEL SISTEMA ===' as info;

-- Mostrar categorías de chat disponibles
SELECT 'Categorías de chat disponibles:' as tabla;
SELECT id, name, description, color FROM chat_categories ORDER BY sort_order;

-- Mostrar tablas del sistema de chat
SELECT 'Tablas del sistema de chat:' as tabla;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%chat%' 
OR tablename IN ('conversations', 'messages', 'conversation_participants')
ORDER BY tablename;

-- Mostrar vistas creadas
SELECT 'Vistas del sistema de chat:' as tabla;
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%summary%'
ORDER BY viewname;
