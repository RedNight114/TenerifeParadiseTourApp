-- Crear tabla para logs de la API
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  service TEXT NOT NULL DEFAULT 'tenerife-paradise-api',
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  request_id TEXT NOT NULL,
  duration INTEGER, -- en milisegundos
  status_code INTEGER,
  error JSONB,
  metadata JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  
  -- Índices para consultas eficientes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_method ON api_logs(method);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_request_id ON api_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Índice compuesto para consultas por endpoint y timestamp
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint_timestamp ON api_logs(endpoint, timestamp);

-- Índice compuesto para consultas por nivel y timestamp
CREATE INDEX IF NOT EXISTS idx_api_logs_level_timestamp ON api_logs(level, timestamp);

-- Índice para búsquedas en metadata JSONB
CREATE INDEX IF NOT EXISTS idx_api_logs_metadata_gin ON api_logs USING GIN (metadata);

-- Índice para búsquedas en context JSONB
CREATE INDEX IF NOT EXISTS idx_api_logs_context_gin ON api_logs USING GIN (context);

-- Índice para búsquedas en error JSONB
CREATE INDEX IF NOT EXISTS idx_api_logs_error_gin ON api_logs USING GIN (error);

-- Crear tabla para métricas agregadas (opcional, para optimizar consultas frecuentes)
CREATE TABLE IF NOT EXISTS api_metrics_hourly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hour TIMESTAMPTZ NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  level TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- en milisegundos
  avg_duration NUMERIC(10,2) DEFAULT 0,
  min_duration INTEGER,
  max_duration INTEGER,
  
  -- Índices
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hour, endpoint, method, level)
);

CREATE INDEX IF NOT EXISTS idx_api_metrics_hourly_hour ON api_metrics_hourly(hour);
CREATE INDEX IF NOT EXISTS idx_api_metrics_hourly_endpoint ON api_metrics_hourly(endpoint);

-- Crear tabla para métricas diarias
CREATE TABLE IF NOT EXISTS api_metrics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  level TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  avg_duration NUMERIC(10,2) DEFAULT 0,
  min_duration INTEGER,
  max_duration INTEGER,
  
  -- Índices
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, endpoint, method, level)
);

CREATE INDEX IF NOT EXISTS idx_api_metrics_daily_date ON api_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_api_metrics_daily_endpoint ON api_metrics_daily(endpoint);

-- Función para limpiar logs antiguos automáticamente
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void AS $$
BEGIN
  -- Eliminar logs más antiguos de 30 días
  DELETE FROM api_logs 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Eliminar métricas horarias más antiguas de 7 días
  DELETE FROM api_metrics_hourly 
  WHERE hour < NOW() - INTERVAL '7 days';
  
  -- Eliminar métricas diarias más antiguas de 90 días
  DELETE FROM api_metrics_daily 
  WHERE date < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleanup completed: old logs and metrics removed';
END;
$$ LANGUAGE plpgsql;

-- Crear un trigger para ejecutar limpieza automática
-- (opcional, puedes ejecutarlo manualmente con cron jobs)
-- SELECT cleanup_old_api_logs();

