-- Script de prueba rápida para el sistema de precios por edad
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar que las tablas existen
SELECT '🔍 Verificando tablas...' as info;
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Existe'
    ELSE '❌ No existe'
  END as estado
FROM (
  SELECT 'age_price_ranges' as table_name
  UNION ALL
  SELECT 'age_range_templates'
) t
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = t.table_name
);

-- 2. Verificar plantillas predefinidas
SELECT '📋 Verificando plantillas...' as info;
SELECT 
  id,
  template_name,
  description,
  is_default
FROM age_range_templates
ORDER BY id;

-- 3. Verificar funciones
SELECT '⚙️ Verificando funciones...' as info;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'apply_age_range_template',
  'create_custom_age_range',
  'get_service_age_pricing'
)
ORDER BY routine_name;

-- 4. Probar creación de rango (si hay servicios)
DO $$
DECLARE
  test_service_id UUID;
  new_range_id INTEGER;
BEGIN
  -- Obtener el primer servicio disponible
  SELECT id INTO test_service_id FROM services WHERE available = true LIMIT 1;
  
  IF test_service_id IS NOT NULL THEN
    RAISE NOTICE '🧪 Probando con servicio: %', test_service_id;
    
    -- Crear un rango de prueba
    SELECT create_custom_age_range(
      test_service_id,
      'Rango de Prueba',
      0,  -- edad mínima
      5,  -- edad máxima
      15.50,  -- precio
      'per_person',
      'Rango de prueba para verificar el sistema'
    ) INTO new_range_id;
    
    RAISE NOTICE '✅ Rango creado con ID: %', new_range_id;
    
  ELSE
    RAISE NOTICE '⚠️ No hay servicios disponibles para probar';
  END IF;
END $$;

-- 5. Verificar rangos creados
SELECT '📊 Rangos de edad creados:' as info;
SELECT 
  s.title as servicio,
  apr.range_name,
  apr.min_age,
  apr.max_age,
  apr.price,
  apr.price_type
FROM age_price_ranges apr
JOIN services s ON s.id = apr.service_id
WHERE apr.is_active = true
ORDER BY s.title, apr.min_age;

-- 6. Resumen final
SELECT '🎉 PRUEBA COMPLETADA' as estado;
SELECT 
  COUNT(*) as total_rangos,
  COUNT(DISTINCT service_id) as servicios_con_rangos
FROM age_price_ranges
WHERE is_active = true;
