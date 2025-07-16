-- ACTIVIDADES & AVENTURAS

-- Excursiones y Tours
INSERT INTO services (title, description, category_id, subcategory_id, price, images, duration, location, min_group_size, max_group_size, difficulty_level, featured) VALUES
('Excursión al Volcán Teide', 'Descubre el pico más alto de España con nuestro tour guiado. Incluye transporte, guía experto y almuerzo tradicional canario.', 'actividades', 'excursiones', 45.00, ARRAY['teide1.jpg', 'teide2.jpg'], 480, 'Parque Nacional del Teide', 2, 25, 'moderado', true),
('Tour Completo de la Isla', 'Recorrido panorámico por los lugares más emblemáticos de Tenerife en un día completo con guía local.', 'actividades', 'excursiones', 55.00, ARRAY['island_tour1.jpg'], 540, 'Toda la isla', 4, 30, 'facil', false),
('Ruta de los Miradores', 'Visita los miradores más espectaculares de Tenerife con paradas fotográficas y explicaciones geológicas.', 'actividades', 'excursiones', 35.00, ARRAY['miradores1.jpg'], 300, 'Norte de Tenerife', 2, 20, 'facil', false);

-- Deportes de Aventura
INSERT INTO services (title, description, category_id, subcategory_id, price, images, duration, location, min_group_size, max_group_size, difficulty_level, featured) VALUES
('Barranco del Infierno', 'Aventura de barranquismo en uno de los barrancos más espectaculares de Tenerife. Incluye equipo completo y instructor.', 'actividades', 'aventura', 65.00, ARRAY['barranco1.jpg'], 360, 'Adeje', 2, 8, 'dificil', false),
('Escalada en Arico', 'Iniciación a la escalada en roca volcánica con vistas al océano. Equipo completo y instructor certificado.', 'actividades', 'aventura', 50.00, ARRAY['climbing1.jpg'], 240, 'Arico', 2, 6, 'moderado', false),
('Paragliding Tenerife', 'Vuela sobre los paisajes más espectaculares de Tenerife. Vuelo en tándem con instructor experimentado.', 'actividades', 'aventura', 85.00, ARRAY['paragliding1.jpg'], 180, 'Izaña', 1, 2, 'moderado', false),
('Quad Adventure Volcánico', 'Aventura en quad por los senderos volcánicos del Teide. Rutas guiadas para todos los niveles con paradas fotográficas.', 'actividades', 'aventura', 55.00, ARRAY['quad1.jpg', 'quad2.jpg'], 240, 'Las Cañadas del Teide', 1, 12, 'moderado', true);

-- Actividades Acuáticas
INSERT INTO services (title, description, category_id, subcategory_id, price, images, duration, location, min_group_size, max_group_size, difficulty_level, featured) VALUES
('Avistamiento de Ballenas', 'Experiencia única navegando para avistar ballenas piloto y delfines en su hábitat natural. Incluye hidrófonos y biólogo marino.', 'actividades', 'acuaticas', 38.00, ARRAY['whales1.jpg', 'whales2.jpg'], 180, 'Puerto Colón, Costa Adeje', 1, 40, 'facil', true),
('Snorkel en El Puertito', 'Descubre la vida marina de Tenerife en una de las mejores zonas de snorkel. Equipo incluido y guía acuático.', 'actividades', 'acuaticas', 25.00, ARRAY['snorkel1.jpg'], 120, 'El Puertito, Arona', 2, 15, 'facil', false),
('Kayak y Snorkel', 'Combinación perfecta de kayak y snorkel en aguas cristalinas. Incluye equipo completo y instructor.', 'actividades', 'acuaticas', 42.00, ARRAY['kayak1.jpg'], 180, 'Los Cristianos', 2, 12, 'moderado', false);

