-- Script para insertar servicios de ejemplo con coordenadas reales de Tenerife
-- Ejecutar este script en Supabase para añadir servicios con coordenadas válidas

-- Primero, asegurémonos de que las columnas existen
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS visible_en_mapa boolean DEFAULT TRUE;

-- Insertar servicios de ejemplo con coordenadas reales de Tenerife
INSERT INTO public.services (
  title,
  description,
  price,
  lat,
  lng,
  visible_en_mapa,
  category_id,
  available,
  featured,
  duration,
  max_participants,
  location
) VALUES 
-- Servicios en Santa Cruz de Tenerife
(
  'Tour por Santa Cruz',
  'Recorrido guiado por la capital de Tenerife, incluyendo el Auditorio y el Parque García Sanabria',
  25.00,
  28.4636,
  -16.2518,
  true,
  'cultura',
  true,
  false,
  '3 horas',
  15,
  'Santa Cruz de Tenerife'
),
-- Servicios en Puerto de la Cruz
(
  'Visita a Loro Parque',
  'Entrada al famoso parque zoológico con espectáculos de orcas y delfines',
  45.00,
  28.4167,
  -16.5500,
  true,
  'cultura',
  true,
  true,
  '6 horas',
  20,
  'Puerto de la Cruz'
),
-- Servicios en el Teide
(
  'Excursión al Teide',
  'Subida al pico más alto de España con teleférico y senderismo',
  50.00,
  28.2724,
  -16.6424,
  true,
  'aventura',
  true,
  true,
  '8 horas',
  12,
  'Parque Nacional del Teide'
),
-- Servicios en Los Gigantes
(
  'Avistamiento de Cetáceos',
  'Excursión en barco para ver ballenas y delfines en su hábitat natural',
  35.00,
  28.2333,
  -16.8333,
  true,
  'aventura',
  true,
  true,
  '3 horas',
  12,
  'Los Gigantes'
),
-- Servicios en Costa Adeje
(
  'Spa de Lujo',
  'Tratamientos de spa y relajación en un entorno paradisíaco',
  80.00,
  28.0833,
  -16.7167,
  true,
  'relax',
  true,
  false,
  '2 horas',
  1,
  'Costa Adeje'
),
-- Servicios en La Orotava
(
  'Tour Gastronómico',
  'Degustación de productos locales, vinos y quesos de Tenerife',
  60.00,
  28.3833,
  -16.5167,
  true,
  'gastronomia',
  true,
  false,
  '4 horas',
  8,
  'La Orotava'
),
-- Servicios en Anaga
(
  'Senderismo en Anaga',
  'Ruta de senderismo por el Parque Rural de Anaga, patrimonio de la UNESCO',
  30.00,
  28.5167,
  -16.3167,
  true,
  'aventura',
  true,
  false,
  '6 horas',
  8,
  'Parque Rural de Anaga'
),
-- Servicios en Playa de Las Teresitas
(
  'Día de Playa',
  'Relajación en la famosa playa de arena dorada de Las Teresitas',
  20.00,
  28.5167,
  -16.1833,
  true,
  'relax',
  true,
  false,
  '4 horas',
  10,
  'Playa de Las Teresitas'
),
-- Servicios en Siam Park
(
  'Entrada Siam Park',
  'Acceso al parque acuático más grande de Europa',
  40.00,
  28.0833,
  -16.7167,
  true,
  'aventura',
  true,
  true,
  '6 horas',
  25,
  'Costa Adeje'
),
-- Servicios en Mirador Los Gigantes
(
  'Fotografía en Mirador',
  'Sesión fotográfica profesional en el mirador de Los Gigantes',
  45.00,
  28.2333,
  -16.8333,
  true,
  'cultura',
  true,
  false,
  '2 horas',
  4,
  'Los Gigantes'
);

-- Insertar hoteles de ejemplo con coordenadas reales
INSERT INTO public.hoteles (
  nombre,
  direccion,
  lat,
  lng,
  visible_en_mapa,
  estrellas,
  telefono,
  descripcion
) VALUES 
-- Hoteles en Puerto de la Cruz
(
  'Hotel Botánico & The Oriental Spa Garden',
  'Avenida Richard J. Yeoward, 1, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  5,
  '+34 922 381 400',
  'Hotel de lujo con spa y jardines tropicales únicos'
),
-- Hoteles en Costa Adeje
(
  'Hotel Ritz Carlton Abama',
  'Carretera General, TF-47, km 9, Guía de Isora',
  28.1167,
  -16.7167,
  true,
  5,
  '+34 922 126 000',
  'Resort de lujo con campo de golf y vistas al océano'
),
(
  'Hotel Bahía del Duque',
  'Avenida Bruselas, 14, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 747 400',
  'Hotel frente al mar con spa de lujo y arquitectura canaria'
),
-- Hoteles en Santa Cruz
(
  'Hotel Mencey',
  'Calle Doctor José Naveiras, 38, Santa Cruz de Tenerife',
  28.4636,
  -16.2518,
  true,
  4,
  '+34 922 609 900',
  'Hotel urbano en el centro de Santa Cruz con vistas al mar'
),
-- Hoteles en La Laguna
(
  'Hotel Laguna Nivaria',
  'Calle Obispo Rey Redondo, 38, San Cristóbal de La Laguna',
  28.4881,
  -16.3156,
  true,
  4,
  '+34 922 259 777',
  'Hotel histórico en el casco antiguo de La Laguna'
),
-- Hoteles en Los Realejos
(
  'Hotel Rural El Patio',
  'Calle El Patio, 1, Los Realejos',
  28.3833,
  -16.5833,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural con encanto en el norte de Tenerife'
);

-- Verificar que los datos se insertaron correctamente
SELECT 
  'Servicios' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as con_coordenadas
FROM public.services
WHERE visible_en_mapa = true

UNION ALL

SELECT 
  'Hoteles' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as con_coordenadas
FROM public.hoteles
WHERE visible_en_mapa = true;
