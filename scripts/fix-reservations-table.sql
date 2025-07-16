-- Script para verificar y agregar columnas faltantes en la tabla reservations
-- Basado en el script 13-update-reservations-table.sql

-- Verificar qué columnas existen actualmente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- Agregar columnas faltantes si no existen
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS reservation_time VARCHAR(10);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- Comentario de confirmación
SELECT 'Tabla reservations actualizada con las columnas de información de contacto.'; 