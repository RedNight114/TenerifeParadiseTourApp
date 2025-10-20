-- Script para actualizar coordenadas exactas de servicios en Tenerife
-- Basado en ubicaciones reales y coordenadas GPS precisas

-- SERVICIOS DE PUERTO COLÓN (Costa Adeje)
-- Puerto Colón: 28.0783, -16.7378
UPDATE public.services SET 
  lat = 28.0783, 
  lng = -16.7378 
WHERE title LIKE '%Catamarán%' OR title LIKE '%barco%' OR title LIKE '%boat%';

-- SERVICIOS DE LOS GIGANTES
-- Los Gigantes: 28.2333, -16.8333
UPDATE public.services SET 
  lat = 28.2333, 
  lng = -16.8333 
WHERE title LIKE '%Gigantes%' OR title LIKE '%cetáceos%' OR title LIKE '%ballenas%';

-- SERVICIOS DEL TEIDE
-- Parque Nacional del Teide: 28.2724, -16.6424
UPDATE public.services SET 
  lat = 28.2724, 
  lng = -16.6424 
WHERE title LIKE '%Teide%' OR title LIKE '%Jeep%' OR title LIKE '%montaña%';

-- SERVICIOS DE SANTA CRUZ
-- Santa Cruz de Tenerife: 28.4636, -16.2518
UPDATE public.services SET 
  lat = 28.4636, 
  lng = -16.2518 
WHERE title LIKE '%Santa Cruz%' OR title LIKE '%capital%' OR title LIKE '%ciudad%';

-- SERVICIOS DE PUERTO DE LA CRUZ
-- Puerto de la Cruz: 28.4167, -16.5500
UPDATE public.services SET 
  lat = 28.4167, 
  lng = -16.5500 
WHERE title LIKE '%Puerto%' OR title LIKE '%Loro Parque%' OR title LIKE '%norte%';

-- SERVICIOS DE LA LAGUNA
-- San Cristóbal de La Laguna: 28.4881, -16.3156
UPDATE public.services SET 
  lat = 28.4881, 
  lng = -16.3156 
WHERE title LIKE '%Laguna%' OR title LIKE '%histórico%' OR title LIKE '%UNESCO%';

-- SERVICIOS DE ANAGA
-- Parque Rural de Anaga: 28.5167, -16.3167
UPDATE public.services SET 
  lat = 28.5167, 
  lng = -16.3167 
WHERE title LIKE '%Anaga%' OR title LIKE '%senderismo%' OR title LIKE '%rural%';

-- SERVICIOS DE PLAYA DE LAS TERESITAS
-- Playa de Las Teresitas: 28.5167, -16.1833
UPDATE public.services SET 
  lat = 28.5167, 
  lng = -16.1833 
WHERE title LIKE '%Teresitas%' OR title LIKE '%playa%' OR title LIKE '%arena%';

-- SERVICIOS DE EL MEDANO
-- El Medano: 28.0500, -16.5500
UPDATE public.services SET 
  lat = 28.0500, 
  lng = -16.5500 
WHERE title LIKE '%Medano%' OR title LIKE '%windsurf%' OR title LIKE '%kitesurf%';

-- SERVICIOS DE GARACHICO
-- Garachico: 28.3667, -16.7667
UPDATE public.services SET 
  lat = 28.3667, 
  lng = -16.7667 
WHERE title LIKE '%Garachico%' OR title LIKE '%piscinas%' OR title LIKE '%naturales%';

-- SERVICIOS DE ICOD DE LOS VINOS
-- Icod de los Vinos: 28.3667, -16.7167
UPDATE public.services SET 
  lat = 28.3667, 
  lng = -16.7167 
WHERE title LIKE '%Icod%' OR title LIKE '%Drago%' OR title LIKE '%vino%';

-- SERVICIOS DE LA OROTAVA
-- La Orotava: 28.3833, -16.5167
UPDATE public.services SET 
  lat = 28.3833, 
  lng = -16.5167 
WHERE title LIKE '%Orotava%' OR title LIKE '%gastronomía%' OR title LIKE '%queso%';

-- SERVICIOS DE CANDELARIA
-- Candelaria: 28.3500, -16.3667
UPDATE public.services SET 
  lat = 28.3500, 
  lng = -16.3667 
WHERE title LIKE '%Candelaria%' OR title LIKE '%basílica%' OR title LIKE '%religioso%';

-- SERVICIOS DE TACORONTE
-- Tacoronte: 28.4833, -16.4167
UPDATE public.services SET 
  lat = 28.4833, 
  lng = -16.4167 
WHERE title LIKE '%Tacoronte%' OR title LIKE '%vinícola%' OR title LIKE '%bodega%';

-- SERVICIOS DE LOS CRISTIANOS
-- Los Cristianos: 28.0500, -16.7167
UPDATE public.services SET 
  lat = 28.0500, 
  lng = -16.7167 
WHERE title LIKE '%Cristianos%' OR title LIKE '%puerto%' OR title LIKE '%pesca%';

-- SERVICIOS DE PLAYA DE LAS AMÉRICAS
-- Playa de las Américas: 28.0667, -16.7167
UPDATE public.services SET 
  lat = 28.0667, 
  lng = -16.7167 
WHERE title LIKE '%Américas%' OR title LIKE '%Siam Park%' OR title LIKE '%aquapark%';

-- Verificar las coordenadas actualizadas
SELECT 
  title,
  lat,
  lng,
  category_id,
  visible_en_mapa
FROM public.services 
WHERE visible_en_mapa = true 
  AND lat IS NOT NULL 
  AND lng IS NOT NULL
ORDER BY title
LIMIT 20;
