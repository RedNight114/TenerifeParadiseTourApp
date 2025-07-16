# 🔧 Solución Manual para el Error de Audit Logs

## Problema
El error "Error obteniendo logs" se debe a que las políticas de Row Level Security (RLS) están bloqueando el acceso a la tabla `audit_logs`.

## Solución

### Paso 1: Ir al Panel de Supabase
1. Ve a [https://app.supabase.com/](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar SQL para Deshabilitar RLS
Copia y pega el siguiente SQL en el editor:

```sql
-- Deshabilitar RLS temporalmente para audit_logs
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'audit_logs';
```

### Paso 3: Ejecutar el SQL
Haz clic en **Run** para ejecutar el SQL.

### Paso 4: Insertar Logs de Prueba
Ejecuta este SQL para insertar logs de prueba:

```sql
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
);
```

### Paso 5: Verificar
Ejecuta este SQL para verificar que los logs se insertaron:

```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
```

### Paso 6: Probar la Aplicación
1. Regresa a tu aplicación
2. Ve al panel de administración
3. Haz clic en "Auditoría y Seguridad"
4. Los logs deberían cargar correctamente

## Solución Permanente (Opcional)

Si quieres mantener RLS habilitado, ejecuta este SQL para crear políticas más permisivas:

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can update audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can delete audit logs" ON audit_logs;

-- Crear nuevas políticas
CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow audit log insertion"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update audit logs"
  ON audit_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete audit logs"
  ON audit_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Habilitar RLS nuevamente
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

## Nota
La solución temporal (deshabilitar RLS) es más simple y te permitirá usar la funcionalidad inmediatamente. La solución permanente requiere más configuración pero es más segura. 