-- Crear tabla de pagos para Redsys
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendiente', 'confirmado', 'success', 'error', 'cancelado')),
  raw JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_number ON payments(order_number);
CREATE INDEX idx_payments_status ON payments(status);

-- Trigger para updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 