-- IMPLEMENTACIÓN COMPLETA DEL SISTEMA DE RANGOS DE EDAD
-- Ejecuta este script completo en Supabase SQL Editor
-- Este script implementa todo el sistema desde cero

-- =====================================================
-- 1. CREAR LA TABLA age_price_ranges
-- =====================================================

-- Eliminar la tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS age_price_ranges CASCADE;

-- Crear la tabla age_price_ranges
CREATE TABLE age_price_ranges (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL CHECK (min_age >= 0),
    max_age INTEGER NOT NULL CHECK (max_age > min_age),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    price_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_age_price_ranges_service_id ON age_price_ranges(service_id);
CREATE INDEX idx_age_price_ranges_active ON age_price_ranges(is_active);
CREATE INDEX idx_age_price_ranges_age_range ON age_price_ranges(min_age, max_age);

-- Crear constraint único para evitar rangos duplicados
ALTER TABLE age_price_ranges 
ADD CONSTRAINT age_price_ranges_service_age_unique 
UNIQUE (service_id, min_age, max_age);

-- =====================================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE age_price_ranges ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "age_price_ranges_select_policy" ON age_price_ranges
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción/actualización a propietarios del servicio
CREATE POLICY "age_price_ranges_insert_policy" ON age_price_ranges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM services s 
            WHERE s.id = service_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "age_price_ranges_update_policy" ON age_price_ranges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM services s 
            WHERE s.id = service_id 
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "age_price_ranges_delete_policy" ON age_price_ranges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM services s 
            WHERE s.id = service_id 
            AND s.user_id = auth.uid()
        )
    );

-- =====================================================
-- 3. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER set_age_price_ranges_updated_at
    BEFORE UPDATE ON age_price_ranges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. FUNCIÓN PARA INSERTAR/ACTUALIZAR RANGOS DE EDAD
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_service_age_ranges(
    service_id BIGINT,
    age_ranges JSONB
)
RETURNS VOID AS $$
DECLARE
    range_item JSONB;
    min_age_val INTEGER;
    max_age_val INTEGER;
    price_val DECIMAL(10,2);
    price_type_val VARCHAR(50);
    is_active_val BOOLEAN;
BEGIN
    -- Validar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM services WHERE id = service_id) THEN
        RAISE EXCEPTION 'El servicio con ID % no existe', service_id;
    END IF;
    
    -- Eliminar rangos existentes para este servicio
    DELETE FROM age_price_ranges WHERE age_price_ranges.service_id = upsert_service_age_ranges.service_id;
    
    -- Insertar nuevos rangos
    FOR range_item IN SELECT * FROM jsonb_array_elements(age_ranges)
    LOOP
        -- Extraer valores del JSON
        min_age_val := (range_item->>'min_age')::INTEGER;
        max_age_val := (range_item->>'max_age')::INTEGER;
        price_val := (range_item->>'price')::DECIMAL(10,2);
        price_type_val := COALESCE(range_item->>'price_type', 'custom');
        is_active_val := COALESCE((range_item->>'is_active')::BOOLEAN, true);
        
        -- Validar valores
        IF min_age_val IS NULL OR max_age_val IS NULL OR price_val IS NULL THEN
            RAISE EXCEPTION 'Valores inválidos en rango de edad: min_age, max_age y price son obligatorios';
        END IF;
        
        IF min_age_val < 0 OR max_age_val <= min_age_val THEN
            RAISE EXCEPTION 'Rango de edad inválido: min_age debe ser >= 0 y max_age debe ser > min_age';
        END IF;
        
        IF price_val < 0 THEN
            RAISE EXCEPTION 'El precio no puede ser negativo';
        END IF;
        
        -- Insertar el rango
        INSERT INTO age_price_ranges (
            service_id, 
            min_age, 
            max_age, 
            price, 
            price_type, 
            is_active
        ) VALUES (
            service_id,
            min_age_val,
            max_age_val,
            price_val,
            price_type_val,
            is_active_val
        );
    END LOOP;
    
    RAISE NOTICE 'Rangos de edad actualizados para el servicio %', service_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNCIÓN PARA OBTENER RANGOS DE EDAD
-- =====================================================

CREATE OR REPLACE FUNCTION get_service_age_ranges(service_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    min_age INTEGER,
    max_age INTEGER,
    price DECIMAL(10,2),
    price_type VARCHAR(50),
    age_label TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apr.id,
        apr.min_age,
        apr.max_age,
        apr.price,
        apr.price_type,
        CASE 
            WHEN apr.price_type = 'baby' THEN 'Bebé (0-2 años)'
            WHEN apr.price_type = 'child' THEN 'Niño (3-12 años)'
            WHEN apr.price_type = 'teen' THEN 'Adolescente (13-17 años)'
            WHEN apr.price_type = 'adult' THEN 'Adulto (18-65 años)'
            WHEN apr.price_type = 'senior' THEN 'Senior (65+ años)'
            ELSE apr.min_age::TEXT || '-' || apr.max_age::TEXT || ' años'
        END as age_label,
        apr.is_active
    FROM age_price_ranges apr
    WHERE apr.service_id = get_service_age_ranges.service_id
    AND apr.is_active = true
    ORDER BY apr.min_age;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGER PARA ACTUALIZAR RANGOS AUTOMÁTICAMENTE
-- =====================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION handle_service_age_ranges_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Si hay rangos de edad en los datos del servicio
    IF NEW.age_ranges IS NOT NULL THEN
        -- Llamar a la función para actualizar rangos
        PERFORM upsert_service_age_ranges(NEW.id, NEW.age_ranges);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger en la tabla services
DROP TRIGGER IF EXISTS update_service_age_ranges_trigger ON services;

CREATE TRIGGER update_service_age_ranges_trigger
    AFTER INSERT OR UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION handle_service_age_ranges_update();

-- =====================================================
-- 7. VERIFICACIÓN Y MENSAJES
-- =====================================================

-- Mostrar mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de rangos de edad implementado correctamente';
    RAISE NOTICE '📋 Tabla age_price_ranges creada';
    RAISE NOTICE '🔐 RLS habilitado con políticas de seguridad';
    RAISE NOTICE '⚡ Función upsert_service_age_ranges creada';
    RAISE NOTICE '📊 Función get_service_age_ranges creada';
    RAISE NOTICE '🔄 Trigger update_service_age_ranges_trigger configurado';
    RAISE NOTICE '🎯 Constraint único age_price_ranges_service_age_unique activo';
END $$;
