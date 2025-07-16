-- Insertar más servicios de ejemplo para cada categoría

-- ACTIVIDADES & AVENTURAS
INSERT INTO services (title, description, category, price, images, duration, location, min_group_size) VALUES
('Excursión al Volcán Teide', 'Descubre el pico más alto de España con nuestro tour guiado. Incluye transporte, guía experto y almuerzo tradicional canario.', 'actividades', 45.00, ARRAY['teide1.jpg', 'teide2.jpg'], 480, 'Parque Nacional del Teide', 2),
('Avistamiento de Ballenas y Delfines', 'Experiencia única navegando para avistar ballenas piloto y delfines en su hábitat natural. Incluye hidrófonos y biólogo marino.', 'actividades', 38.00, ARRAY['whales1.jpg', 'whales2.jpg'], 180, 'Puerto Colón, Costa Adeje', 1),
('Senderismo Bosque de Anaga', 'Explora el bosque de laurisilva más antiguo de Europa. Senderos mágicos entre nieblas y vegetación prehistórica.', 'actividades', 35.00, ARRAY['anaga1.jpg', 'anaga2.jpg'], 300, 'Parque Rural de Anaga', 4),
('Barranco del Infierno', 'Aventura de barranquismo en uno de los barrancos más espectaculares de Tenerife. Incluye equipo completo y instructor.', 'actividades', 65.00, ARRAY['barranco1.jpg'], 360, 'Adeje', 2),
('Quad Adventure Teide', 'Aventura en quad por los senderos volcánicos del Teide. Rutas guiadas para todos los niveles con paradas fotográficas.', 'actividades', 55.00, ARRAY['quad1.jpg', 'quad2.jpg'], 240, 'Las Cañadas del Teide', 1),
('Snorkel en El Puertito', 'Descubre la vida marina de Tenerife en una de las mejores zonas de snorkel. Equipo incluido y guía acuático.', 'actividades', 25.00, ARRAY['snorkel1.jpg'], 120, 'El Puertito, Arona', 2),
('Escalada en Arico', 'Iniciación a la escalada en roca volcánica con vistas al océano. Equipo completo y instructor certificado.', 'actividades', 50.00, ARRAY['climbing1.jpg'], 240, 'Arico', 2),
('Paragliding Tenerife', 'Vuela sobre los paisajes más espectaculares de Tenerife. Vuelo en tándem con instructor experimentado.', 'actividades', 85.00, ARRAY['paragliding1.jpg'], 180, 'Izaña', 1);

-- ALQUILER DE VEHÍCULOS
INSERT INTO services (title, description, category, price, images, vehicle_type, characteristics, insurance_included) VALUES
('Coche Descapotable Premium', 'Explora Tenerife con estilo en nuestros descapotables. Perfecto para parejas románticas o aventuras costeras.', 'renting', 45.00, ARRAY['convertible1.jpg'], 'Descapotable', 'BMW Serie 2, GPS, Bluetooth, aire acondicionado', true),
('Todoterreno 4x4 Familiar', 'Vehículo ideal para familias aventureras. Accede a cualquier rincón de la isla con total comodidad y seguridad.', 'renting', 55.00, ARRAY['4x4_1.jpg'], '4x4', 'Toyota RAV4, 7 plazas, GPS, portaequipajes', true),
('Bicicleta Eléctrica Premium', 'Recorre Tenerife de forma ecológica con nuestras e-bikes de alta gama. Batería de larga duración y GPS incluido.', 'renting', 25.00, ARRAY['ebike1.jpg'], 'Bicicleta Eléctrica', 'Autonomía 80km, GPS, casco, candado, kit reparación', true),
('Scooter 125cc Retro', 'Movilidad urbana con estilo vintage. Perfecto para recorrer Santa Cruz y las zonas costeras con facilidad.', 'renting', 30.00, ARRAY['scooter1.jpg'], 'Scooter', '125cc, baúl trasero, casco incluido, seguro a todo riesgo', true),
('Furgoneta Camper', 'Libertad total para explorar Tenerife. Furgoneta equipada para dormir y cocinar, perfecta para aventureros.', 'renting', 75.00, ARRAY['camper1.jpg'], 'Furgoneta Camper', 'Cama doble, cocina, nevera, ducha exterior, mesa y sillas', true),
('Moto Deportiva 600cc', 'Para los amantes de la velocidad y las curvas. Recorre las carreteras más espectaculares de Tenerife.', 'renting', 65.00, ARRAY['moto1.jpg'], 'Motocicleta', '600cc, ABS, maletas laterales, casco integral', true),
('Coche Eléctrico Eco', 'Movilidad sostenible y silenciosa. Perfecto para recorridos urbanos y rutas ecológicas por la isla.', 'renting', 40.00, ARRAY['electric1.jpg'], 'Coche Eléctrico', 'Tesla Model 3, autopilot, carga rápida, GPS premium', true),
('Bicicleta de Montaña', 'Para los amantes del ciclismo de montaña. Explora los senderos más desafiantes de Tenerife.', 'renting', 20.00, ARRAY['mtb1.jpg'], 'Bicicleta MTB', 'Suspensión completa, 27 velocidades, casco, protecciones', true);

