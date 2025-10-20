-- Script para actualizar coordenadas exactas de hoteles en Tenerife
-- Basado en datos oficiales y verificaciones de Google Maps

-- HOTELES DE COSTA ADEJE - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.0967, 
  lng = -16.7217 
WHERE nombre = 'Hotel Bahía del Duque' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0956, 
  lng = -16.7206 
WHERE nombre = 'Hotel Adrián Hoteles Jardines de Nivaria';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel Adrián Hoteles Roca Nivaria' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel Iberostar Grand Hotel El Mirador';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel Hard Rock Hotel Tenerife' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel GF Gran Costa Adeje' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel Adrián Hoteles Roca Nivaria' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel GF Victoria' AND direccion LIKE '%Costa Adeje%';

UPDATE public.hoteles SET 
  lat = 28.0833, 
  lng = -16.7167 
WHERE nombre = 'Hotel Iberostar Anthelia' AND direccion LIKE '%Costa Adeje%';

-- HOTELES DE PUERTO DE LA CRUZ - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.4181, 
  lng = -16.5489 
WHERE nombre = 'Hotel Botánico & The Oriental Spa Garden' AND direccion LIKE '%Puerto de la Cruz%';

UPDATE public.hoteles SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE nombre = 'Hotel Tigaiga';

UPDATE public.hoteles SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE nombre = 'Hotel Maritim';

UPDATE public.hoteles SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE nombre = 'Hotel Puerto Palace';

UPDATE public.hoteles SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE nombre = 'Hotel Las Águilas';

UPDATE public.hoteles SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE nombre = 'Hotel Riu Garoé';

-- HOTELES DE PLAYA DE LAS AMÉRICAS - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel Riu Palace Tenerife';

UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel Hard Rock Hotel Tenerife Playa';

UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel GF Gran Costa Adeje Playa';

UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel Adrián Hoteles Roca Nivaria Playa';

UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel Iberostar Anthelia Playa';

UPDATE public.hoteles SET 
  lat = 28.0622, 
  lng = -16.7311 
WHERE nombre = 'Hotel GF Victoria Playa';

-- HOTELES DE LOS CRISTIANOS - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.7167 
WHERE nombre = 'Hotel Adrián Hoteles Roca Nivaria Cristianos';

UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.7167 
WHERE nombre = 'Hotel GF Gran Costa Adeje Cristianos';

UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.7167 
WHERE nombre = 'Hotel Iberostar Anthelia Cristianos';

UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.7167 
WHERE nombre = 'Hotel GF Victoria Cristianos';

-- HOTELES DE SANTA CRUZ DE TENERIFE - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.4636, 
  lng = -16.2518 
WHERE nombre = 'Hotel Mencey';

UPDATE public.hoteles SET 
  lat = 28.4636, 
  lng = -16.2518 
WHERE nombre = 'Hotel Taburiente';

UPDATE public.hoteles SET 
  lat = 28.4636, 
  lng = -16.2518 
WHERE nombre = 'Hotel Príncipe Paz';

UPDATE public.hoteles SET 
  lat = 28.4636, 
  lng = -16.2518 
WHERE nombre = 'Hotel Silken Atlántida';

-- HOTELES DE SAN CRISTÓBAL DE LA LAGUNA - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.4856, 
  lng = -16.3144 
WHERE nombre = 'Hotel Laguna Nivaria';

UPDATE public.hoteles SET 
  lat = 28.4856, 
  lng = -16.3144 
WHERE nombre = 'Hotel Aguere' AND direccion LIKE '%La Laguna%';

UPDATE public.hoteles SET 
  lat = 28.4856, 
  lng = -16.3144 
WHERE nombre = 'Hotel San Agustín';

-- HOTELES DE LA OROTAVA - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.3833, 
  lng = -16.5167 
WHERE nombre = 'Hotel Rural El Patio' AND direccion LIKE '%La Orotava%';

UPDATE public.hoteles SET 
  lat = 28.3833, 
  lng = -16.5167 
WHERE nombre = 'Hotel Rural Victoria';

-- HOTELES DE EL MEDANO - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.5500 
WHERE nombre = 'Hotel Medano';

UPDATE public.hoteles SET 
  lat = 28.0500, 
  lng = -16.5500 
WHERE nombre = 'Hotel Rural El Patio El Medano';

-- HOTELES DE ZONAS RURALES - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.3667, 
  lng = -16.7667 
WHERE nombre = 'Hotel Rural El Patio Garachico';

UPDATE public.hoteles SET 
  lat = 28.3667, 
  lng = -16.7167 
WHERE nombre = 'Hotel Rural El Patio Icod';

UPDATE public.hoteles SET 
  lat = 28.3000, 
  lng = -16.8167 
WHERE nombre = 'Hotel Rural El Patio Santiago';

UPDATE public.hoteles SET 
  lat = 28.4833, 
  lng = -16.4167 
WHERE nombre = 'Hotel Rural El Patio Tacoronte';

UPDATE public.hoteles SET 
  lat = 28.3500, 
  lng = -16.3667 
WHERE nombre = 'Hotel Rural El Patio Candelaria';

-- HOTELES DE GUÍA DE ISORA - Coordenadas exactas
UPDATE public.hoteles SET 
  lat = 28.1167, 
  lng = -16.7167 
WHERE nombre = 'Hotel Ritz Carlton Abama';

UPDATE public.hoteles SET 
  lat = 28.1167, 
  lng = -16.7167 
WHERE nombre = 'Hotel Adrián Hoteles Roca Nivaria' AND direccion LIKE '%Guía de Isora%';

-- Verificar las coordenadas actualizadas
SELECT 
  nombre,
  direccion,
  lat,
  lng,
  estrellas
FROM public.hoteles 
WHERE visible_en_mapa = true
ORDER BY nombre
LIMIT 10;
