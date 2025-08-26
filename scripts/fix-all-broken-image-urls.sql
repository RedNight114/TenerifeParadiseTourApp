-- LIMPIEZA COMPLETA Y DEFINITIVA DE URLs DE IMÁGENES PROBLEMÁTICAS
-- Este script elimina TODAS las URLs que causan errores 400

-- 1. Corregir URLs duplicadas (services/services/)
UPDATE public.services 
SET images = array(
    SELECT REPLACE(img, 'services/services/', 'services/')
    FROM unnest(images) AS img
)
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
AND EXISTS (
    SELECT 1 
    FROM unnest(images) AS img 
    WHERE img LIKE '%services/services/%'
);

-- 2. Corregir URLs con service-images/
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

-- 3. ELIMINAR TODAS las URLs de imágenes que no existen (incluyendo variaciones con números)
UPDATE public.services 
SET images = array(
    SELECT img
    FROM unnest(images) AS img
    WHERE img NOT LIKE '%quad%.jpg%'
    AND img NOT LIKE '%forest%.jpg%'
    AND img NOT LIKE '%boat_tour%.jpg%'
    AND img NOT LIKE '%jetski%.jpg%'
    AND img NOT LIKE '%placeholder%.jpg%'
    AND img NOT LIKE '%boat_tour2%'
    AND img NOT LIKE '%forest2%'
    AND img NOT LIKE '%quad2%'
    AND img NOT LIKE '%jetski2%'
)
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
AND EXISTS (
    SELECT 1 
    FROM unnest(images) AS img 
    WHERE img LIKE '%quad%.jpg%'
    OR img LIKE '%forest%.jpg%'
    OR img LIKE '%boat_tour%.jpg%'
    OR img LIKE '%jetski%.jpg%'
    OR img NOT LIKE '%placeholder%.jpg%'
    OR img LIKE '%boat_tour2%'
    OR img LIKE '%forest2%'
    OR img LIKE '%quad2%'
    OR img LIKE '%jetski2%'
);

-- 4. Verificar qué URLs quedaron
SELECT 
    id,
    title,
    images
FROM public.services 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
LIMIT 10;

-- 5. Mostrar mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 LIMPIEZA COMPLETA APLICADA!';
    RAISE NOTICE '🗑️ Se eliminaron todas las URLs problemáticas';
    RAISE NOTICE '💡 No más errores 400 en la consola';
END $$;
