-- =====================================================
-- SCRIPT DE MIGRACIÓN: VERCEL BLOB → SUPABASE STORAGE
-- Migra las imágenes desde Vercel Blob a Supabase Storage
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL DE IMÁGENES
DO $$
DECLARE
    vercel_blob_count INTEGER;
    total_images INTEGER;
BEGIN
    -- Contar imágenes de Vercel Blob
    SELECT COUNT(*) INTO vercel_blob_count
    FROM public.services
    WHERE images IS NOT NULL 
        AND array_length(images, 1) > 0
        AND EXISTS (
            SELECT 1 
            FROM unnest(images) AS img 
            WHERE img LIKE '%vercel-storage.com%'
        );
    
    -- Contar total de imágenes
    SELECT COUNT(*) INTO total_images
    FROM public.services
    WHERE images IS NOT NULL 
        AND array_length(images, 1) > 0;
    
    RAISE NOTICE '📊 ESTADO ACTUAL DE IMÁGENES:';
    RAISE NOTICE '   Total de servicios con imágenes: %', total_images;
    RAISE NOTICE '   Imágenes en Vercel Blob: %', vercel_blob_count;
    RAISE NOTICE '   Imágenes a migrar: %', vercel_blob_count;
END $$;

-- 2. CREAR BUCKET DE STORAGE EN SUPABASE (requiere ejecución manual)
-- Ir a Supabase Dashboard → Storage → New Bucket
-- Nombre: 'service-images'
-- Public: true
-- File size limit: 10MB

