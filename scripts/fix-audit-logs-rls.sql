-- Script para corregir las políticas RLS de audit_logs
-- Ejecutar en el SQL Editor de Supabase

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can update audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can delete audit logs" ON audit_logs;

-- Crear nuevas políticas más permisivas para desarrollo
-- Política para SELECT - permitir a usuarios autenticados ver logs
CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para INSERT - permitir inserción desde el sistema
CREATE POLICY "Allow audit log insertion"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Política para UPDATE - solo admins
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

-- Política para DELETE - solo admins
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

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'audit_logs'; 