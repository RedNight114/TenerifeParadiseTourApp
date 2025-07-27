-- Script para verificar y arreglar la tabla audit_logs
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Crear la tabla audit_logs
        CREATE TABLE audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            action VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            level VARCHAR(50) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
            details JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Crear índices para mejor rendimiento
        CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX idx_audit_logs_category ON audit_logs(category);
        CREATE INDEX idx_audit_logs_level ON audit_logs(level);
        CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

        -- Habilitar RLS
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

        RAISE NOTICE 'Tabla audit_logs creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla audit_logs ya existe';
    END IF;
END $$;

-- 2. Verificar y crear políticas RLS
DO $$
BEGIN
    -- Eliminar políticas existentes si las hay
    DROP POLICY IF EXISTS "Allow admin access to audit_logs" ON audit_logs;
    DROP POLICY IF EXISTS "Allow system access to audit_logs" ON audit_logs;
    
    -- Política para administradores
    CREATE POLICY "Allow admin access to audit_logs" ON audit_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

    -- Política para el sistema (inserción)
    CREATE POLICY "Allow system access to audit_logs" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

    RAISE NOTICE 'Políticas RLS configuradas';
END $$;

-- 3. Crear función para insertar logs automáticamente
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action VARCHAR(255),
    p_category VARCHAR(100),
    p_level VARCHAR(50),
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        category,
        level,
        details,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_action,
        p_category,
        p_level,
        p_details,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- 4. Crear algunos logs de prueba
INSERT INTO audit_logs (user_id, action, category, level, details, ip_address, user_agent)
VALUES 
    (NULL, 'system_startup', 'system', 'info', '{"message": "Sistema iniciado"}', '127.0.0.1', 'System'),
    (NULL, 'database_check', 'system', 'info', '{"message": "Verificación de base de datos"}', '127.0.0.1', 'System'),
    (NULL, 'admin_login', 'authentication', 'info', '{"message": "Acceso de administrador"}', '127.0.0.1', 'Admin Panel');

-- 5. Verificar la configuración
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as total_logs,
    COUNT(CASE WHEN level = 'error' THEN 1 END) as error_logs,
    COUNT(CASE WHEN level = 'warning' THEN 1 END) as warning_logs,
    COUNT(CASE WHEN level = 'info' THEN 1 END) as info_logs
FROM audit_logs;

-- 6. Mostrar logs recientes
SELECT 
    action,
    category,
    level,
    created_at,
    CASE 
        WHEN user_id IS NULL THEN 'Sistema'
        ELSE 'Usuario'
    END as source
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10; 