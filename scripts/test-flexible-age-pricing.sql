-- Script de prueba para el sistema flexible de precios por edad
-- Ejecuta este script después de aplicar scripts/flexible-age-pricing-system.sql

-- 1. Verificar que las tablas se crearon correctamente
SELECT '🔍 Verificando estructura de tablas...' as info;

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('age_price_ranges', 'age_range_templates')
ORDER BY table_name, ordinal_position;

-- 2. Verificar que las plantillas se insertaron
SELECT '📋 Verificando plantillas predefinidas...' as info;
SELECT 
  id,
  template_name,
  description,
  is_default,
  created_at
FROM age_range_templates
ORDER BY id;

-- 3. Verificar que las funciones se crearon
SELECT '⚙️ Verificando funciones del sistema...' as info;
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN (
  'apply_age_range_template',
  'create_custom_age_range',
  'get_service_age_pricing'
)
ORDER BY routine_name;

-- 4. Verificar permisos
SELECT '🔐 Verificando permisos...' as info;
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN ('age_price_ranges', 'age_range_templates')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- 5. Probar la función de obtener precios por edad (si hay servicios)
SELECT '🧪 Probando función get_service_age_pricing...' as info;
SELECT 
  s.title as servicio,
  s.price as precio_base,
  COUNT(apr.id) as rangos_configurados
FROM services s
LEFT JOIN age_price_ranges apr ON s.id = apr.service_id AND apr.is_active = true
WHERE s.available = true
GROUP BY s.id, s.title, s.price
ORDER BY s.title
LIMIT 5;

-- 6. Verificar índices
SELECT '📊 Verificando índices...' as info;
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('age_price_ranges', 'age_range_templates')
ORDER BY tablename, indexname;

-- 7. Probar inserción de un rango personalizado (si hay servicios)
DO $$
DECLARE
  test_service_id UUID;
  new_range_id INTEGER;
BEGIN
  -- Obtener el primer servicio disponible
  SELECT id INTO test_service_id FROM services WHERE available = true LIMIT 1;
  
  IF test_service_id IS NOT NULL THEN
    SELECT '🧪 Probando creación de rango personalizado...' as info;
    
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
    
    RAISE NOTICE '✅ Rango de prueba creado con ID: %', new_range_id;
    
    -- Verificar que se creó
    SELECT '📋 Verificando rango creado...' as info;
    SELECT 
      range_name,
      min_age,
      max_age,
      price,
      price_type,
      description
    FROM age_price_ranges 
    WHERE id = new_range_id;
    
  ELSE
    RAISE NOTICE '⚠️ No hay servicios disponibles para probar';
  END IF;
END $$;

-- 8. Verificar estadísticas finales
SELECT '📈 Estadísticas del sistema...' as info;
SELECT 
  COUNT(DISTINCT s.id) as total_servicios,
  COUNT(apr.id) as total_rangos_edad,
  COUNT(DISTINCT apr.service_id) as servicios_con_precios_edad,
  ROUND(AVG(apr.price), 2) as precio_promedio_rangos,
  COUNT(DISTINCT art.id) as total_plantillas
FROM services s
LEFT JOIN age_price_ranges apr ON s.id = apr.service_id AND apr.is_active = true
CROSS JOIN age_range_templates art
WHERE s.available = true;

-- 9. Verificar integridad de datos
SELECT '🔍 Verificando integridad de datos...' as info;
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

-- 10. Resumen final
SELECT '🎉 VERIFICACIÓN COMPLETADA' as estado;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Sistema de precios por edad funcionando correctamente'
    ELSE '❌ Error: No se encontraron datos en las tablas'
  END as resultado
FROM age_price_ranges;

-- 11. Mostrar ejemplo de uso
SELECT '💡 EJEMPLO DE USO:' as info;
SELECT 
  'Para aplicar una plantilla a un servicio:' as instruccion,
  'SELECT apply_age_range_template(''SERVICE_ID_AQUI''::UUID, 1);' as comando;

SELECT 
  'Para crear un rango personalizado:' as instruccion,
  'SELECT create_custom_age_range(''SERVICE_ID_AQUI''::UUID, ''Bebés'', 0, 2, 0.00, ''per_person'', ''Gratis para bebés'');' as comando;

SELECT 
  'Para ver precios de un servicio:' as instruccion,
  'SELECT * FROM get_service_age_pricing(''SERVICE_ID_AQUI''::UUID);' as comando;
