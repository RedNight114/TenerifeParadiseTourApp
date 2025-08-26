-- Script para corregir las URLs de las imágenes en la base de datos
-- Este script soluciona el problema donde las imágenes no se muestran porque las URLs están mal formadas

-- Primero, verificar qué URLs tenemos actualmente
SELECT 
    id,
    title,
    images
FROM public.services 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
LIMIT 5;

-- Corregir las URLs de las imágenes
-- Cambiar 'service-images/' por 'services/' en todas las URLs
UPDATE public.services 
SET images = array(
    SELECT REPLACE(img, 'service-images/', 'services/')
    FROM unnest(images) AS img
)
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
AND EXISTS (
    SELECT 1 
    FROM unnest(images) AS img 
    WHERE img LIKE '%service-images/%'
);

-- Verificar que se corrigieron las URLs
SELECT 
    id,
    title,
    images
FROM public.services 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
LIMIT 5;

-- Mostrar mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 URLs de imágenes corregidas exitosamente!';
    RAISE NOTICE '📸 Las imágenes ahora deberían mostrarse correctamente.';
END $$;
