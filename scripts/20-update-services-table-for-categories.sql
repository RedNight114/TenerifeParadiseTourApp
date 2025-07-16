-- Añadir una columna para el tipo de precio (por persona o total)
ALTER TABLE services
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'per_person' CHECK (price_type IN ('per_person', 'total'));

-- Añadir columnas específicas para la categoría 'renting'
ALTER TABLE services
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS characteristics TEXT,
ADD COLUMN IF NOT EXISTS insurance_included BOOLEAN,
ADD COLUMN IF NOT EXISTS fuel_included BOOLEAN;

-- Añadir columnas específicas para la categoría 'gastronomia'
ALTER TABLE services
ADD COLUMN IF NOT EXISTS menu TEXT,
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS dietary_options TEXT[];

-- Asegurarse de que las columnas existentes sean utilizadas por 'actividades'
-- (No se necesitan cambios de esquema, solo se usarán lógicamente)

-- Añadir un índice para la columna de imágenes para mejorar búsquedas en la galería
CREATE INDEX IF NOT EXISTS idx_services_images ON services USING GIN (images);

-- Comentario para confirmar la ejecución
SELECT 'La tabla de servicios ha sido actualizada para soportar campos dinámicos por categoría.';
