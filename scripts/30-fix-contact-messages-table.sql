-- Añadir columna admin_notes a la tabla contact_messages
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Verificar que la columna se añadió correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_messages' 
AND column_name = 'admin_notes';

-- Actualizar algunos registros existentes con notas de ejemplo
UPDATE contact_messages 
SET admin_notes = 'Mensaje procesado automáticamente'
WHERE admin_notes IS NULL;

-- Verificar la estructura final de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_messages' 
ORDER BY ordinal_position; 