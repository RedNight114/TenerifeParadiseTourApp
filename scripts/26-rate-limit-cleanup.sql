-- ============================================================
-- RATE LIMITING CLEANUP AND MAINTENANCE
-- ============================================================

-- Nota: Este script es para futuras implementaciones de rate limiting
-- en base de datos. Actualmente usamos cache en memoria.

-- 1. TABLA PARA ALMACENAR RATE LIMITING (OPCIONAL)
-- ============================================================
-- Solo crear si se decide migrar de cache en memoria a base de datos

-- CREATE TABLE IF NOT EXISTS rate_limit_entries (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   key_hash TEXT NOT NULL, -- Hash de la clave para privacidad
--   request_count INTEGER DEFAULT 1,
--   window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   window_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 minute',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE INDEX IF NOT EXISTS idx_rate_limit_key_hash ON rate_limit_entries(key_hash);
-- CREATE INDEX IF NOT EXISTS idx_rate_limit_window_end ON rate_limit_entries(window_end);

-- 2. FUNCIÓN PARA LIMPIAR ENTRADAS EXPIRADAS
-- ============================================================
-- CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
-- RETURNS INTEGER
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM rate_limit_entries 
--   WHERE window_end < NOW();
--   
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   
--   RETURN deleted_count;
-- END;
-- $$;

-- 3. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================================
-- CREATE TRIGGER update_rate_limit_entries_updated_at 
--   BEFORE UPDATE ON rate_limit_entries 
--   FOR EACH ROW 
--   EXECUTE FUNCTION update_updated_at_column();

-- 4. FUNCIÓN PARA OBTENER ESTADÍSTICAS DE RATE LIMITING
-- ============================================================
-- CREATE OR REPLACE FUNCTION get_rate_limit_stats()
-- RETURNS TABLE(
--   total_entries BIGINT,
--   active_entries BIGINT,
--   expired_entries BIGINT,
--   avg_requests_per_key NUMERIC
-- )
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT 
--     COUNT(*) as total_entries,
--     COUNT(*) FILTER (WHERE window_end > NOW()) as active_entries,
--     COUNT(*) FILTER (WHERE window_end <= NOW()) as expired_entries,
--     AVG(request_count) as avg_requests_per_key
--   FROM rate_limit_entries;
-- END;
-- $$;

-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================
-- COMMENT ON TABLE rate_limit_entries IS 'Almacena información de rate limiting para protección contra abuso';
-- COMMENT ON FUNCTION cleanup_expired_rate_limits() IS 'Limpia entradas de rate limiting expiradas';
-- COMMENT ON FUNCTION get_rate_limit_stats() IS 'Obtiene estadísticas de rate limiting';

-- 6. JOB PARA LIMPIEZA AUTOMÁTICA (SI SE USA CRON)
-- ============================================================
-- Para implementar limpieza automática, se puede usar:
-- - pg_cron extension (si está disponible)
-- - Cron jobs del sistema
-- - Tareas programadas de la aplicación

-- Ejemplo con pg_cron (requiere extensión):
-- SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT cleanup_expired_rate_limits();');

-- 7. POLÍTICAS RLS PARA RATE LIMITING (SI SE IMPLEMENTA)
-- ============================================================
-- Solo admins pueden ver estadísticas de rate limiting
-- CREATE POLICY "Admins can view rate limit stats"
--   ON rate_limit_entries
--   FOR SELECT
--   USING (public.is_admin());

-- Solo el sistema puede insertar/actualizar rate limiting
-- CREATE POLICY "System can manage rate limits"
--   ON rate_limit_entries
--   FOR ALL
--   USING (auth.role() = 'service_role');

-- 8. VISTA PARA MONITOREO (SI SE IMPLEMENTA)
-- ============================================================
-- CREATE OR REPLACE VIEW rate_limit_monitoring AS
-- SELECT 
--   DATE_TRUNC('hour', created_at) as hour,
--   COUNT(*) as total_requests,
--   COUNT(DISTINCT key_hash) as unique_keys,
--   AVG(request_count) as avg_requests_per_key,
--   MAX(request_count) as max_requests_per_key
-- FROM rate_limit_entries
-- WHERE created_at >= NOW() - INTERVAL '24 hours'
-- GROUP BY DATE_TRUNC('hour', created_at)
-- ORDER BY hour DESC;

-- COMMENT ON VIEW rate_limit_monitoring IS 'Vista para monitoreo de rate limiting por hora';

-- 9. FUNCIÓN PARA OBTENER TOP ABUSERS (SI SE IMPLEMENTA)
-- ============================================================
-- CREATE OR REPLACE FUNCTION get_top_rate_limit_abusers(limit_count INTEGER DEFAULT 10)
-- RETURNS TABLE(
--   key_hash TEXT,
--   total_requests BIGINT,
--   avg_requests_per_window NUMERIC,
--   last_activity TIMESTAMP WITH TIME ZONE
-- )
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT 
--     rle.key_hash,
--     COUNT(*) as total_requests,
--     AVG(rle.request_count) as avg_requests_per_window,
--     MAX(rle.updated_at) as last_activity
--   FROM rate_limit_entries rle
--   WHERE rle.created_at >= NOW() - INTERVAL '1 hour'
--   GROUP BY rle.key_hash
--   ORDER BY total_requests DESC
--   LIMIT limit_count;
-- END;
-- $$;

-- COMMENT ON FUNCTION get_top_rate_limit_abusers(INTEGER) IS 'Obtiene los principales abusadores de rate limiting';

-- 10. NOTAS DE IMPLEMENTACIÓN
-- ============================================================
/*
NOTAS IMPORTANTES:

1. ACTUALMENTE USAMOS CACHE EN MEMORIA:
   - Más rápido para operaciones de lectura/escritura
   - No requiere base de datos
   - Se pierde al reiniciar el servidor
   - Limitado a un solo servidor

2. MIGRACIÓN A BASE DE DATOS (FUTURO):
   - Mejor para múltiples servidores
   - Persistencia de datos
   - Mejor monitoreo y análisis
   - Más complejo de implementar

3. CONSIDERACIONES DE RENDIMIENTO:
   - Índices en key_hash y window_end
   - Limpieza automática de datos expirados
   - Particionamiento por fecha si hay muchos datos

4. SEGURIDAD:
   - No almacenar IPs directamente, usar hashes
   - Rotación de claves de hash
   - Logs de auditoría para admins

5. MONITOREO:
   - Alertas cuando se exceden límites
   - Dashboard para admins
   - Métricas de rendimiento
*/ 