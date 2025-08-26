-- Ejemplos de uso del sistema de precios por edad
-- Este script muestra cómo usar las funciones del sistema

-- 1. Aplicar una plantilla predefinida a un servicio
-- Reemplaza 'SERVICE_ID_AQUI' con el ID real del servicio
SELECT 'Aplicando plantilla estándar al servicio...' as info;

-- Ejemplo: aplicar plantilla estándar (ID 1)
-- SELECT apply_age_range_template('SERVICE_ID_AQUI'::UUID, 1);

-- 2. Crear rangos personalizados para un servicio
-- Ejemplo: crear rango personalizado para bebés
-- SELECT create_custom_age_range(
--   'SERVICE_ID_AQUI'::UUID,
--   'Bebés Especiales',
--   0,  -- edad mínima
--   3,  -- edad máxima
--   2.50,  -- precio
--   'per_person',
--   'Precio especial para bebés de 0-3 años'
-- );

-- 3. Ver los rangos de edad configurados para un servicio
-- SELECT * FROM get_service_age_pricing('SERVICE_ID_AQUI'::UUID);

-- 4. Ver todas las plantillas disponibles
SELECT 'Plantillas disponibles:' as info;
SELECT 
  id,
  template_name,
  description,
  is_default
FROM age_range_templates
ORDER BY id;

-- 5. Ver rangos de edad de todos los servicios
SELECT 'Rangos de edad configurados:' as info;
SELECT 
  s.title as servicio,
  apr.range_name,
  apr.min_age,
  apr.max_age,
  apr.price,
  apr.price_type,
  apr.description
FROM age_price_ranges apr
JOIN services s ON s.id = apr.service_id
WHERE apr.is_active = true
ORDER BY s.title, apr.min_age;

-- 6. Ver estadísticas del sistema
SELECT 'Estadísticas del sistema:' as info;
SELECT 
  COUNT(DISTINCT s.id) as total_servicios,
  COUNT(apr.id) as total_rangos_edad,
  COUNT(DISTINCT apr.service_id) as servicios_con_precios_edad,
  ROUND(AVG(apr.price), 2) as precio_promedio_rangos
FROM services s
LEFT JOIN age_price_ranges apr ON s.id = apr.service_id AND apr.is_active = true
WHERE s.available = true;

-- 7. Ejemplo de consulta para obtener precios por edad de un servicio específico
-- SELECT 
--   'Precios por edad del servicio:' as info,
--   s.title,
--   s.price as precio_base
-- FROM services s
-- WHERE s.id = 'SERVICE_ID_AQUI'::UUID;

-- SELECT 
--   apr.range_name,
--   apr.min_age || '-' || apr.max_age as rango_edad,
--   apr.price,
--   apr.price_type,
--   apr.description
-- FROM age_price_ranges apr
-- WHERE apr.service_id = 'SERVICE_ID_AQUI'::UUID
-- AND apr.is_active = true
-- ORDER BY apr.min_age;

-- 8. Crear un rango personalizado completo
-- Ejemplo: Rango para niños de 4-8 años con precio especial
/*
INSERT INTO age_price_ranges (
  service_id,
  range_name,
  min_age,
  max_age,
  price,
  price_type,
  description
) VALUES (
  'SERVICE_ID_AQUI'::UUID,
  'Niños Pequeños',
  4,
  8,
  15.00,
  'per_person',
  'Precio especial para niños de 4-8 años'
);
*/

-- 9. Actualizar un rango existente
-- Ejemplo: cambiar el precio de un rango
/*
UPDATE age_price_ranges 
SET 
  price = 18.50,
  description = 'Precio actualizado para niños de 4-8 años'
WHERE 
  service_id = 'SERVICE_ID_AQUI'::UUID 
  AND range_name = 'Niños Pequeños';
*/

-- 10. Desactivar un rango (eliminación lógica)
-- Ejemplo: desactivar un rango de edad
/*
UPDATE age_price_ranges 
SET is_active = false
WHERE 
  service_id = 'SERVICE_ID_AQUI'::UUID 
  AND range_name = 'Rango a eliminar';
*/

-- 11. Ver servicios sin precios por edad configurados
SELECT 'Servicios sin precios por edad:' as info;
SELECT 
  s.id,
  s.title,
  s.price as precio_base
FROM services s
WHERE s.available = true
AND NOT EXISTS (
  SELECT 1 FROM age_price_ranges apr 
  WHERE apr.service_id = s.id AND apr.is_active = true
);

-- 12. Ver rangos de edad duplicados o conflictivos
SELECT 'Verificar rangos conflictivos:' as info;
SELECT 
  service_id,
  min_age,
  max_age,
  COUNT(*) as cantidad
FROM age_price_ranges
WHERE is_active = true
GROUP BY service_id, min_age, max_age
HAVING COUNT(*) > 1;

-- 13. Limpiar rangos duplicados (si existen)
-- DELETE FROM age_price_ranges 
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id,
--       ROW_NUMBER() OVER (
--         PARTITION BY service_id, min_age, max_age 
--         ORDER BY created_at DESC
--       ) as rn
--     FROM age_price_ranges
--     WHERE is_active = true
--   ) t
--   WHERE t.rn > 1
-- );

-- 14. Verificar integridad de datos
SELECT 'Verificación de integridad:' as info;
SELECT 
  'Rangos con edades inválidas' as problema,
  COUNT(*) as cantidad
FROM age_price_ranges
WHERE min_age < 0 OR max_age < min_age OR max_age > 120

UNION ALL

SELECT 
  'Rangos con precios negativos' as problema,
  COUNT(*) as cantidad
FROM age_price_ranges
WHERE price < 0

UNION ALL

SELECT 
  'Rangos sin nombre' as problema,
  COUNT(*) as cantidad
FROM age_price_ranges
WHERE range_name IS NULL OR trim(range_name) = '';

-- 15. Resumen final
SELECT '✅ Sistema de precios por edad configurado correctamente' as estado;
