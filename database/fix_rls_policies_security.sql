-- Corregir políticas RLS problemáticas para mejorar seguridad
-- Ejecutar este archivo en tu base de datos Supabase

-- Eliminar políticas ALL que permiten acceso total
DROP POLICY IF EXISTS conversations_all ON conversations;
DROP POLICY IF EXISTS messages_all ON messages;

-- Crear políticas granulares para conversations
CREATE POLICY conversations_select_secure ON conversations
  FOR SELECT USING (
    (user_id = auth.uid()) OR 
    (admin_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

CREATE POLICY conversations_insert_secure ON conversations
  FOR INSERT WITH CHECK (
    (user_id = auth.uid()) AND (user_id IS NOT NULL)
  );

CREATE POLICY conversations_update_secure ON conversations
  FOR UPDATE USING (
    (user_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

CREATE POLICY conversations_delete_secure ON conversations
  FOR DELETE USING (
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

-- Crear políticas granulares para messages
CREATE POLICY messages_select_secure ON messages
  FOR SELECT USING (
    (EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid()
    )) OR 
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

CREATE POLICY messages_insert_secure ON messages
  FOR INSERT WITH CHECK (
    (EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid()
    )) OR 
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

CREATE POLICY messages_update_secure ON messages
  FOR UPDATE USING (
    (sender_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

CREATE POLICY messages_delete_secure ON messages
  FOR DELETE USING (
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

-- Añadir política de auditoría para todas las operaciones
CREATE POLICY audit_logs_all ON audit_logs
  FOR ALL USING (
    (EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  );

-- Verificar que las políticas se aplicaron correctamente
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'audit_logs')
ORDER BY tablename, policyname;
