-- Script rápido para configurar precios por edad

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.age_price_ranges (
    id SERIAL PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_age_price_ranges_service_id ON public.age_price_ranges(service_id);

-- Insertar precios por defecto para todos los servicios existentes
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
    18, 64, s.price, 'adult', true
FROM public.services s
WHERE NOT EXISTS (
    SELECT 1 FROM public.age_price_ranges apr 
    WHERE apr.service_id = s.id AND apr.price_type = 'adult'
);

-- Otorgar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON public.age_price_ranges TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.age_price_ranges_id_seq TO authenticated;

-- Verificar
SELECT '✅ Tabla age_price_ranges configurada' as status;
SELECT COUNT(*) as total_ranges FROM public.age_price_ranges;
