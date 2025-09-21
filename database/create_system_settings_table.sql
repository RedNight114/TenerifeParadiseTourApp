-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  category VARCHAR(100) DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- Habilitar RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan leer configuraciones públicas
CREATE POLICY "Anyone can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

-- Política para que solo admins puedan ver/editar todas las configuraciones
CREATE POLICY "Admins can manage all settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Insertar configuraciones por defecto
INSERT INTO system_settings (key, value, type, category, description, is_public) VALUES
('site_name', 'Tenerife Paradise Tours', 'string', 'general', 'Nombre del sitio web', true),
('site_description', 'Tours y excursiones en Tenerife', 'string', 'general', 'Descripción del sitio', true),
('admin_email', 'admin@tenerife-paradise.com', 'string', 'admin', 'Email del administrador', false),
('max_reservations_per_user', '5', 'number', 'reservations', 'Máximo de reservas activas por usuario', false),
('booking_advance_days', '30', 'number', 'reservations', 'Días de antelación para reservas', false),
('enable_chat', 'true', 'boolean', 'features', 'Habilitar sistema de chat', false),
('enable_notifications', 'true', 'boolean', 'features', 'Habilitar notificaciones', false),
('maintenance_mode', 'false', 'boolean', 'system', 'Modo mantenimiento', false),
('default_currency', 'EUR', 'string', 'payment', 'Moneda por defecto', true),
('payment_methods', '["card", "paypal", "bank_transfer"]', 'json', 'payment', 'Métodos de pago disponibles', true),
('notification_retention_days', '30', 'number', 'notifications', 'Días de retención de notificaciones', false),
('auto_confirm_reservations', 'false', 'boolean', 'reservations', 'Confirmar reservas automáticamente', false)
ON CONFLICT (key) DO NOTHING;
