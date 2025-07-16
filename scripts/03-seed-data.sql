-- Insertar servicios de ejemplo
INSERT INTO services (title, description, category, price, images, duration, location, min_group_size) VALUES
('Senderismo en la Sierra', 'Excursión guiada por los senderos más espectaculares de la sierra', 'actividades', 45.00, ARRAY['hiking1.jpg', 'hiking2.jpg'], 240, 'Sierra de Guadarrama', 4),
('Tour en Kayak', 'Aventura en kayak por el río con instructor certificado', 'actividades', 35.00, ARRAY['kayak1.jpg', 'kayak2.jpg'], 180, 'Río Tajo', 2),
('Escalada en Roca', 'Iniciación a la escalada en roca con equipo incluido', 'actividades', 55.00, ARRAY['climbing1.jpg'], 300, 'Patones de Arriba', 3);

INSERT INTO services (title, description, category, price, images, vehicle_type, characteristics, insurance_included) VALUES
('Bicicleta Eléctrica', 'Bicicleta eléctrica de alta gama para recorrer la ciudad', 'renting', 25.00, ARRAY['ebike1.jpg', 'ebike2.jpg'], 'Bicicleta', 'Batería 50km autonomía, GPS incluido', true),
('Scooter 125cc', 'Scooter ideal para moverse por la ciudad', 'renting', 35.00, ARRAY['scooter1.jpg'], 'Scooter', '125cc, casco incluido, baúl trasero', true),
('Coche Compacto', 'Vehículo compacto perfecto para parejas', 'renting', 45.00, ARRAY['car1.jpg'], 'Automóvil', 'Aire acondicionado, GPS, 5 puertas', true);

INSERT INTO services (title, description, category, price, images, menu, schedule, capacity) VALUES
('Restaurante El Mirador', 'Cocina tradicional con vistas panorámicas', 'gastronomia', 28.00, ARRAY['restaurant1.jpg', 'restaurant2.jpg'], 'Menú degustación: Entrantes, plato principal, postre', '12:00-16:00, 20:00-24:00', 50),
('Taberna Los Arcos', 'Tapas y vinos locales en ambiente acogedor', 'gastronomia', 18.00, ARRAY['tavern1.jpg'], 'Tapas variadas, tabla de quesos, vinos DO', '18:00-02:00', 30),
('Café Artesano', 'Café de especialidad y repostería casera', 'gastronomia', 12.00, ARRAY['cafe1.jpg'], 'Desayunos, brunch, café de especialidad', '08:00-18:00', 25);
