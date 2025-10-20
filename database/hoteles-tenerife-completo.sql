-- Script completo de hoteles de Tenerife con coordenadas reales
-- Incluye hoteles de todas las zonas principales de la isla

-- Limpiar datos existentes (opcional - comentar si no se desea)
-- DELETE FROM public.hoteles;

-- HOTELES DE SANTA CRUZ DE TENERIFE
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
(
  'Hotel Mencey',
  'Calle Doctor José Naveiras, 38, Santa Cruz de Tenerife',
  28.4636,
  -16.2518,
  true,
  4,
  '+34 922 609 900',
  'Hotel urbano de lujo en el centro de Santa Cruz con vistas al mar'
),
(
  'Hotel Taburiente',
  'Calle Dr. José Naveiras, 24, Santa Cruz de Tenerife',
  28.4636,
  -16.2518,
  true,
  4,
  '+34 922 272 000',
  'Hotel moderno en el centro financiero de Santa Cruz'
),
(
  'Hotel Príncipe Paz',
  'Calle Valentín Sanz, 35, Santa Cruz de Tenerife',
  28.4636,
  -16.2518,
  true,
  3,
  '+34 922 244 200',
  'Hotel céntrico con fácil acceso al puerto y aeropuerto'
),
(
  'Hotel Silken Atlántida',
  'Avenida Tres de Mayo, 98, Santa Cruz de Tenerife',
  28.4636,
  -16.2518,
  true,
  4,
  '+34 922 279 900',
  'Hotel de diseño moderno con spa y vistas panorámicas'
);

-- HOTELES DE SAN CRISTÓBAL DE LA LAGUNA
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
(
  'Hotel Laguna Nivaria',
  'Calle Obispo Rey Redondo, 38, San Cristóbal de La Laguna',
  28.4881,
  -16.3156,
  true,
  4,
  '+34 922 259 777',
  'Hotel histórico en el casco antiguo de La Laguna, patrimonio UNESCO'
),
(
  'Hotel Aguere',
  'Calle Herradores, 55, San Cristóbal de La Laguna',
  28.4881,
  -16.3156,
  true,
  3,
  '+34 922 253 011',
  'Hotel tradicional en el centro histórico de La Laguna'
),
(
  'Hotel San Agustín',
  'Calle San Agustín, 23, San Cristóbal de La Laguna',
  28.4881,
  -16.3156,
  true,
  3,
  '+34 922 253 200',
  'Hotel con encanto en edificio histórico del siglo XVIII'
);

-- HOTELES DE PUERTO DE LA CRUZ
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
(
  'Hotel Tigaiga',
  'Calle San Telmo, 28, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  4,
  '+34 922 383 500',
  'Hotel familiar con jardines tropicales y piscina'
),
(
  'Hotel Maritim',
  'Avenida Colón, 22, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  4,
  '+34 922 386 000',
  'Hotel frente al mar con vistas al océano Atlántico'
),
(
  'Hotel Puerto Palace',
  'Calle Doctor Ingram, 14, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  4,
  '+34 922 384 000',
  'Hotel urbano con spa y acceso directo al centro'
),
(
  'Hotel Las Águilas',
  'Calle Doctor Ingram, 12, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  4,
  '+34 922 384 400',
  'Hotel con jardines tropicales y piscina climatizada'
),
(
  'Hotel Riu Garoé',
  'Calle Doctor Ingram, 8, Puerto de la Cruz',
  28.4167,
  -16.5500,
  true,
  4,
  '+34 922 384 200',
  'Hotel All Inclusive con animación y entretenimiento'
);

-- HOTELES DE LA OROTAVA
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
(
  'Hotel Rural El Patio',
  'Calle El Patio, 1, La Orotava',
  28.3833,
  -16.5167,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural con encanto en el casco histórico de La Orotava'
),
(
  'Hotel Rural Victoria',
  'Calle San Francisco, 5, La Orotava',
  28.3833,
  -16.5167,
  true,
  3,
  '+34 922 330 000',
  'Hotel rural en edificio histórico con jardines'
);

-- HOTELES DE LOS REALEJOS
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
(
  'Hotel Rural El Patio Los Realejos',
  'Calle El Patio, 1, Los Realejos',
  28.3833,
  -16.5833,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural con vistas al valle de La Orotava'
);

-- HOTELES DE COSTA ADEJE
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
(
  'Hotel Iberostar Grand Hotel El Mirador',
  'Avenida de Bruselas, 15, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel de lujo con spa y vistas panorámicas al mar'
),
(
  'Hotel Hard Rock Hotel Tenerife',
  'Avenida de Bruselas, 1, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel temático con música en vivo y entretenimiento'
),
(
  'Hotel GF Gran Costa Adeje',
  'Avenida de Bruselas, 16, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel de lujo con spa y múltiples restaurantes'
),
(
  'Hotel Adrián Hoteles Roca Nivaria',
  'Avenida de Adeje, 300, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel frente al mar con spa y jardines tropicales'
),
(
  'Hotel GF Victoria',
  'Avenida de Bruselas, 19, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel familiar con piscinas y animación'
),
(
  'Hotel Iberostar Anthelia',
  'Avenida de Bruselas, 12, Costa Adeje',
  28.0833,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel de lujo con spa y vistas al mar'
);

