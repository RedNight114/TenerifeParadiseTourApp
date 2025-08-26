-- SISTEMA COMPLETO DE PRECIOS POR EDAD
-- Ejecuta este script en Supabase SQL Editor para implementar el sistema

-- 1. Crear tabla principal de rangos de edad
CREATE TABLE IF NOT EXISTS public.age_price_ranges (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    range_name VARCHAR(100) NOT NULL,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_type VARCHAR(20) NOT NULL DEFAULT 'per_person',
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT valid_age_range CHECK (min_age >= 0 AND max_age >= min_age),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT unique_service_age_range UNIQUE (service_id, min_age, max_age)
);

-- 2. Crear tabla de plantillas de rangos predefinidos
CREATE TABLE IF NOT EXISTS public.age_range_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    ranges JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_service_id ON public.age_price_ranges(service_id);
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_active ON public.age_price_ranges(is_active);
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_age_range ON public.age_price_ranges(min_age, max_age);

-- 4. Insertar plantillas predefinidas
INSERT INTO public.age_range_templates (template_name, description, ranges, is_default) VALUES
(
    'Rango Estándar',
    'Rango estándar con 6 categorías de edad',
    '[
        {"name": "Bebés", "min_age": 0, "max_age": 2, "price_multiplier": 0.0, "description": "Gratis para bebés"},
        {"name": "Niños pequeños", "min_age": 3, "max_age": 5, "price_multiplier": 0.3, "description": "30% del precio adulto"},
        {"name": "Niños", "min_age": 6, "max_age": 11, "price_multiplier": 0.5, "description": "50% del precio adulto"},
        {"name": "Adolescentes", "min_age": 12, "max_age": 16, "price_multiplier": 0.7, "description": "70% del precio adulto"},
        {"name": "Adultos", "min_age": 17, "max_age": 64, "price_multiplier": 1.0, "description": "Precio completo"},
        {"name": "Seniors", "min_age": 65, "max_age": 120, "price_multiplier": 0.8, "description": "20% descuento para seniors"}
    ]',
    true
),
(
    'Rango Familiar',
    'Rango optimizado para familias con niños',
    '[
        {"name": "Bebés", "min_age": 0, "max_age": 1, "price_multiplier": 0.0, "description": "Gratis para bebés"},
        {"name": "Niños muy pequeños", "min_age": 2, "max_age": 4, "price_multiplier": 0.25, "description": "25% del precio adulto"},
        {"name": "Niños", "min_age": 5, "max_age": 12, "price_multiplier": 0.6, "description": "60% del precio adulto"},
        {"name": "Jóvenes", "min_age": 13, "max_age": 17, "price_multiplier": 0.8, "description": "80% del precio adulto"},
        {"name": "Adultos", "min_age": 18, "max_age": 120, "price_multiplier": 1.0, "description": "Precio completo"}
    ]',
    false
),
(
    'Rango Simple',
    'Rango simple con solo 3 categorías',
    '[
        {"name": "Niños", "min_age": 0, "max_age": 12, "price_multiplier": 0.5, "description": "50% del precio adulto"},
        {"name": "Adultos", "min_age": 13, "max_age": 64, "price_multiplier": 1.0, "description": "Precio completo"},
        {"name": "Seniors", "min_age": 65, "max_age": 120, "price_multiplier": 0.8, "description": "20% descuento para seniors"}
    ]',
    false
);

-- 5. Función para aplicar plantilla a un servicio
CREATE OR REPLACE FUNCTION apply_age_range_template(
    p_service_id UUID,
    p_template_id INTEGER
) RETURNS VOID AS $$
DECLARE
    template_ranges JSONB;
    range_item JSONB;
    base_price DECIMAL(10,2);
BEGIN
    -- Obtener el precio base del servicio
    SELECT price INTO base_price FROM services WHERE id = p_service_id;
    
    IF base_price IS NULL THEN
        RAISE EXCEPTION 'Servicio no encontrado';
    END IF;
    
    -- Obtener la plantilla
    SELECT ranges INTO template_ranges FROM age_range_templates WHERE id = p_template_id;
    
    IF template_ranges IS NULL THEN
        RAISE EXCEPTION 'Plantilla no encontrada';
    END IF;
    
    -- Eliminar rangos existentes del servicio
    DELETE FROM age_price_ranges WHERE service_id = p_service_id;
    
    -- Aplicar la plantilla
    FOR range_item IN SELECT * FROM jsonb_array_elements(template_ranges)
    LOOP
        INSERT INTO age_price_ranges (
            service_id,
            range_name,
            min_age,
            max_age,
            price,
            price_type,
            description
        ) VALUES (
            p_service_id,
            range_item->>'name',
            (range_item->>'min_age')::INTEGER,
            (range_item->>'max_age')::INTEGER,
            base_price * (range_item->>'price_multiplier')::DECIMAL,
            'per_person',
            range_item->>'description'
        );
    END LOOP;
    
    RAISE NOTICE 'Plantilla aplicada al servicio %', p_service_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para crear rango personalizado
CREATE OR REPLACE FUNCTION create_custom_age_range(
    p_service_id UUID,
    p_range_name VARCHAR(100),
    p_min_age INTEGER,
    p_max_age INTEGER,
    p_price DECIMAL(10,2),
    p_price_type VARCHAR(20) DEFAULT 'per_person',
    p_description TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    new_range_id INTEGER;
BEGIN
    INSERT INTO age_price_ranges (
        service_id,
        range_name,
        min_age,
        max_age,
        price,
        price_type,
        description
    ) VALUES (
        p_service_id,
        p_range_name,
        p_min_age,
        p_max_age,
        p_price,
        p_price_type,
        p_description
    ) RETURNING id INTO new_range_id;
    
    RETURN new_range_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para obtener precios por edad de un servicio
CREATE OR REPLACE FUNCTION get_service_age_pricing(p_service_id UUID)
RETURNS TABLE (
    range_id INTEGER,
    range_name VARCHAR(100),
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(20),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.id,
        apr.range_name,
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
        apr.description
    FROM age_price_ranges apr
    WHERE apr.service_id = p_service_id 
    AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_age_price_ranges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_age_price_ranges_updated_at
    BEFORE UPDATE ON age_price_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_age_price_ranges_updated_at();

-- 9. Otorgar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON public.age_price_ranges TO authenticated;
GRANT SELECT ON public.age_range_templates TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.age_price_ranges_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION apply_age_range_template(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_custom_age_range(UUID, VARCHAR, INTEGER, INTEGER, DECIMAL, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_service_age_pricing(UUID) TO authenticated;

-- 10. Insertar datos de ejemplo para servicios existentes (usando plantilla por defecto)
DO $$
DECLARE
    service_record RECORD;
BEGIN
    FOR service_record IN SELECT id FROM services WHERE available = true
    LOOP
        -- Aplicar plantilla por defecto a cada servicio
        PERFORM apply_age_range_template(service_record.id, 1);
    END LOOP;
    
    RAISE NOTICE 'Plantillas aplicadas a % servicios', (SELECT COUNT(*) FROM services WHERE available = true);
END $$;

-- 11. Verificar la configuración
SELECT '✅ Sistema de precios por edad configurado' as status;
SELECT COUNT(*) as total_ranges FROM age_price_ranges;
SELECT COUNT(*) as total_templates FROM age_range_templates;
SELECT COUNT(DISTINCT service_id) as services_with_pricing FROM age_price_ranges;
