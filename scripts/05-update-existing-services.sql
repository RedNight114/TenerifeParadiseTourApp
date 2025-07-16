-- Actualizar servicios existentes para mejorar descripciones y precios

-- Actividades
UPDATE services SET 
  title = 'Quad Adventure Volcánico',
  description = 'Aventura en quad por los senderos más espectaculares de la isla. Para todos los niveles con equipo de seguridad incluido.',
  price = 55.00,
  duration = 240,
  location = 'Las Cañadas del Teide',
  min_group_size = 1,
  characteristics = 'Quads automáticos, equipo de seguridad, rutas guiadas, fotos incluidas'
WHERE title = 'Escalada en Roca';

-- Renting
UPDATE services SET 
  title = 'Coche Descapotable Premium',
  description = 'Explora Tenerife con estilo en nuestros descapotables. Perfecto para parejas o aventuras costeras con total libertad.',
  price = 45.00,
  vehicle_type = 'Descapotable',
  characteristics = 'BMW Serie 2, GPS incluido, seguro a todo riesgo, combustible lleno',
  insurance_included = true
WHERE title = 'Bicicleta Eléctrica';

-- Gastronomía
UPDATE services SET 
  title = 'Tour Gastronómico Local',
  description = 'Descubre los sabores auténticos de Tenerife visitando mercados locales y tabernas tradicionales con guía experto.',
  price = 32.00,
  menu = '5 paradas gastronómicas, degustaciones incluidas, guía gastronómico local, recetas tradicionales',
  schedule = '10:00-14:00',
  capacity = 12
WHERE title = 'Café Artesano';

-- Añadir más características a servicios existentes
UPDATE services SET images = ARRAY['teide_sunset.jpg', 'teide_crater.jpg', 'teide_cable.jpg'] WHERE title LIKE '%Teide%';
UPDATE services SET images = ARRAY['whale_watching.jpg', 'dolphins.jpg', 'boat_tour.jpg'] WHERE title LIKE '%Ballenas%' OR title LIKE '%Delfines%';
UPDATE services SET images = ARRAY['convertible_coast.jpg', 'bmw_interior.jpg'] WHERE vehicle_type = 'Descapotable';
UPDATE services SET images = ARRAY['ocean_dinner.jpg', 'canarian_food.jpg', 'sunset_dining.jpg'] WHERE title LIKE '%Cena%' AND title LIKE '%Océano%';
UPDATE services SET images = ARRAY['food_tour_market.jpg', 'local_tapas.jpg', 'traditional_restaurant.jpg'] WHERE title LIKE '%Tour Gastronómico%';
UPDATE services SET images = ARRAY['quad_adventure.jpg', 'volcanic_landscape.jpg', 'quad_group.jpg'] WHERE title LIKE '%Quad%';
