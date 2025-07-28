-- Actualizar tabla payments con columnas faltantes para Redsys
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS response_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS response_text TEXT,
ADD COLUMN IF NOT EXISTS auth_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signature_received TEXT,
ADD COLUMN IF NOT EXISTS merchant_parameters TEXT;

-- Actualizar el check de status para incluir 'confirmed'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pendiente', 'confirmado', 'confirmed', 'success', 'error', 'cancelado', 'failed'));

-- Crear índice para response_code
CREATE INDEX IF NOT EXISTS idx_payments_response_code ON payments(response_code);

-- Crear índice para auth_code
CREATE INDEX IF NOT EXISTS idx_payments_auth_code ON payments(auth_code);

-- Comentarios para documentar
COMMENT ON COLUMN payments.response_code IS 'Código de respuesta de Redsys (0000 = éxito)';
COMMENT ON COLUMN payments.response_text IS 'Texto descriptivo de la respuesta de Redsys';
COMMENT ON COLUMN payments.auth_code IS 'Código de autorización de Redsys';
COMMENT ON COLUMN payments.confirmed_at IS 'Fecha y hora de confirmación del pago';
COMMENT ON COLUMN payments.signature_received IS 'Firma recibida de Redsys para verificación';
COMMENT ON COLUMN payments.merchant_parameters IS 'Parámetros merchant recibidos de Redsys'; 