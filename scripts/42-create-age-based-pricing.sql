-- Script para implementar sistema de precios por edad para niños
-- Fecha: 2024

-- 1. Crear tabla para rangos de edad y precios
CREATE TABLE IF NOT EXISTS age_price_ranges (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_type VARCHAR(20) DEFAULT 'child', -- 'child', 'adult', 'senior'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Asegurar que no haya rangos de edad solapados para el mismo servicio
    CONSTRAINT unique_age_range_per_service UNIQUE (service_id, min_age, max_age),
    CONSTRAINT valid_age_range CHECK (min_age >= 0 AND max_age <= 120 AND min_age < max_age)
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX idx_age_price_ranges_service_id ON age_price_ranges(service_id);
CREATE INDEX idx_age_price_ranges_age_range ON age_price_ranges(min_age, max_age);
CREATE INDEX idx_age_price_ranges_active ON age_price_ranges(is_active);

-- 3. Insertar rangos de edad estándar para servicios existentes
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT 
    s.id,
    0, 2, 0.00, 'child' -- Bebés (0-2 años) - Gratis
FROM services s
WHERE s.available = true
ON CONFLICT (service_id, min_age, max_age) DO NOTHING;

INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT 
    s.id,
    3, 11, s.price * 0.50, 'child' -- Niños (3-11 años) - 50% del precio adulto
FROM services s
WHERE s.available = true
ON CONFLICT (service_id, min_age, max_age) DO NOTHING;

INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT 
    s.id,
    12, 17, s.price * 0.75, 'child' -- Adolescentes (12-17 años) - 75% del precio adulto
FROM services s
WHERE s.available = true
ON CONFLICT (service_id, min_age, max_age) DO NOTHING;

INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT 
    s.id,
    18, 64, s.price, 'adult' -- Adultos (18-64 años) - Precio completo
FROM services s
WHERE s.available = true
ON CONFLICT (service_id, min_age, max_age) DO NOTHING;

INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT 
    s.id,
    65, 120, s.price * 0.90, 'senior' -- Seniors (65+ años) - 90% del precio adulto
FROM services s
WHERE s.available = true
ON CONFLICT (service_id, min_age, max_age) DO NOTHING;

-- 4. Crear función para calcular precio por edad
CREATE OR REPLACE FUNCTION get_price_by_age(service_id_param INTEGER, age_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    calculated_price DECIMAL(10,2);
BEGIN
    SELECT price INTO calculated_price
    FROM age_price_ranges
    WHERE service_id = service_id_param 
      AND age_param BETWEEN min_age AND max_age
      AND is_active = true
    LIMIT 1;
    
    RETURN COALESCE(calculated_price, 0.00);
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para obtener todos los precios de un servicio
CREATE OR REPLACE FUNCTION get_service_pricing(service_id_param INTEGER)
RETURNS TABLE (
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(20),
    age_label VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
        CASE 
            WHEN apr.min_age = 0 AND apr.max_age = 2 THEN 'Bebés (0-2 años)'
            WHEN apr.min_age = 3 AND apr.max_age = 11 THEN 'Niños (3-11 años)'
            WHEN apr.min_age = 12 AND apr.max_age = 17 THEN 'Adolescentes (12-17 años)'
            WHEN apr.min_age = 18 AND apr.max_age = 64 THEN 'Adultos (18-64 años)'
            WHEN apr.min_age = 65 AND apr.max_age = 120 THEN 'Seniors (65+ años)'
            ELSE CONCAT(apr.min_age, '-', apr.max_age, ' años')
        END as age_label
    FROM age_price_ranges apr
    WHERE apr.service_id = service_id_param 
      AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear vista para mostrar precios por edad
CREATE OR REPLACE VIEW service_age_pricing AS
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.price as adult_price,
    apr.min_age,
    apr.max_age,
    apr.price as age_price,
    apr.price_type,
    CASE 
        WHEN apr.min_age = 0 AND apr.max_age = 2 THEN 'Bebés (0-2 años)'
        WHEN apr.min_age = 3 AND apr.max_age = 11 THEN 'Niños (3-11 años)'
        WHEN apr.min_age = 12 AND apr.max_age = 17 THEN 'Adolescentes (12-17 años)'
        WHEN apr.min_age = 18 AND apr.max_age = 64 THEN 'Adultos (18-64 años)'
        WHEN apr.min_age = 65 AND apr.max_age = 120 THEN 'Seniors (65+ años)'
        ELSE CONCAT(apr.min_age, '-', apr.max_age, ' años')
    END as age_label
FROM services s
JOIN age_price_ranges apr ON s.id = apr.service_id
WHERE s.available = true AND apr.is_active = true
ORDER BY s.id, apr.min_age;

-- 7. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_age_price_ranges_updated_at
    BEFORE UPDATE ON age_price_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Crear políticas RLS para la nueva tabla
ALTER TABLE age_price_ranges ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de precios
CREATE POLICY "Allow public read access to age price ranges" ON age_price_ranges
    FOR SELECT USING (true);

-- Permitir solo a administradores modificar precios
CREATE POLICY "Allow admin write access to age price ranges" ON age_price_ranges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- 9. Comentarios para documentación
COMMENT ON TABLE age_price_ranges IS 'Tabla para manejar precios por rangos de edad para servicios';
COMMENT ON COLUMN age_price_ranges.min_age IS 'Edad mínima del rango (inclusive)';
COMMENT ON COLUMN age_price_ranges.max_age IS 'Edad máxima del rango (inclusive)';
COMMENT ON COLUMN age_price_ranges.price IS 'Precio para este rango de edad';
COMMENT ON COLUMN age_price_ranges.price_type IS 'Tipo de precio: child, adult, senior';

-- 10. Verificar la implementación
SELECT 'Sistema de precios por edad implementado correctamente' as status;
SELECT COUNT(*) as total_age_ranges FROM age_price_ranges;
SELECT COUNT(*) as total_services_with_pricing FROM (SELECT DISTINCT service_id FROM age_price_ranges) s;
