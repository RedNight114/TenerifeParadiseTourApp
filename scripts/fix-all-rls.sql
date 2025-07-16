-- Script completo para solucionar problemas de RLS
-- Ejecutar en el SQL Editor de Supabase

-- 1. Deshabilitar RLS en todas las tablas problemáticas
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('audit_logs', 'profiles');

-- 3. Crear usuario técnico si no existe
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'Tecnico QuickAgence',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 4. Insertar logs de prueba
INSERT INTO audit_logs (
  user_id,
  user_email,
  action,
  category,
  level,
  details,
  success,
  resource_type,
  resource_id
) VALUES 
(
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'login',
  'authentication',
  'info',
  '{"ip_address": "127.0.0.1", "user_agent": "test"}',
  true,
  'user',
  '781412ba-4ee4-486e-a428-e1b052d20538'
),
(
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'view_audit_logs',
  'admin_action',
  'info',
  '{"page": "audit_dashboard"}',
  true,
  'audit_logs',
  'all'
),
(
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'create_service',
  'data_modification',
  'info',
  '{"service_name": "Test Service"}',
  true,
  'service',
  'test-service-1'
),
(
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'failed_login',
  'authentication',
  'warning',
  '{"ip_address": "192.168.1.100", "reason": "invalid_password"}',
  false,
  'user',
  'unknown'
),
(
  '781412ba-4ee4-486e-a428-e1b052d20538',
  'tecnicos@tenerifeparadise.com',
  'export_data',
  'data_access',
  'info',
  '{"format": "csv", "records": 150}',
  true,
  'data_export',
  'export-001'
);

-- 5. Verificar que todo se creó correctamente
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Audit Logs' as table_name, COUNT(*) as count FROM audit_logs;

-- 6. Verificar usuario técnico
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE email = 'tecnicos@tenerifeparadise.com';

-- 7. Verificar logs recientes
SELECT action, category, level, success, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 5; 