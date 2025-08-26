-- Script para corregir datos de conversaciones almacenados como JSON strings
-- Ejecutar en Supabase SQL Editor para resolver el problema de visualización

-- =====================================================
-- PASO 1: VERIFICAR DATOS ACTUALES
-- =====================================================

-- Ver conversaciones con datos problemáticos
SELECT 
  id,
  title,
  description,
  created_at,
  CASE 
    WHEN title::text LIKE '{%' THEN 'JSON_STRING'
    ELSE 'NORMAL'
  END as title_type,
  CASE 
    WHEN description::text LIKE '{%' THEN 'JSON_STRING'
    ELSE 'NORMAL'
  END as description_type
FROM conversations 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- PASO 2: CORREGIR TÍTULOS ALMACENADOS COMO JSON
-- =====================================================

-- Actualizar títulos que son JSON strings
UPDATE conversations 
SET title = (
  CASE 
    WHEN title::text LIKE '{"title":"%' THEN 
      (title::jsonb->>'title')::text
    WHEN title::text LIKE '{"title":%' THEN 
      (title::jsonb->>'title')::text
    ELSE title
  END
)
WHERE title::text LIKE '{%';

-- =====================================================
-- PASO 3: CORREGIR DESCRIPCIONES ALMACENADAS COMO JSON
-- =====================================================

-- Actualizar descripciones que son JSON strings
UPDATE conversations 
SET description = (
  CASE 
    WHEN description::text LIKE '{"description":"%' THEN 
      (description::jsonb->>'description')::text
    WHEN description::text LIKE '{"description":%' THEN 
      (description::jsonb->>'description')::text
    ELSE description
  END
)
WHERE description::text LIKE '{%';

-- =====================================================
-- PASO 4: VERIFICAR CORRECCIÓN
-- =====================================================

-- Ver conversaciones después de la corrección
SELECT 
  id,
  title,
  description,
  created_at,
  CASE 
    WHEN title::text LIKE '{%' THEN 'JSON_STRING'
    ELSE 'NORMAL'
  END as title_type,
  CASE 
    WHEN description::text LIKE '{%' THEN 'JSON_STRING'
    ELSE 'NORMAL'
  END as description_type
FROM conversations 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- PASO 5: VERIFICAR QUE NO HAY DATOS JSON RESTANTES
-- =====================================================

-- Contar conversaciones con datos JSON restantes
SELECT 
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN title::text LIKE '{%' THEN 1 END) as json_titles,
  COUNT(CASE WHEN description::text LIKE '{%' THEN 1 END) as json_descriptions
FROM conversations;

-- =====================================================
-- PASO 6: LIMPIAR DATOS VACÍOS O NULOS
-- =====================================================

-- Establecer títulos por defecto si están vacíos
UPDATE conversations 
SET title = 'Nueva consulta'
WHERE title IS NULL OR title = '';

-- Establecer descripciones por defecto si están vacías
UPDATE conversations 
SET description = 'Sin descripción'
WHERE description IS NULL OR description = '';

-- =====================================================
-- PASO 7: VERIFICACIÓN FINAL
-- =====================================================

-- Ver estructura final de las conversaciones
SELECT 
  'ESTRUCTURA FINAL' as verificacion,
  id,
  title,
  description,
  status,
  priority,
  created_at
FROM conversations 
ORDER BY created_at DESC 
LIMIT 5;
