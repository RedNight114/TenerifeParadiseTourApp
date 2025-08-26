-- Script para crear la tabla de precios por edad y datos de ejemplo

-- ========================================
-- PASO 1: CREAR TABLA AGE_PRICE_RANGES
-- ========================================

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.age_price_ranges (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL CHECK (min_age >= 0),
    max_age INTEGER NOT NULL CHECK (max_age >= min_age),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('baby', 'child', 'adult', 'senior')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PASO 2: CREAR ÍNDICES PARA RENDIMIENTO
-- ========================================

-- Índice para búsquedas por servicio
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_service_id ON public.age_price_ranges(service_id);

-- Índice para búsquedas por tipo de precio
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_price_type ON public.age_price_ranges(price_type);

-- Índice para búsquedas por edad
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_age_range ON public.age_price_ranges(min_age, max_age);

-- ========================================
-- PASO 3: CREAR TRIGGER PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_age_price_ranges_updated_at ON public.age_price_ranges;
CREATE TRIGGER update_age_price_ranges_updated_at
    BEFORE UPDATE ON public.age_price_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PASO 4: INSERTAR DATOS DE EJEMPLO
-- ========================================

-- Insertar rangos de edad estándar para servicios existentes
INSERT INTO public.age_price_ranges (service_id, min_age, max_age, price, price_type, is_active)
SELECT 
    s.id,
    0, 2, s.price * 0.5, 'baby', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'baby'
);

INSERT INTO public.age_price_ranges (service_id, min_age, max_age, price, price_type, is_active)
SELECT 
    s.id,
    3, 11, s.price * 0.7, 'child', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'child'
);

INSERT INTO public.age_price_ranges (service_id, min_age, max_age, price, price_type, is_active)
SELECT 
    s.id,
    12, 17, s.price * 0.9, 'adult', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'adult'
);

INSERT INTO public.age_price_ranges (service_id, min_age, max_age, price, price_type, is_active)
SELECT 
    s.id,
    18, 64, s.price, 'adult', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'adult'
);

INSERT INTO public.age_price_ranges (service_id, min_age, max_age, price, price_type, is_active)
SELECT 
    s.id,
    65, 120, s.price * 0.8, 'senior', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'senior'
);

-- ========================================
-- PASO 5: OTORGAR PERMISOS
-- ========================================

-- Otorgar permisos de lectura a usuarios autenticados
GRANT SELECT ON public.age_price_ranges TO authenticated;

-- Otorgar permisos de inserción/actualización a usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON public.age_price_ranges TO authenticated;

-- Otorgar permisos en la secuencia del ID
GRANT USAGE, SELECT ON SEQUENCE public.age_price_ranges_id_seq TO authenticated;

-- ========================================
-- PASO 6: VERIFICAR CREACIÓN
-- ========================================

-- Verificar que la tabla se creó
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'age_price_ranges';

-- Verificar que se insertaron datos
SELECT 
    COUNT(*) as total_age_ranges,
    COUNT(DISTINCT service_id) as servicios_con_precios
FROM public.age_price_ranges;

-- Ver algunos ejemplos
SELECT 
    apr.*,
    s.title as service_title
FROM public.age_price_ranges apr
JOIN public.services s ON apr.service_id = s.id
LIMIT 10;

-- ========================================
-- MENSAJE DE CONFIRMACIÓN
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tabla age_price_ranges creada exitosamente!';
    RAISE NOTICE '📋 Rangos de edad configurados para todos los servicios';
    RAISE NOTICE '🔐 Permisos otorgados a usuarios autenticados';
END $$;