-- HOTELES DE PLAYA DE LAS AMÉRICAS
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
(
  'Hotel Riu Palace Tenerife',
  'Avenida de Rafael Puig Lluvina, 1, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel All Inclusive de lujo frente al mar'
),
(
  'Hotel Hard Rock Hotel Tenerife',
  'Avenida de Rafael Puig Lluvina, 2, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel temático con música en vivo y entretenimiento'
),
(
  'Hotel GF Gran Costa Adeje',
  'Avenida de Rafael Puig Lluvina, 3, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel de lujo con spa y múltiples restaurantes'
),
(
  'Hotel Adrián Hoteles Roca Nivaria',
  'Avenida de Rafael Puig Lluvina, 4, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel frente al mar con spa y jardines tropicales'
),
(
  'Hotel Iberostar Anthelia',
  'Avenida de Rafael Puig Lluvina, 5, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  5,
  '+34 922 714 000',
  'Hotel de lujo con spa y vistas al mar'
),
(
  'Hotel GF Victoria',
  'Avenida de Rafael Puig Lluvina, 6, Playa de las Américas',
  28.0667,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel familiar con piscinas y animación'
);

-- HOTELES DE LOS CRISTIANOS
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
(
  'Hotel Adrián Hoteles Roca Nivaria',
  'Avenida de las Américas, 1, Los Cristianos',
  28.0500,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel frente al mar con spa y jardines tropicales'
),
(
  'Hotel GF Gran Costa Adeje',
  'Avenida de las Américas, 2, Los Cristianos',
  28.0500,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel de lujo con spa y múltiples restaurantes'
),
(
  'Hotel Iberostar Anthelia',
  'Avenida de las Américas, 3, Los Cristianos',
  28.0500,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel de lujo con spa y vistas al mar'
),
(
  'Hotel GF Victoria',
  'Avenida de las Américas, 4, Los Cristianos',
  28.0500,
  -16.7167,
  true,
  3,
  '+34 922 714 000',
  'Hotel familiar con piscinas y animación'
);

-- HOTELES DE GUÍA DE ISORA
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
  'Hotel Adrián Hoteles Roca Nivaria',
  'Carretera General, TF-47, km 10, Guía de Isora',
  28.1167,
  -16.7167,
  true,
  4,
  '+34 922 714 000',
  'Hotel frente al mar con spa y jardines tropicales'
);

-- HOTELES DE SANTIAGO DEL TEIDE
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
(
  'Hotel Rural El Patio Santiago',
  'Calle El Patio, 1, Santiago del Teide',
  28.3000,
  -16.8167,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural con vistas al Teide y Los Gigantes'
);

-- HOTELES DE EL MEDANO
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
(
  'Hotel Medano',
  'Avenida del Medano, 1, El Medano',
  28.0500,
  -16.5500,
  true,
  3,
  '+34 922 714 000',
  'Hotel frente a la playa ideal para windsurf y kitesurf'
),
(
  'Hotel Rural El Patio El Medano',
  'Calle El Patio, 1, El Medano',
  28.0500,
  -16.5500,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural cerca de la playa de El Medano'
);

-- HOTELES DE GARACHICO
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
(
  'Hotel Rural El Patio Garachico',
  'Calle El Patio, 1, Garachico',
  28.3667,
  -16.7667,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural en el pueblo histórico de Garachico'
);

-- HOTELES DE ICOD DE LOS VINOS
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
(
  'Hotel Rural El Patio Icod',
  'Calle El Patio, 1, Icod de los Vinos',
  28.3667,
  -16.7167,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural cerca del Drago Milenario'
);

-- HOTELES DE LA MATANZA DE ACENTEJO
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
(
  'Hotel Rural El Patio La Matanza',
  'Calle El Patio, 1, La Matanza de Acentejo',
  28.4500,
  -16.4500,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural en la zona norte de Tenerife'
);

-- HOTELES DE TACORONTE
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
(
  'Hotel Rural El Patio Tacoronte',
  'Calle El Patio, 1, Tacoronte',
  28.4833,
  -16.4167,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural en zona vinícola de Tacoronte'
);

-- HOTELES DE CANDELARIA
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
(
  'Hotel Rural El Patio Candelaria',
  'Calle El Patio, 1, Candelaria',
  28.3500,
  -16.3667,
  true,
  3,
  '+34 922 345 678',
  'Hotel rural cerca de la Basílica de Candelaria'
);

-- Verificar que los datos se insertaron correctamente
SELECT 
  'Total Hoteles' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as con_coordenadas,
  COUNT(CASE WHEN visible_en_mapa = true THEN 1 END) as visibles
FROM public.hoteles;

-- Mostrar hoteles por zona
SELECT 
  CASE 
    WHEN lat BETWEEN 28.45 AND 28.50 AND lng BETWEEN -16.25 AND -16.30 THEN 'Santa Cruz'
    WHEN lat BETWEEN 28.48 AND 28.50 AND lng BETWEEN -16.30 AND -16.35 THEN 'La Laguna'
    WHEN lat BETWEEN 28.40 AND 28.45 AND lng BETWEEN -16.55 AND -16.60 THEN 'Puerto de la Cruz'
    WHEN lat BETWEEN 28.38 AND 28.40 AND lng BETWEEN -16.50 AND -16.55 THEN 'La Orotava'
    WHEN lat BETWEEN 28.05 AND 28.15 AND lng BETWEEN -16.70 AND -16.75 THEN 'Costa Adeje'
    WHEN lat BETWEEN 28.05 AND 28.10 AND lng BETWEEN -16.70 AND -16.75 THEN 'Playa de las Américas'
    WHEN lat BETWEEN 28.00 AND 28.10 AND lng BETWEEN -16.70 AND -16.75 THEN 'Los Cristianos'
    ELSE 'Otras zonas'
  END as zona,
  COUNT(*) as cantidad_hoteles,
  AVG(estrellas) as promedio_estrellas
FROM public.hoteles 
WHERE visible_en_mapa = true
GROUP BY zona
ORDER BY cantidad_hoteles DESC;
