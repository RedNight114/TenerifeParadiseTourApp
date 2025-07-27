-- Crear tabla para mensajes de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(255),
  date DATE,
  guests INTEGER,
  message TEXT NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Habilitar RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contact_messages
-- Solo admins pueden ver todos los mensajes
CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Solo admins pueden insertar mensajes (para respuestas)
CREATE POLICY "Admins can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Solo admins pueden actualizar mensajes
CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Solo admins pueden eliminar mensajes
CREATE POLICY "Admins can delete contact messages" ON contact_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Insertar algunos mensajes de ejemplo para testing
INSERT INTO contact_messages (name, email, phone, service, date, guests, message, status) VALUES
('María García', 'maria.garcia@email.com', '+34 612 345 678', 'Senderismo en Anaga', '2024-02-15', 4, 'Hola, me gustaría información sobre el tour de senderismo en Anaga. ¿Está disponible para el 15 de febrero? Somos 4 personas.', 'new'),
('Juan Pérez', 'juan.perez@email.com', '+34 623 456 789', 'Alquiler de Coche', '2024-02-20', 2, 'Buenos días, necesito alquilar un coche para el 20 de febrero. ¿Tienen disponibilidad?', 'read'),
('Ana López', 'ana.lopez@email.com', '+34 634 567 890', 'Cena Romántica', '2024-02-14', 2, 'Quiero reservar una cena romántica para el día de San Valentín. ¿Tienen algún menú especial?', 'replied'),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '+34 645 678 901', 'Tour del Teide', '2024-02-18', 6, 'Somos un grupo de 6 personas y nos interesa el tour del Teide. ¿Pueden darnos más información sobre horarios y precios?', 'new'),
('Laura Martín', 'laura.martin@email.com', '+34 656 789 012', 'Buceo', '2024-02-22', 3, 'Hola, queremos hacer buceo el 22 de febrero. Somos 3 personas, 2 con experiencia y 1 principiante. ¿Tienen cursos para principiantes?', 'new'); 