-- Naturaleza y Senderismo
INSERT INTO services (title, description, category_id, subcategory_id, price, images, duration, location, min_group_size, max_group_size, difficulty_level, featured) VALUES
('Senderismo Bosque de Anaga', 'Explora el bosque de laurisilva más antiguo de Europa. Senderos mágicos entre nieblas y vegetación prehistórica.', 'actividades', 'naturaleza', 35.00, ARRAY['anaga1.jpg', 'anaga2.jpg'], 300, 'Parque Rural de Anaga', 4, 15, 'moderado', false),
('Ruta Lunar del Teide', 'Senderismo nocturno por paisajes lunares únicos. Incluye observación astronómica y cena bajo las estrellas.', 'actividades', 'naturaleza', 48.00, ARRAY['lunar1.jpg'], 360, 'Las Cañadas del Teide', 6, 20, 'moderado', false);

-- ALQUILER DE VEHÍCULOS

-- Coches y Todoterrenos
INSERT INTO services (title, description, category_id, subcategory_id, price, images, vehicle_type, characteristics, insurance_included, fuel_included, featured) VALUES
('Coche Descapotable Premium', 'Explora Tenerife con estilo en nuestros descapotables. Perfecto para parejas o aventuras costeras con total libertad.', 'renting', 'coches', 45.00, ARRAY['convertible1.jpg'], 'Descapotable', 'BMW Serie 2, GPS incluido, Bluetooth, aire acondicionado', true, false, true),
('Todoterreno 4x4 Familiar', 'Vehículo ideal para familias aventureras. Accede a cualquier rincón de la isla con total comodidad y seguridad.', 'renting', 'coches', 55.00, ARRAY['4x4_1.jpg'], '4x4', 'Toyota RAV4, 7 plazas, GPS, portaequipajes, aire acondicionado', true, false, false),
('Coche Eléctrico Eco', 'Movilidad sostenible y silenciosa. Perfecto para recorridos urbanos y rutas ecológicas por la isla.', 'renting', 'coches', 40.00, ARRAY['electric1.jpg'], 'Coche Eléctrico', 'Tesla Model 3, autopilot, carga rápida, GPS premium', true, true, false);

-- Motos y Scooters
INSERT INTO services (title, description, category_id, subcategory_id, price, images, vehicle_type, characteristics, insurance_included, fuel_included, featured) VALUES
('Scooter 125cc Retro', 'Movilidad urbana con estilo vintage. Perfecto para recorrer Santa Cruz y las zonas costeras con facilidad.', 'renting', 'motos', 30.00, ARRAY['scooter1.jpg'], 'Scooter', '125cc, baúl trasero, casco incluido, estilo vintage', true, false, false),
('Moto Deportiva 600cc', 'Para los amantes de la velocidad y las curvas. Recorre las carreteras más espectaculares de Tenerife.', 'renting', 'motos', 65.00, ARRAY['moto1.jpg'], 'Motocicleta', '600cc, ABS, maletas laterales, casco integral incluido', true, false, false);

-- Bicicletas
INSERT INTO services (title, description, category_id, subcategory_id, price, images, vehicle_type, characteristics, insurance_included, fuel_included, featured) VALUES
('Bicicleta Eléctrica Premium', 'Recorre Tenerife de forma ecológica con nuestras e-bikes de alta gama. Batería de larga duración y GPS incluido.', 'renting', 'bicicletas', 25.00, ARRAY['ebike1.jpg'], 'Bicicleta Eléctrica', 'Autonomía 80km, GPS, casco, candado, kit reparación', true, true, false),
('Bicicleta de Montaña', 'Para los amantes del ciclismo de montaña. Explora los senderos más desafiantes de Tenerife.', 'renting', 'bicicletas', 20.00, ARRAY['mtb1.jpg'], 'Bicicleta MTB', 'Suspensión completa, 27 velocidades, casco, protecciones', true, true, false);

