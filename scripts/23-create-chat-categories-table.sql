-- Script para crear la tabla de categorías específicas para el chat
-- Ejecutar después de eliminar las categorías de chat de la tabla categories

-- Crear tabla de categorías de chat
CREATE TABLE IF NOT EXISTS chat_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías básicas para conversaciones
INSERT INTO chat_categories (id, name, description, icon, color, sort_order) VALUES
  ('general', 'General', 'Consultas generales y soporte básico', 'message-circle', '#6B7280', 1),
  ('booking', 'Reservas', 'Consultas sobre reservas y disponibilidad', 'calendar', '#10B981', 2),
  ('support', 'Soporte', 'Soporte técnico y asistencia', 'help-circle', '#3B82F6', 3),
  ('technical', 'Técnico', 'Problemas técnicos y errores', 'settings', '#F59E0B', 4),
  ('billing', 'Facturación', 'Consultas sobre pagos y facturas', 'credit-card', '#EF4444', 5),
  ('complaints', 'Reclamaciones', 'Reclamaciones y quejas', 'alert-triangle', '#DC2626', 6),
  ('suggestions', 'Sugerencias', 'Sugerencias y mejoras', 'lightbulb', '#8B5CF6', 7),
  ('partnerships', 'Colaboraciones', 'Propuestas de colaboración', 'handshake', '#059669', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_categories_name ON chat_categories(name);
CREATE INDEX IF NOT EXISTS idx_chat_categories_is_active ON chat_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_categories_sort_order ON chat_categories(sort_order);

-- Habilitar RLS
ALTER TABLE chat_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat_categories
-- Todos los usuarios autenticados pueden ver las categorías activas
CREATE POLICY "Users can view active chat categories" ON chat_categories
  FOR SELECT USING (is_active = true);

-- Solo admins pueden gestionar categorías
CREATE POLICY "Admins can manage chat categories" ON chat_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_chat_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_chat_categories_updated_at
  BEFORE UPDATE ON chat_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_categories_updated_at();

-- Verificar que las categorías se insertaron correctamente
SELECT 'Categorías de chat creadas:' as message;
SELECT id, name, description, color, sort_order FROM chat_categories ORDER BY sort_order;
