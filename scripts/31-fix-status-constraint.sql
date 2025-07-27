-- Verificar la constraint actual
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'contact_messages'::regclass 
AND conname = 'contact_messages_status_check';

-- Eliminar la constraint actual si existe
ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;

-- Crear la constraint correcta
ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check 
CHECK (status IN ('new', 'read', 'replied', 'archived'));

-- Verificar que la constraint se creó correctamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'contact_messages'::regclass 
AND conname = 'contact_messages_status_check';

-- Probar la constraint con un UPDATE
UPDATE contact_messages 
SET status = 'archived' 
WHERE id = (SELECT id FROM contact_messages LIMIT 1);

-- Verificar el resultado
SELECT id, status FROM contact_messages LIMIT 1; 