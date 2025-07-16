-- Añadir nuevos campos para actividades
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS activity_type TEXT,
ADD COLUMN IF NOT EXISTS fitness_level_required TEXT DEFAULT 'medio' CHECK (fitness_level_required IN ('bajo', 'medio', 'alto')),
ADD COLUMN IF NOT EXISTS equipment_provided TEXT[],
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS itinerary TEXT,
ADD COLUMN IF NOT EXISTS guide_languages TEXT[];

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN services.activity_type IS 'Tipo específico de actividad (ej: Senderismo, Buceo)';
COMMENT ON COLUMN services.fitness_level_required IS 'Nivel de condición física requerido';
COMMENT ON COLUMN services.equipment_provided IS 'Lista de equipo proporcionado';
COMMENT ON COLUMN services.cancellation_policy IS 'Política de cancelación del servicio';
COMMENT ON COLUMN services.itinerary IS 'Itinerario detallado de la actividad';
COMMENT ON COLUMN services.guide_languages IS 'Idiomas que habla el guía';
