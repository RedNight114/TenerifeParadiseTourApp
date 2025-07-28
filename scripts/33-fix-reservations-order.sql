-- Agregar columna order_number a la tabla reservations para vincular con pagos
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(12) UNIQUE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reservations_order_number ON reservations(order_number);

-- Actualizar registros existentes con order_number basado en id (limitado a 12 caracteres)
UPDATE reservations 
SET order_number = LEFT(REPLACE(id::text, '-', ''), 12) 
WHERE order_number IS NULL;

-- Comentario para documentar
COMMENT ON COLUMN reservations.order_number IS 'Número de orden único para vincular con pagos de Redsys'; 