-- Actualizar servicios de actividades con información detallada
-- Este script añade información específica para que los clientes entiendan mejor cada actividad

-- 1. Senderismo en Anaga
UPDATE services 
SET 
  activity_type = 'Senderismo Guiado',
  fitness_level_required = 'medio',
  equipment_provided = ARRAY[
    'Bastones de senderismo',
    'Chaleco reflectante',
    'Botella de agua reutilizable',
    'Botiquín de primeros auxilios'
  ],
  guide_languages = ARRAY['Español', 'Inglés', 'Alemán'],
  itinerary = '08:00 - Reunión en punto de encuentro
09:00 - Inicio del sendero en Anaga
10:30 - Descanso y avistamiento de aves
12:00 - Almuerzo en mirador panorámico
13:30 - Continuación del recorrido
15:00 - Visita a bosque de laurisilva
16:30 - Regreso al punto de partida
17:00 - Fin de la actividad',
  meeting_point_details = 'Oficina de Tenerife Paradise Tours en Santa Cruz de Tenerife. Transporte incluido desde puntos de recogida designados.',
  cancellation_policy = 'Cancelación gratuita hasta 24 horas antes. Reembolso del 50% si se cancela entre 24 y 12 horas antes. No reembolso si se cancela menos de 12 horas antes.'
WHERE id = '08ae78c2-5622-404a-81ae-1a6dbd4ebdea';

-- 2. Buceo en Tenerife
UPDATE services 
SET 
  activity_type = 'Buceo Recreativo',
  fitness_level_required = 'medio',
  equipment_provided = ARRAY[
    'Traje de neopreno completo',
    'Aletas y máscara',
    'Chaleco estabilizador',
    'Regulador y botella',
    'Ordenador de buceo',
    'Linterna subacuática'
  ],
  guide_languages = ARRAY['Español', 'Inglés'],
  itinerary = '09:00 - Reunión en el centro de buceo
09:30 - Briefing de seguridad y equipamiento
10:00 - Salida en barco hacia el punto de inmersión
10:30 - Primera inmersión (45 minutos)
11:30 - Descanso en superficie
12:00 - Segunda inmersión (45 minutos)
13:00 - Regreso al centro
13:30 - Desequipamiento y documentación',
  meeting_point_details = 'Centro de Buceo en Los Cristianos. Equipamiento incluido. Certificación PADI no requerida para buceo de descubrimiento.',
  cancellation_policy = 'Cancelación gratuita hasta 48 horas antes. Reembolso del 75% si se cancela entre 48 y 24 horas antes. No reembolso si se cancela menos de 24 horas antes debido a condiciones meteorológicas.'
WHERE title ILIKE '%buceo%' OR title ILIKE '%diving%';

-- 3. Parapente
UPDATE services 
SET 
  activity_type = 'Vuelo en Parapente',
  fitness_level_required = 'bajo',
  equipment_provided = ARRAY[
    'Parapente certificado',
    'Arnés de seguridad',
    'Casco homologado',
    'Radio de comunicación',
    'Paracaídas de emergencia'
  ],
  guide_languages = ARRAY['Español', 'Inglés', 'Francés'],
  itinerary = '08:00 - Reunión en punto de encuentro
08:30 - Traslado a zona de despegue
09:00 - Briefing de seguridad y preparación
09:30 - Vuelo en parapente (15-20 minutos)
10:00 - Aterrizaje y recogida
10:30 - Entrega de certificado y fotos',
  meeting_point_details = 'Punto de encuentro en Adeje. Transporte incluido. Vuelo en tándem con instructor certificado.',
  cancellation_policy = 'Cancelación gratuita hasta 12 horas antes. No reembolso si se cancela menos de 12 horas antes debido a condiciones meteorológicas.'
WHERE title ILIKE '%parapente%' OR title ILIKE '%paragliding%';

-- 4. Kayak
UPDATE services 
SET 
  activity_type = 'Kayak de Mar',
  fitness_level_required = 'bajo',
  equipment_provided = ARRAY[
    'Kayak individual o doble',
    'Remos ajustables',
    'Chaleco salvavidas',
    'Bidón estanco para pertenencias',
    'Máscara y tubo de snorkel'
  ],
  guide_languages = ARRAY['Español', 'Inglés'],
  itinerary = '09:00 - Reunión en la playa
09:15 - Briefing de seguridad y técnica
09:30 - Salida en kayak
10:00 - Exploración de cuevas marinas
11:00 - Snorkel en calas vírgenes
12:00 - Descanso en playa
12:30 - Regreso en kayak
13:00 - Fin de la actividad',
  meeting_point_details = 'Playa de Los Cristianos. No se requiere experiencia previa. Actividad apta para familias.',
  cancellation_policy = 'Cancelación gratuita hasta 24 horas antes. Reembolso del 50% si se cancela entre 24 y 6 horas antes. No reembolso si se cancela menos de 6 horas antes.'
WHERE title ILIKE '%kayak%';

-- 5. Tour en 4x4
UPDATE services 
SET 
  activity_type = 'Tour Off-Road',
  fitness_level_required = 'bajo',
  equipment_provided = ARRAY[
    'Vehículo 4x4 equipado',
    'Guía conductor certificado',
    'Agua y refrescos',
    'Snacks locales',
    'Fotos del tour'
  ],
  guide_languages = ARRAY['Español', 'Inglés', 'Alemán'],
  itinerary = '08:30 - Reunión en punto de encuentro
09:00 - Salida hacia el Teide
10:00 - Parada en miradores panorámicos
11:00 - Exploración de senderos off-road
12:00 - Almuerzo en restaurante local
13:30 - Visita a pueblos tradicionales
15:00 - Regreso por rutas alternativas
16:30 - Fin del tour',
  meeting_point_details = 'Oficina principal en Santa Cruz. Recogida disponible en hoteles seleccionados. Vehículo con capacidad para 8 personas.',
  cancellation_policy = 'Cancelación gratuita hasta 24 horas antes. Reembolso del 50% si se cancela entre 24 y 12 horas antes. No reembolso si se cancela menos de 12 horas antes.'
WHERE title ILIKE '%4x4%' OR title ILIKE '%off-road%';

-- Comentario para documentar las actualizaciones
COMMENT ON TABLE services IS 'Servicios actualizados con información detallada para mejor comprensión del cliente';

-- Verificar las actualizaciones
SELECT 
  title,
  activity_type,
  fitness_level_required,
  array_length(equipment_provided, 1) as equipment_count,
  array_length(guide_languages, 1) as languages_count
FROM services 
WHERE activity_type IS NOT NULL
ORDER BY title; 