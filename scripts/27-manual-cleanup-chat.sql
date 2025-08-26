-- Script para limpieza manual del sistema de chat
-- Ejecutar cuando sea necesario para mantener el sistema limpio
-- Útil cuando la extensión pg_cron no está disponible

-- =====================================================
-- LIMPIEZA MANUAL DEL SISTEMA DE CHAT
-- =====================================================

-- Limpiar indicadores de escritura expirados
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM typing_indicators WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RAISE NOTICE '✅ Limpiados % indicadores de escritura expirados', deleted_count;
    ELSE
        RAISE NOTICE 'ℹ️ No hay indicadores de escritura expirados para limpiar';
    END IF;
END $$;

-- Limpiar notificaciones antiguas (más de 30 días)
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_notifications 
    WHERE created_at < (NOW() - INTERVAL '30 days') 
    AND is_read = true;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RAISE NOTICE '✅ Limpiadas % notificaciones antiguas', deleted_count;
    ELSE
        RAISE NOTICE 'ℹ️ No hay notificaciones antiguas para limpiar';
    END IF;
END $$;

-- Limpiar archivos adjuntos huérfanos (sin mensaje asociado)
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_attachments 
    WHERE message_id NOT IN (SELECT id FROM messages);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RAISE NOTICE '✅ Limpiados % archivos adjuntos huérfanos', deleted_count;
    ELSE
        RAISE NOTICE 'ℹ️ No hay archivos adjuntos huérfanos para limpiar';
    END IF;
END $$;

-- Limpiar participantes de conversaciones cerradas (más de 90 días)
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversation_participants cp
    WHERE EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = cp.conversation_id 
        AND c.status = 'closed' 
        AND c.closed_at < (NOW() - INTERVAL '90 days')
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RAISE NOTICE '✅ Limpiados % participantes de conversaciones cerradas antiguas', deleted_count;
    ELSE
        RAISE NOTICE 'ℹ️ No hay participantes de conversaciones cerradas antiguas para limpiar';
    END IF;
END $$;

-- Mostrar estadísticas del sistema
SELECT '=== ESTADÍSTICAS DEL SISTEMA DE CHAT ===' as info;

-- Conteo de elementos por tabla
SELECT 'Conteo de elementos por tabla:' as tabla;
SELECT 
    'conversations' as tabla,
    COUNT(*) as total
FROM conversations
UNION ALL
SELECT 
    'messages' as tabla,
    COUNT(*) as total
FROM messages
UNION ALL
SELECT 
    'conversation_participants' as tabla,
    COUNT(*) as total
FROM conversation_participants
UNION ALL
SELECT 
    'chat_notifications' as tabla,
    COUNT(*) as total
FROM chat_notifications
UNION ALL
SELECT 
    'chat_attachments' as tabla,
    COUNT(*) as total
FROM chat_attachments
UNION ALL
SELECT 
    'typing_indicators' as tabla,
    COUNT(*) as total
FROM typing_indicators
UNION ALL
SELECT 
    'chat_settings' as tabla,
    COUNT(*) as total
FROM chat_settings
ORDER BY tabla;

-- Conversaciones por estado
SELECT 'Conversaciones por estado:' as tabla;
SELECT 
    status,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversations), 2) as porcentaje
FROM conversations 
GROUP BY status 
ORDER BY total DESC;

-- Conversaciones por categoría
SELECT 'Conversaciones por categoría:' as tabla;
SELECT 
    COALESCE(cat.name, 'Sin categoría') as categoria,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversations), 2) as porcentaje
FROM conversations c
LEFT JOIN chat_categories cat ON c.category_id = cat.id
GROUP BY cat.name
ORDER BY total DESC;

-- Mensajes por tipo
SELECT 'Mensajes por tipo:' as tabla;
SELECT 
    message_type,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM messages), 2) as porcentaje
FROM messages 
GROUP BY message_type 
ORDER BY total DESC;

-- Notificaciones no leídas
SELECT 'Notificaciones no leídas:' as tabla;
SELECT 
    COUNT(*) as total_notificaciones_no_leidas
FROM chat_notifications 
WHERE is_read = false;

-- Indicadores de escritura activos
SELECT 'Indicadores de escritura activos:' as tabla;
SELECT 
    COUNT(*) as total_indicadores_activos
FROM typing_indicators 
WHERE is_typing = true AND expires_at > NOW();

-- Resumen de limpieza
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 LIMPIEZA MANUAL COMPLETADA';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema de chat ha sido limpiado y optimizado.';
    RAISE NOTICE 'Para mantener el rendimiento óptimo, ejecuta este script:';
    RAISE NOTICE '  - Semanalmente para uso normal';
    RAISE NOTICE '  - Diariamente para uso intensivo';
    RAISE NOTICE '';
    RAISE NOTICE 'Comandos útiles para limpieza manual:';
    RAISE NOTICE '  - SELECT cleanup_expired_typing_indicators();';
    RAISE NOTICE '  - DELETE FROM typing_indicators WHERE expires_at < NOW();';
    RAISE NOTICE '  - DELETE FROM chat_notifications WHERE created_at < NOW() - INTERVAL ''7 days'' AND is_read = true;';
END $$;