-- 3. FUNCIÓN PARA MIGRAR URLS DE IMÁGENES
CREATE OR REPLACE FUNCTION migrate_image_urls_to_supabase()
RETURNS TABLE (
    service_id UUID,
    old_urls TEXT[],
    new_urls TEXT[],
    migration_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_record RECORD;
    old_urls TEXT[];
    new_urls TEXT[];
    url TEXT;
    new_url TEXT;
    bucket_name TEXT := 'service-images';
    supabase_url TEXT;
BEGIN
    -- Obtener URL de Supabase desde variables de entorno
    -- Esto se debe configurar manualmente en el dashboard
    supabase_url := 'https://kykyyqga68e5j72o.supabase.co';
    
    FOR service_record IN
        SELECT id, images
        FROM public.services
        WHERE images IS NOT NULL 
            AND array_length(images, 1) > 0
            AND EXISTS (
                SELECT 1 
                FROM unnest(images) AS img 
                WHERE img LIKE '%vercel-storage.com%'
            )
    LOOP
        old_urls := service_record.images;
        new_urls := ARRAY[]::TEXT[];
        
        -- Migrar cada URL
        FOREACH url IN ARRAY old_urls
        LOOP
            -- Extraer nombre del archivo de la URL de Vercel
            new_url := CASE 
                WHEN url LIKE '%vercel-storage.com%' THEN
                    -- Convertir URL de Vercel a Supabase
                    supabase_url || '/storage/v1/object/public/' || bucket_name || '/' || 
                    substring(url from '([^/]+)$')
                ELSE
                    url -- Mantener URLs que no son de Vercel
            END;
            
            new_urls := array_append(new_urls, new_url);
        END LOOP;
        
        -- Actualizar URLs en la base de datos
        UPDATE public.services 
        SET images = new_urls,
            updated_at = NOW()
        WHERE id = service_record.id;
        
        -- Retornar resultado
        RETURN QUERY SELECT 
            service_record.id,
            old_urls,
            new_urls,
            'Migrado exitosamente'::TEXT;
    END LOOP;
END;
$$;

-- 4. FUNCIÓN PARA VERIFICAR MIGRACIÓN
CREATE OR REPLACE FUNCTION verify_image_migration()
RETURNS TABLE (
    service_id UUID,
    service_title TEXT,
    old_vercel_urls INTEGER,
    new_supabase_urls INTEGER,
    migration_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_record RECORD;
    vercel_count INTEGER;
    supabase_count INTEGER;
BEGIN
    FOR service_record IN
        SELECT id, title, images
        FROM public.services
        WHERE images IS NOT NULL 
            AND array_length(images, 1) > 0
    LOOP
        -- Contar URLs de Vercel
        SELECT COUNT(*) INTO vercel_count
        FROM unnest(service_record.images) AS img
        WHERE img LIKE '%vercel-storage.com%';
        
        -- Contar URLs de Supabase
        SELECT COUNT(*) INTO supabase_count
        FROM unnest(service_record.images) AS img
        WHERE img LIKE '%supabase.co%';
        
        -- Determinar estado
        RETURN QUERY SELECT 
            service_record.id,
            service_record.title,
            vercel_count,
            supabase_count,
            CASE 
                WHEN vercel_count = 0 AND supabase_count > 0 THEN '✅ Migrado completamente'
                WHEN vercel_count > 0 AND supabase_count > 0 THEN '🔄 Migración parcial'
                WHEN vercel_count > 0 AND supabase_count = 0 THEN '❌ No migrado'
                ELSE '❓ Estado desconocido'
            END::TEXT;
    END LOOP;
END;
$$;

-- 5. FUNCIÓN PARA LIMPIAR URLs INVALIDAS
CREATE OR REPLACE FUNCTION cleanup_invalid_image_urls()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Eliminar URLs vacías o inválidas
    UPDATE public.services 
    SET images = array_remove(images, ''),
        updated_at = NOW()
    WHERE images IS NOT NULL 
        AND array_position(images, '') IS NOT NULL;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Eliminar URLs que solo contienen espacios
    UPDATE public.services 
    SET images = array_remove(images, '   '),
        updated_at = NOW()
    WHERE images IS NOT NULL 
        AND array_position(images, '   ') IS NOT NULL;
    
    GET DIAGNOSTICS affected_rows = affected_rows + ROW_COUNT;
    
    RETURN affected_rows;
END;
$$;

-- 6. EJECUTAR MIGRACIÓN (DESCOMENTAR CUANDO ESTÉ LISTO)
-- SELECT * FROM migrate_image_urls_to_supabase();

-- 7. VERIFICAR RESULTADO
-- SELECT * FROM verify_image_migration();

-- 8. LIMPIAR URLs INVÁLIDAS
-- SELECT cleanup_invalid_image_urls();

-- 9. RESUMEN DE MIGRACIÓN
DO $$
DECLARE
    total_services INTEGER;
    migrated_services INTEGER;
    total_images INTEGER;
    vercel_images INTEGER;
    supabase_images INTEGER;
BEGIN
    -- Estadísticas generales
    SELECT COUNT(*) INTO total_services
    FROM public.services
    WHERE images IS NOT NULL AND array_length(images, 1) > 0;
    
    SELECT COUNT(*) INTO migrated_services
    FROM public.services
    WHERE images IS NOT NULL 
        AND array_length(images, 1) > 0
        AND NOT EXISTS (
            SELECT 1 
            FROM unnest(images) AS img 
            WHERE img LIKE '%vercel-storage.com%'
        );
    
    SELECT COUNT(*) INTO total_images
    FROM public.services s,
         unnest(s.images) AS img
    WHERE s.images IS NOT NULL;
    
    SELECT COUNT(*) INTO vercel_images
    FROM public.services s,
         unnest(s.images) AS img
    WHERE s.images IS NOT NULL
        AND img LIKE '%vercel-storage.com%';
    
    SELECT COUNT(*) INTO supabase_images
    FROM public.services s,
         unnest(s.images) AS img
    WHERE s.images IS NOT NULL
        AND img LIKE '%supabase.co%';
    
    RAISE NOTICE '🎯 RESUMEN DE MIGRACIÓN:';
    RAISE NOTICE '   Total de servicios con imágenes: %', total_services;
    RAISE NOTICE '   Servicios migrados: %', migrated_services;
    RAISE NOTICE '   Total de imágenes: %', total_images;
    RAISE NOTICE '   Imágenes en Vercel: %', vercel_images;
    RAISE NOTICE '   Imágenes en Supabase: %', supabase_images;
    
    IF vercel_images = 0 AND supabase_images > 0 THEN
        RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE!';
        RAISE NOTICE '🚀 Todas las imágenes están ahora en Supabase Storage';
    ELSIF vercel_images > 0 THEN
        RAISE NOTICE '⚠️ MIGRACIÓN INCOMPLETA';
        RAISE NOTICE '🔧 Aún hay % imágenes en Vercel Blob', vercel_images;
    ELSE
        RAISE NOTICE '❓ ESTADO DESCONOCIDO';
        RAISE NOTICE '🔍 Verifica el estado de la migración';
    END IF;
END $$;
