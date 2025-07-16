-- Añadir nuevos campos para los requisitos del servicio
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS min_age INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS license_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS permit_required BOOLEAN DEFAULT FALSE;

-- Cambiar la columna de horarios de TEXT a JSONB para una mejor estructura
-- Esto es seguro si la columna está vacía. Si tiene datos, necesitarían migración manual.
ALTER TABLE public.services
DROP COLUMN IF EXISTS schedule;

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS schedule JSONB;

-- Añadir comentarios para aclarar el propósito de las nuevas columnas
COMMENT ON COLUMN public.services.min_age IS 'Edad mínima requerida para el servicio.';
COMMENT ON COLUMN public.services.license_required IS 'Indica si se requiere un carnet o licencia (ej. de conducir, de navegación).';
COMMENT ON COLUMN public.services.permit_required IS 'Indica si se requiere un permiso especial.';
COMMENT ON COLUMN public.services.schedule IS 'Información estructurada de horarios, como franjas horarias disponibles.';
