-- =====================================================
-- VERIFICACIÓN RÁPIDA DEL SISTEMA DE CHAT
-- =====================================================
-- Script simple para verificar rápidamente si la migración fue exitosa

-- Verificar tablas principales
SELECT 
    'Tablas del Sistema de Chat' as verificacion,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');

-- Verificar campos de retención
SELECT 
    'Campos de Retención' as verificacion,
    COUNT(*) as total
FROM information_schema.columns 
WHERE (table_name = 'conversations' AND column_name IN ('expires_at', 'retention_policy'))
   OR (table_name = 'messages' AND column_name IN ('expires_at', 'retention_policy'));

-- Verificar funciones
SELECT 
    'Funciones del Sistema' as verificacion,
    COUNT(*) as total
FROM information_schema.routines 
WHERE routine_name IN ('update_conversation_updated_at', 'create_chat_notification', 'cleanup_expired_chat_data', 'extend_conversation_retention');

-- Verificar vistas
SELECT 
    'Vistas Optimizadas' as verificacion,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_name IN ('conversation_summary', 'message_summary', 'participant_summary');

-- Verificar RLS
SELECT 
    'Políticas RLS' as verificacion,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'conversation_participants', 'chat_notifications', 'chat_attachments', 'typing_indicators', 'chat_settings');

-- Contar datos existentes
SELECT 
    'Datos Existentes' as verificacion,
    (SELECT COUNT(*) FROM conversations) as conversaciones,
    (SELECT COUNT(*) FROM messages) as mensajes,
    (SELECT COUNT(*) FROM chat_settings) as configuraciones;

-- Probar función de limpieza
SELECT 
    'Prueba de Función' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'cleanup_expired_chat_data')
        THEN '✅ Función disponible'
        ELSE '❌ Función no encontrada'
    END as estado;
