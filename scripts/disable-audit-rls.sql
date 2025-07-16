-- Deshabilitar RLS temporalmente para audit_logs
-- Ejecutar en el SQL Editor de Supabase

-- Deshabilitar RLS
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'audit_logs'; 