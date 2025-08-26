-- =====================================================
-- MIGRACIÓN: Añadir campo price_children a la tabla services
-- Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Descripción: Añade soporte para precios específicos para niños
-- =====================================================

-- 1. Añadir la columna price_children a la tabla services
ALTER TABLE services 
ADD COLUMN price_children DECIMAL(10,2) DEFAULT NULL;

-- 2. Añadir comentario a la columna para documentación
COMMENT ON COLUMN services.price_children IS 'Precio específico para niños (opcional). Si es NULL, se usa el precio general.';

-- 3. Crear índice para optimizar consultas por precio de niños
CREATE INDEX idx_services_price_children ON services(price_children) WHERE price_children IS NOT NULL;

-- 4. Actualizar la función de búsqueda de servicios (si existe)
-- Nota: Ajusta el nombre de la función según tu esquema

-- Ejemplo de función actualizada (descomenta si tienes una función de búsqueda):
/*
CREATE OR REPLACE FUNCTION search_services(
    search_term TEXT DEFAULT NULL,
    category_id UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    min_price_children DECIMAL DEFAULT NULL,
    max_price_children DECIMAL DEFAULT NULL,
    available_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    price_children DECIMAL,
    category_id UUID,
    available BOOLEAN,
    featured BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.price,
        s.price_children,
        s.category_id,
        s.available,
        s.featured,
        s.created_at
    FROM services s
    WHERE (search_term IS NULL OR 
           s.title ILIKE '%' || search_term || '%' OR 
           s.description ILIKE '%' || search_term || '%')
    AND (category_id IS NULL OR s.category_id = category_id)
    AND (min_price IS NULL OR s.price >= min_price)
    AND (max_price IS NULL OR s.price <= max_price)
    AND (min_price_children IS NULL OR s.price_children >= min_price_children)
    AND (max_price_children IS NULL OR s.price_children <= max_price_children)
    AND (NOT available_only OR s.available = TRUE)
    ORDER BY s.featured DESC, s.created_at DESC;
END;
$$ LANGUAGE plpgsql;
*/

-- 5. Crear vista para servicios con información de precios
CREATE OR REPLACE VIEW services_with_pricing AS
SELECT 
    s.*,
    CASE 
        WHEN s.price_children IS NOT NULL THEN 
            CONCAT('€', s.price, ' adultos, €', s.price_children, ' niños')
        ELSE 
            CONCAT('€', s.price, ' general')
    END as price_display,
    CASE 
        WHEN s.price_children IS NOT NULL THEN TRUE
        ELSE FALSE
    END as has_children_pricing
FROM services s;

-- 6. Crear función para obtener estadísticas de precios
CREATE OR REPLACE FUNCTION get_pricing_statistics()
RETURNS TABLE (
    total_services INTEGER,
    services_with_children_pricing INTEGER,
    avg_adult_price DECIMAL,
    avg_children_price DECIMAL,
    min_children_price DECIMAL,
    max_children_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_services,
        COUNT(s.price_children)::INTEGER as services_with_children_pricing,
        AVG(s.price) as avg_adult_price,
        AVG(s.price_children) as avg_children_price,
        MIN(s.price_children) as min_children_price,
        MAX(s.price_children) as max_children_price
    FROM services s
    WHERE s.available = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para validar precios
CREATE OR REPLACE FUNCTION validate_service_pricing()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el precio de niños no sea mayor que el precio general
    IF NEW.price_children IS NOT NULL AND NEW.price_children > NEW.price THEN
        RAISE EXCEPTION 'El precio para niños no puede ser mayor que el precio general';
    END IF;
    
    -- Validar que el precio de niños no sea negativo
    IF NEW.price_children IS NOT NULL AND NEW.price_children < 0 THEN
        RAISE EXCEPTION 'El precio para niños no puede ser negativo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_validate_service_pricing ON services;
CREATE TRIGGER trigger_validate_service_pricing
    BEFORE INSERT OR UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION validate_service_pricing();

-- 8. Insertar datos de ejemplo (opcional)
-- Descomenta las siguientes líneas si quieres añadir algunos ejemplos:

/*
INSERT INTO services (title, description, price, price_children, category_id, available, featured) VALUES
('Tour Familiar en Barco', 'Experiencia perfecta para familias con niños', 75.00, 45.00, 
 (SELECT id FROM categories WHERE name = 'Barcos' LIMIT 1), TRUE, TRUE),
('Excursión Familiar a la Montaña', 'Aventura adaptada para toda la familia', 60.00, 35.00,
 (SELECT id FROM categories WHERE name = 'Excursiones' LIMIT 1), TRUE, FALSE),
('Parque Acuático Familiar', 'Diversión acuática para todas las edades', 45.00, 25.00,
 (SELECT id FROM categories WHERE name = 'Actividades' LIMIT 1), TRUE, TRUE);
*/

-- 9. Verificar la migración
SELECT 
    'Migración completada exitosamente' as status,
    COUNT(*) as total_services,
    COUNT(price_children) as services_with_children_pricing
FROM services;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecuta este script en tu base de datos Supabase
-- 2. Verifica que la columna se haya creado correctamente
-- 3. Actualiza tu aplicación para usar el nuevo campo
-- 4. Prueba la funcionalidad con algunos servicios
-- ===================================================== 