-- Función para obtener estadísticas de logs
CREATE OR REPLACE FUNCTION get_api_logs_stats(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_end_date TIMESTAMPTZ DEFAULT NOW(),
  p_endpoint TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_logs BIGINT,
  error_count BIGINT,
  avg_duration NUMERIC(10,2),
  endpoint_stats JSONB,
  level_stats JSONB,
  method_stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total_logs,
      COUNT(*) FILTER (WHERE level IN ('error', 'fatal')) as error_count,
      AVG(duration) as avg_duration,
      jsonb_object_agg(
        endpoint, 
        jsonb_build_object(
          'count', COUNT(*),
          'errors', COUNT(*) FILTER (WHERE level IN ('error', 'fatal')),
          'avg_duration', AVG(duration)
        )
      ) as endpoint_stats,
      jsonb_object_agg(
        level, 
        COUNT(*)
      ) as level_stats,
      jsonb_object_agg(
        method, 
        COUNT(*)
      ) as method_stats
    FROM api_logs
    WHERE timestamp BETWEEN p_start_date AND p_end_date
      AND (p_endpoint IS NULL OR endpoint = p_endpoint)
      AND (p_level IS NULL OR level = p_level)
  )
  SELECT 
    s.total_logs,
    s.error_count,
    s.avg_duration,
    s.endpoint_stats,
    s.level_stats,
    s.method_stats
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener logs recientes con paginación
CREATE OR REPLACE FUNCTION get_recent_api_logs(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_level TEXT DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  level TEXT,
  endpoint TEXT,
  method TEXT,
  duration INTEGER,
  status_code INTEGER,
  error JSONB,
  metadata JSONB,
  context JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.timestamp,
    l.level,
    l.endpoint,
    l.method,
    l.duration,
    l.status_code,
    l.error,
    l.metadata,
    l.context
  FROM api_logs l
  WHERE (p_level IS NULL OR l.level = p_level)
    AND (p_endpoint IS NULL OR l.endpoint = p_endpoint)
    AND (p_method IS NULL OR l.method = p_method)
  ORDER BY l.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener endpoints más lentos
CREATE OR REPLACE FUNCTION get_slowest_endpoints(
  p_limit INTEGER DEFAULT 10,
  p_min_requests INTEGER DEFAULT 5
)
RETURNS TABLE (
  endpoint TEXT,
  method TEXT,
  request_count BIGINT,
  avg_duration NUMERIC(10,2),
  min_duration INTEGER,
  max_duration INTEGER,
  p95_duration NUMERIC(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.endpoint,
    l.method,
    COUNT(*) as request_count,
    AVG(l.duration) as avg_duration,
    MIN(l.duration) as min_duration,
    MAX(l.duration) as max_duration,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY l.duration) as p95_duration
  FROM api_logs l
  WHERE l.duration IS NOT NULL
  GROUP BY l.endpoint, l.method
  HAVING COUNT(*) >= p_min_requests
  ORDER BY avg_duration DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener errores más frecuentes
CREATE OR REPLACE FUNCTION get_most_frequent_errors(
  p_limit INTEGER DEFAULT 10,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  endpoint TEXT,
  method TEXT,
  error_message TEXT,
  error_count BIGINT,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.endpoint,
    l.method,
    l.error->>'message' as error_message,
    COUNT(*) as error_count,
    MAX(l.timestamp) as last_occurrence
  FROM api_logs l
  WHERE l.level IN ('error', 'fatal')
    AND l.timestamp >= NOW() - INTERVAL '1 hour' * p_hours
    AND l.error IS NOT NULL
  GROUP BY l.endpoint, l.method, l.error->>'message'
  ORDER BY error_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Crear vistas para consultas comunes
CREATE OR REPLACE VIEW api_logs_summary AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  endpoint,
  method,
  level,
  COUNT(*) as count,
  AVG(duration) as avg_duration,
  COUNT(*) FILTER (WHERE level IN ('error', 'fatal')) as error_count
FROM api_logs
GROUP BY DATE_TRUNC('hour', timestamp), endpoint, method, level
ORDER BY hour DESC, count DESC;

-- Vista para errores recientes
CREATE OR REPLACE VIEW api_errors_recent AS
SELECT 
  timestamp,
  endpoint,
  method,
  error->>'message' as error_message,
  error->>'stack' as error_stack,
  metadata
FROM api_logs
WHERE level IN ('error', 'fatal')
ORDER BY timestamp DESC;

-- Comentarios en las tablas
COMMENT ON TABLE api_logs IS 'Logs detallados de todas las operaciones de la API';
COMMENT ON TABLE api_metrics_hourly IS 'Métricas agregadas por hora para optimizar consultas';
COMMENT ON TABLE api_metrics_daily IS 'Métricas agregadas por día para análisis histórico';

-- Comentarios en las funciones
COMMENT ON FUNCTION cleanup_old_api_logs() IS 'Limpia logs y métricas antiguas automáticamente';
COMMENT ON FUNCTION get_api_logs_stats(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) IS 'Obtiene estadísticas agregadas de logs en un rango de fechas';
COMMENT ON FUNCTION get_recent_api_logs(INTEGER, INTEGER, TEXT, TEXT, TEXT) IS 'Obtiene logs recientes con paginación y filtros';
COMMENT ON FUNCTION get_slowest_endpoints(INTEGER, INTEGER) IS 'Identifica los endpoints más lentos de la API';
COMMENT ON FUNCTION get_most_frequent_errors(INTEGER, INTEGER) IS 'Identifica los errores más frecuentes en un período de tiempo';

-- Permisos RLS (Row Level Security)
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_logs
CREATE POLICY "Admin users can view all logs" ON api_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert logs" ON api_logs
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para métricas
CREATE POLICY "Admin users can view all metrics" ON api_metrics_hourly
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Admin users can view all daily metrics" ON api_metrics_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'admin'
    )
  );

-- Insertar algunos logs de ejemplo para testing
INSERT INTO api_logs (level, endpoint, method, request_id, status_code, duration, metadata)
VALUES 
  ('info', '/api/health', 'GET', 'req_test_1', 200, 45, '{"test": true}'),
  ('info', '/api/services', 'GET', 'req_test_2', 200, 120, '{"test": true}'),
  ('warn', '/api/upload', 'POST', 'req_test_3', 413, 250, '{"test": true}');

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla de logs de API creada exitosamente';
  RAISE NOTICE '📊 Tablas de métricas creadas';
  RAISE NOTICE '🔧 Funciones de utilidad creadas';
  RAISE NOTICE '📋 Vistas para consultas comunes creadas';
  RAISE NOTICE '🔒 Políticas RLS configuradas';
  RAISE NOTICE '🧪 Datos de ejemplo insertados';
END $$;
