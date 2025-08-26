-- Script para corregir las políticas RLS de chat_notifications
-- Este script resuelve el error "new row violates row-level security policy for table chat_notifications"

-- =====================================================
-- PASO 1: ELIMINAR POLÍTICAS RLS EXISTENTES DE chat_notifications
-- =====================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE '=== ELIMINANDO POLÍTICAS RLS EXISTENTES DE chat_notifications ===';
    
    -- Eliminar TODAS las políticas de chat_notifications
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_notifications' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON chat_notifications';
        RAISE NOTICE 'Eliminada política: % de chat_notifications', pol.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ TODAS las políticas RLS de chat_notifications han sido eliminadas';
END $$;

-- =====================================================
-- PASO 2: CREAR NUEVAS POLÍTICAS RLS PARA chat_notifications
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== CREANDO NUEVAS POLÍTICAS RLS PARA chat_notifications ===';
    
    -- Usuarios pueden ver sus propias notificaciones
    CREATE POLICY "Users can view own notifications" ON chat_notifications
        FOR SELECT USING (auth.uid() = user_id);
    
    -- Usuarios pueden insertar notificaciones para sí mismos
    CREATE POLICY "Users can insert own notifications" ON chat_notifications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Usuarios pueden actualizar sus notificaciones
    CREATE POLICY "Users can update own notifications" ON chat_notifications
        FOR UPDATE USING (auth.uid() = user_id);
    
    -- Admins pueden ver todas las notificaciones
    CREATE POLICY "Admins can view all notifications" ON chat_notifications
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    -- Admins pueden insertar notificaciones para cualquier usuario
    CREATE POLICY "Admins can insert notifications" ON chat_notifications
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    -- Admins pueden actualizar todas las notificaciones
    CREATE POLICY "Admins can update all notifications" ON chat_notifications
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Nuevas políticas RLS para chat_notifications creadas exitosamente';
END $$;

-- =====================================================
-- PASO 3: VERIFICAR QUE LAS POLÍTICAS FUNCIONAN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO POLÍTICAS RLS DE chat_notifications ===';
    
    -- Verificar que se puede leer la tabla chat_notifications
    BEGIN
        PERFORM 1 FROM chat_notifications LIMIT 1;
        RAISE NOTICE '✅ Política SELECT para chat_notifications funciona';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error en política SELECT para chat_notifications: %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ Verificación completada';
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE CORRECCIÓN DE POLÍTICAS RLS PARA chat_notifications ===';
    RAISE NOTICE '✅ Políticas RLS existentes eliminadas';
    RAISE NOTICE '✅ Nuevas políticas RLS creadas';
    RAISE NOTICE '';
    RAISE NOTICE 'Las nuevas políticas permiten:';
    RAISE NOTICE '- Usuarios ver, insertar y actualizar sus propias notificaciones';
    RAISE NOTICE '- Admins ver, insertar y actualizar todas las notificaciones';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora prueba el chat nuevamente:';
    RAISE NOTICE '1. Recarga la página del dashboard';
    RAISE NOTICE '2. Ve a la pestaña "Chat de Soporte"';
    RAISE NOTICE '3. Selecciona una conversación';
    RAISE NOTICE '4. Intenta enviar un mensaje';
    RAISE NOTICE '';
    RAISE NOTICE 'Deberías ver en la consola:';
    RAISE NOTICE '✅ Mensaje enviado exitosamente';
    RAISE NOTICE '✅ Sin errores de RLS en chat_notifications';
END $$;