-- Vehículos Especiales
INSERT INTO services (title, description, category_id, subcategory_id, price, images, vehicle_type, characteristics, insurance_included, fuel_included, featured) VALUES
('Furgoneta Camper', 'Libertad total para explorar Tenerife. Furgoneta equipada para dormir y cocinar, perfecta para aventureros.', 'renting', 'especiales', 75.00, ARRAY['camper1.jpg'], 'Furgoneta Camper', 'Cama doble, cocina, nevera, ducha exterior, mesa y sillas', true, false, false);

-- EXPERIENCIAS GASTRONÓMICAS

-- Restaurantes y Cenas
INSERT INTO services (title, description, category_id, subcategory_id, price, images, menu, schedule, capacity, dietary_options, featured) VALUES
('Cena con Vista al Océano', 'Disfruta de la mejor gastronomía canaria con vistas espectaculares al Atlántico. Menú degustación con productos locales.', 'gastronomia', 'restaurantes', 28.00, ARRAY['ocean_dinner1.jpg'], 'Menú degustación 5 platos, vinos locales incluidos, vista panorámica al mar, música en vivo', '19:00-23:00', 50, ARRAY['vegetariano', 'sin_gluten'], true),
('Cena Romántica en Acantilados', 'Cena íntima para parejas en los acantilados de Los Gigantes. Atardecer, velas y cocina de autor.', 'gastronomia', 'restaurantes', 65.00, ARRAY['romantic1.jpg'], 'Menú romántico 4 platos, vino espumoso, velas, música ambiente', '18:30-22:00', 10, ARRAY['vegetariano'], false);

-- Tours Gastronómicos
INSERT INTO services (title, description, category_id, subcategory_id, price, images, menu, schedule, capacity, dietary_options, featured) VALUES
('Tour Gastronómico Local', 'Descubre los sabores auténticos de Tenerife visitando mercados locales y tabernas tradicionales con guía experto.', 'gastronomia', 'tours', 32.00, ARRAY['food_tour1.jpg'], '5 paradas gastronómicas, degustaciones incluidas, guía gastronómico local, recetas tradicionales', '10:00-14:00', 12, ARRAY['vegetariano'], true),
('Ruta de Tapas Tradicionales', 'Recorrido por las mejores tabernas de La Laguna. Tapas auténticas y ambiente local genuino.', 'gastronomia', 'tours', 22.00, ARRAY['tapas1.jpg'], '6 tapas tradicionales, 3 bebidas, guía gastronómico local', '19:00-22:30', 16, ARRAY['vegetariano'], false);

-- Talleres de Cocina
INSERT INTO services (title, description, category_id, subcategory_id, price, images, menu, schedule, capacity, dietary_options, featured) VALUES
('Cocina Canaria Tradicional', 'Aprende a cocinar platos típicos canarios en una experiencia interactiva. Incluye degustación y recetas para llevar.', 'gastronomia', 'talleres', 38.00, ARRAY['cooking1.jpg'], 'Taller de papas arrugadas, mojo picón, gofio, pescado a la sal', '11:00-15:00', 8, ARRAY['vegetariano', 'vegano'], false);

-- Eventos Especiales
INSERT INTO services (title, description, category_id, subcategory_id, price, images, menu, schedule, capacity, dietary_options, featured) VALUES
('Experiencia Vinícola Tacoronte', 'Visita a bodega familiar con cata de vinos DO Tacoronte-Acentejo. Incluye maridaje con quesos y productos locales.', 'gastronomia', 'eventos', 28.00, ARRAY['wine1.jpg'], 'Cata de 5 vinos, tabla de quesos canarios, miel de palma, mojos', '16:00-19:00', 20, ARRAY['vegetariano'], false),
('Desayuno con Delfines', 'Desayuno especial a bordo mientras navegamos en busca de delfines. Productos locales y vistas espectaculares.', 'gastronomia', 'eventos', 35.00, ARRAY['breakfast1.jpg'], 'Desayuno canario completo, frutas tropicales, café de especialidad', '08:00-11:00', 25, ARRAY['vegetariano', 'vegano'], false);
