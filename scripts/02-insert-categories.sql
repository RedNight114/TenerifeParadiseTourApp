-- Insertar categorías principales
INSERT INTO categories (id, name, description, icon, color) VALUES
('actividades', 'Actividades & Aventuras', 'Descubre la naturaleza salvaje de Tenerife con nuestras emocionantes aventuras', 'Activity', 'from-green-500 to-emerald-600'),
('renting', 'Alquiler de Vehículos', 'Explora Tenerife a tu ritmo con nuestra flota de vehículos', 'Car', 'from-blue-500 to-cyan-600'),
('gastronomia', 'Experiencias Gastronómicas', 'Saborea la auténtica cocina canaria y los mejores restaurantes', 'Utensils', 'from-orange-500 to-red-600');

-- Insertar subcategorías para Actividades & Aventuras
INSERT INTO subcategories (id, category_id, name, description, icon) VALUES
('excursiones', 'actividades', 'Excursiones y Tours', 'Tours guiados a los lugares más emblemáticos de Tenerife', '🗺️'),
('aventura', 'actividades', 'Deportes de Aventura', 'Actividades emocionantes para los más aventureros', '🧗'),
('acuaticas', 'actividades', 'Actividades Acuáticas', 'Diversión y aventura en el océano Atlántico', '🌊'),
('naturaleza', 'actividades', 'Naturaleza y Senderismo', 'Conecta con la naturaleza en paisajes únicos', '🌿');

-- Insertar subcategorías para Alquiler de Vehículos
INSERT INTO subcategories (id, category_id, name, description, icon) VALUES
('coches', 'renting', 'Coches y Todoterrenos', 'Vehículos cómodos para recorrer toda la isla', '🚗'),
('motos', 'renting', 'Motos y Scooters', 'Movilidad ágil y divertida por la ciudad y carreteras', '🏍️'),
('bicicletas', 'renting', 'Bicicletas', 'Transporte ecológico y saludable', '🚲'),
('especiales', 'renting', 'Vehículos Especiales', 'Experiencias únicas de movilidad', '🚐');

-- Insertar subcategorías para Experiencias Gastronómicas
INSERT INTO subcategories (id, category_id, name, description, icon) VALUES
('restaurantes', 'gastronomia', 'Restaurantes y Cenas', 'Los mejores restaurantes con vistas espectaculares', '🍽️'),
('tours', 'gastronomia', 'Tours Gastronómicos', 'Descubre los sabores locales con expertos', '🥘'),
('talleres', 'gastronomia', 'Talleres de Cocina', 'Aprende a cocinar platos tradicionales canarios', '👨‍🍳'),
('eventos', 'gastronomia', 'Eventos Especiales', 'Experiencias gastronómicas únicas y memorables', '🎉');
