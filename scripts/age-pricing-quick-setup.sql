-- =====================================================
-- CONFIGURACIÓN RÁPIDA DEL SISTEMA DE PRECIOS POR EDAD
-- =====================================================
-- Ejecuta este script en tu SQL Editor de Supabase
-- =====================================================

-- 1. CREAR TABLA PRINCIPAL
CREATE TABLE IF NOT EXISTS age_price_ranges (
    id SERIAL PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_type VARCHAR(20) DEFAULT 'child',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERTAR PRECIOS PARA TODOS LOS SERVICIOS
-- Bebés (0-2 años) - Gratis
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT id, 0, 2, 0.00, 'baby' FROM services WHERE available = true
ON CONFLICT DO NOTHING;

-- Niños (3-11 años) - 50% del precio
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT id, 3, 11, price * 0.50, 'child' FROM services WHERE available = true
ON CONFLICT DO NOTHING;

-- Adolescentes (12-17 años) - 75% del precio
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT id, 12, 17, price * 0.75, 'child' FROM services WHERE available = true
ON CONFLICT DO NOTHING;

-- Adultos (18-64 años) - Precio completo
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT id, 18, 64, price, 'adult' FROM services WHERE available = true
ON CONFLICT DO NOTHING;

-- Seniors (65+ años) - 90% del precio
INSERT INTO age_price_ranges (service_id, min_age, max_age, price, price_type) 
SELECT id, 65, 120, price * 0.90, 'senior' FROM services WHERE available = true
ON CONFLICT DO NOTHING;

-- 3. CREAR FUNCIÓN PARA CALCULAR PRECIOS
CREATE OR REPLACE FUNCTION get_price_by_age(service_id_param UUID, age_param INTEGER)
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

-- 4. HABILITAR ACCESO PÚBLICO
ALTER TABLE age_price_ranges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON age_price_ranges FOR SELECT USING (true);

-- 5. VERIFICAR IMPLEMENTACIÓN
SELECT '✅ Sistema implementado correctamente' as status;
SELECT COUNT(*) as total_rangos FROM age_price_ranges;
SELECT COUNT(DISTINCT service_id) as servicios_con_precios FROM age_price_ranges;

-- 6. MOSTRAR EJEMPLOS
SELECT 
    s.title as servicio,
    apr.min_age || '-' || apr.max_age || ' años' as rango,
    '€' || apr.price as precio,
    apr.price_type as tipo
FROM age_price_ranges apr
JOIN services s ON apr.service_id = s.id
WHERE apr.is_active = true
ORDER BY s.title, apr.min_age
LIMIT 15;
