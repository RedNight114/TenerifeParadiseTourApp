-- Añadir columnas detalladas para todas las categorías
ALTER TABLE services
  ADD COLUMN what_to_bring TEXT[] DEFAULT '{}',
  ADD COLUMN included_services TEXT[] DEFAULT '{}',
  ADD COLUMN not_included_services TEXT[] DEFAULT '{}',
  ADD COLUMN meeting_point_details TEXT,
  ADD COLUMN transmission TEXT, -- 'manual', 'automatic'
  ADD COLUMN seats INTEGER,
  ADD COLUMN doors INTEGER,
  ADD COLUMN fuel_policy TEXT, -- 'Full to Full', 'Full to Empty', etc.
  ADD COLUMN pickup_locations TEXT[] DEFAULT '{}',
  ADD COLUMN deposit_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN deposit_amount NUMERIC(10, 2),
  ADD COLUMN experience_type TEXT, -- 'Tasting menu', 'Cooking class', etc.
  ADD COLUMN chef_name TEXT,
  ADD COLUMN drink_options TEXT,
  ADD COLUMN ambience TEXT; -- 'Formal', 'Casual', etc.

-- Comentario para asegurar que el script se ejecute
-- Versión 1.0 de detalles de servicio mejorados.