-- EXPERIENCIAS GASTRONÓMICAS
INSERT INTO services (title, description, category, price, images, menu, schedule, capacity) VALUES
('Cena con Vista al Teide', 'Experiencia gastronómica única con vistas panorámicas al volcán Teide. Cocina canaria de autor con productos locales.', 'gastronomia', 45.00, ARRAY['dinner_teide1.jpg'], 'Menú degustación 6 platos: Entrantes canarios, pescado del día, carne de cabra, postres tradicionales', '19:00-23:00', 40),
('Tour Gastronómico Santa Cruz', 'Descubre los sabores auténticos de Santa Cruz visitando mercados locales, tabernas tradicionales y restaurantes emblemáticos.', 'gastronomia', 32.00, ARRAY['food_tour1.jpg'], '5 paradas gastronómicas con degustaciones, bebidas incluidas, recetas tradicionales', '10:00-14:00', 12),
('Experiencia Vinícola Tacoronte', 'Visita a bodega familiar con cata de vinos DO Tacoronte-Acentejo. Incluye maridaje con quesos y productos locales.', 'gastronomia', 28.00, ARRAY['wine1.jpg'], 'Cata de 5 vinos, tabla de quesos canarios, miel de palma, mojos', '16:00-19:00', 20),
('Cocina Canaria Tradicional', 'Aprende a cocinar platos típicos canarios en una experiencia interactiva. Incluye degustación y recetas para llevar.', 'gastronomia', 38.00, ARRAY['cooking1.jpg'], 'Taller de papas arrugadas, mojo picón, gofio, pescado a la sal', '11:00-15:00', 8),
('Desayuno con Delfines', 'Desayuno especial a bordo mientras navegamos en busca de delfines. Productos locales y vistas espectaculares.', 'gastronomia', 35.00, ARRAY['breakfast1.jpg'], 'Desayuno canario completo, frutas tropicales, café de especialidad', '08:00-11:00', 25),
('Picnic Gourmet en Anaga', 'Picnic premium en el corazón del bosque de Anaga. Productos gourmet locales en un entorno mágico.', 'gastronomia', 25.00, ARRAY['picnic1.jpg'], 'Cesta gourmet con productos locales, bebidas, manta y utensilios', '12:00-16:00', 15),
('Cena Romántica en Acantilados', 'Cena íntima para parejas en los acantilados de Los Gigantes. Atardecer, velas y cocina de autor.', 'gastronomia', 65.00, ARRAY['romantic1.jpg'], 'Menú romántico 4 platos, vino espumoso, velas, música ambiente', '18:30-22:00', 10),
('Ruta de Tapas Tradicionales', 'Recorrido por las mejores tabernas de La Laguna. Tapas auténticas y ambiente local genuino.', 'gastronomia', 22.00, ARRAY['tapas1.jpg'], '6 tapas tradicionales, 3 bebidas, guía gastronómico local', '19:00-22:30', 16);

-- Actualizar algunos servicios existentes para que coincidan con los destacados
UPDATE services SET 
  title = 'Excursión al Volcán Teide',
  description = 'Descubre el pico más alto de España con nuestro tour guiado. Incluye transporte, guía experto y almuerzo tradicional canario.',
  price = 45.00,
  duration = 480,
  location = 'Parque Nacional del Teide',
  min_group_size = 2
WHERE title = 'Senderismo en la Sierra';

UPDATE services SET 
  title = 'Avistamiento de Ballenas y Delfines',
  description = 'Experiencia única navegando para avistar ballenas piloto y delfines en su hábitat natural. Incluye hidrófonos y biólogo marino.',
  price = 38.00,
  duration = 180,
  location = 'Puerto Colón, Costa Adeje',
  min_group_size = 1
WHERE title = 'Tour en Kayak';

UPDATE services SET 
  title = 'Cena con Vista al Océano',
  description = 'Disfruta de la mejor gastronomía canaria con vistas espectaculares al Atlántico. Menú degustación con productos locales.',
  price = 28.00,
  menu = 'Menú degustación 5 platos, vinos locales incluidos, vista panorámica al mar, música en vivo',
  schedule = '19:00-23:00',
  capacity = 50
WHERE title = 'Restaurante El Mirador';
