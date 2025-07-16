-- ============================================================================
-- 27 · AUDITORÍA · Crear tabla de logs de auditoría
-- ============================================================================

-- Crear tabla de logs de auditoría
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'authentication',
    'authorization', 
    'data_access',
    'data_modification',
    'payment',
    'reservation',
    'admin_action',
    'security',
    'system',
    'api'
  )),
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_level ON audit_logs(level);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_audit_logs_user_category_date ON audit_logs(user_id, category, created_at DESC);
CREATE INDEX idx_audit_logs_level_date ON audit_logs(level, created_at DESC);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_audit_logs_details_gin ON audit_logs USING GIN (details);
CREATE INDEX idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata);

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_logs
-- Solo admins pueden ver todos los logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (public.is_admin());

-- Solo admins pueden insertar logs (desde el sistema)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- Permitir inserción desde el sistema

-- Solo admins pueden actualizar logs
CREATE POLICY "Admins can update audit logs"
  ON audit_logs
  FOR UPDATE
  USING (public.is_admin());

-- Solo admins pueden eliminar logs
CREATE POLICY "Admins can delete audit logs"
  ON audit_logs
  FOR DELETE
  USING (public.is_admin());

-- Función para limpiar logs antiguos automáticamente
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Función para obtener estadísticas de auditoría
CREATE OR REPLACE FUNCTION get_audit_stats(
  days_back INTEGER DEFAULT 30,
  user_id_filter UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'by_category', json_object_agg(category, count) FILTER (WHERE category IS NOT NULL),
    'by_level', json_object_agg(level, count) FILTER (WHERE level IS NOT NULL),
    'by_success', json_build_object(
      'success', COUNT(*) FILTER (WHERE success = true),
      'failed', COUNT(*) FILTER (WHERE success = false)
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'action', action,
          'category', category,
          'level', level,
          'user_email', user_email,
          'created_at', created_at
        )
      )
      FROM (
        SELECT action, category, level, user_email, created_at
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
          AND (user_id_filter IS NULL OR user_id = user_id_filter)
        ORDER BY created_at DESC 
        LIMIT 10
      ) recent
    )
  ) INTO result
  FROM (
    SELECT 
      category,
      level,
      success,
      action,
      user_email,
      created_at,
      COUNT(*) OVER (PARTITION BY category) as count
    FROM audit_logs 
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
      AND (user_id_filter IS NULL OR user_id = user_id_filter)
  ) stats;
  
  RETURN result;
END;
$$;

-- Función para exportar logs en formato JSON
CREATE OR REPLACE FUNCTION export_audit_logs(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  level_filter TEXT DEFAULT NULL,
  user_id_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 1000
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'user_email', user_email,
      'action', action,
      'category', category,
      'level', level,
      'details', details,
      'ip_address', ip_address,
      'user_agent', user_agent,
      'resource_type', resource_type,
      'resource_id', resource_id,
      'success', success,
      'error_message', error_message,
      'metadata', metadata,
      'created_at', created_at
    )
  ) INTO result
  FROM audit_logs
  WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date)
    AND (category_filter IS NULL OR category = category_filter)
    AND (level_filter IS NULL OR level = level_filter)
    AND (user_id_filter IS NULL OR user_id = user_id_filter)
  ORDER BY created_at DESC
  LIMIT limit_count;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Función para detectar actividades sospechosas
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  hours_back INTEGER DEFAULT 24
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'failed_logins', (
      SELECT COUNT(*)
      FROM audit_logs
      WHERE category = 'authentication'
        AND success = false
        AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
    ),
    'multiple_failed_logins', (
      SELECT json_agg(
        json_build_object(
          'user_email', user_email,
          'ip_address', ip_address,
          'count', count,
          'last_attempt', last_attempt
        )
      )
      FROM (
        SELECT 
          user_email,
          ip_address,
          COUNT(*) as count,
          MAX(created_at) as last_attempt
        FROM audit_logs
        WHERE category = 'authentication'
          AND success = false
          AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
        GROUP BY user_email, ip_address
        HAVING COUNT(*) >= 5
        ORDER BY count DESC
      ) suspicious
    ),
    'critical_errors', (
      SELECT COUNT(*)
      FROM audit_logs
      WHERE level = 'critical'
        AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
    ),
    'unauthorized_access_attempts', (
      SELECT COUNT(*)
      FROM audit_logs
      WHERE category = 'authorization'
        AND success = false
        AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
    ),
    'payment_failures', (
      SELECT COUNT(*)
      FROM audit_logs
      WHERE category = 'payment'
        AND success = false
        AND created_at >= NOW() - INTERVAL '1 hour' * hours_back
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Dar permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_stats(INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION export_audit_logs(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_suspicious_activity(INTEGER) TO authenticated;

-- Comentarios para documentación
COMMENT ON TABLE audit_logs IS 'Tabla para almacenar logs de auditoría y seguridad del sistema';
COMMENT ON COLUMN audit_logs.action IS 'Acción realizada (ej: login, create, update, delete)';
COMMENT ON COLUMN audit_logs.category IS 'Categoría del evento (authentication, authorization, etc.)';
COMMENT ON COLUMN audit_logs.level IS 'Nivel de severidad (info, warning, error, critical)';
COMMENT ON COLUMN audit_logs.details IS 'Detalles adicionales en formato JSON';
COMMENT ON COLUMN audit_logs.success IS 'Indica si la acción fue exitosa';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso afectado (user, service, reservation, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID del recurso afectado';

-- Crear vista para logs recientes (últimas 24 horas)
CREATE VIEW recent_audit_logs AS
SELECT 
  id,
  user_email,
  action,
  category,
  level,
  success,
  resource_type,
  resource_id,
  created_at,
  CASE 
    WHEN level = 'critical' THEN 'text-red-600'
    WHEN level = 'error' THEN 'text-orange-600'
    WHEN level = 'warning' THEN 'text-yellow-600'
    ELSE 'text-green-600'
  END as level_class
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Crear vista para estadísticas diarias
CREATE VIEW daily_audit_stats AS
SELECT 
  DATE(created_at) as date,
  category,
  level,
  success,
  COUNT(*) as count
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), category, level, success
ORDER BY date DESC, category, level;

-- Insertar log inicial del sistema
INSERT INTO audit_logs (
  action,
  category,
  level,
  details,
  success,
  resource_type,
  resource_id,
  metadata
) VALUES (
  'audit_system_initialized',
  'system',
  'info',
  '{"message": "Sistema de auditoría inicializado"}',
  true,
  'system',
  'audit_logs',
  '{"version": "1.0", "environment": "production"}'
); 