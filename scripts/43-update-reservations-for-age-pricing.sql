-- Script para actualizar la tabla de reservas para soportar precios por edad
-- Fecha: 2024

-- 1. Agregar columnas para manejar precios por edad en reservas
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS senior_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS baby_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_breakdown JSONB DEFAULT '{}';

-- 2. Crear tabla para detalles de participantes por edad
CREATE TABLE IF NOT EXISTS reservation_participants (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    participant_type VARCHAR(20) NOT NULL, -- 'adult', 'child', 'senior', 'baby'
    age INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    age_range VARCHAR(50), -- 'Bebés (0-2 años)', 'Niños (3-11 años)', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_participant_age CHECK (age >= 0 AND age <= 120),
    CONSTRAINT valid_participant_type CHECK (participant_type IN ('adult', 'child', 'senior', 'baby'))
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX idx_reservation_participants_reservation_id ON reservation_participants(reservation_id);
CREATE INDEX idx_reservation_participants_type ON reservation_participants(participant_type);
CREATE INDEX idx_reservation_participants_age ON reservation_participants(age);

-- 4. Crear función para calcular precio total de una reserva
CREATE OR REPLACE FUNCTION calculate_reservation_total_price(reservation_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_price DECIMAL(10,2) := 0.00;
    service_price DECIMAL(10,2);
    participant_record RECORD;
BEGIN
    -- Obtener precio base del servicio
    SELECT price INTO service_price
    FROM services s
    JOIN reservations r ON s.id = r.service_id
    WHERE r.id = reservation_id_param;
    
    -- Calcular precio total basado en participantes
    FOR participant_record IN 
        SELECT 
            rp.participant_type,
            rp.age,
            rp.price
        FROM reservation_participants rp
        WHERE rp.reservation_id = reservation_id_param
    LOOP
        total_price := total_price + participant_record.price;
    END LOOP;
    
    -- Actualizar la reserva con el precio total
    UPDATE reservations 
    SET total_price = total_price
    WHERE id = reservation_id_param;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para agregar participante a una reserva
CREATE OR REPLACE FUNCTION add_participant_to_reservation(
    reservation_id_param INTEGER,
    participant_type_param VARCHAR(20),
    age_param INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    service_id_param INTEGER;
    calculated_price DECIMAL(10,2);
    age_range_label VARCHAR(50);
    participant_id INTEGER;
BEGIN
    -- Obtener el service_id de la reserva
    SELECT service_id INTO service_id_param
    FROM reservations
    WHERE id = reservation_id_param;
    
    -- Calcular precio por edad
    SELECT price INTO calculated_price
    FROM age_price_ranges
    WHERE service_id = service_id_param 
      AND age_param BETWEEN min_age AND max_age
      AND is_active = true
    LIMIT 1;
    
    -- Obtener etiqueta del rango de edad
    SELECT age_label INTO age_range_label
    FROM get_service_pricing(service_id_param)
    WHERE age_param BETWEEN min_age AND max_age
    LIMIT 1;
    
    -- Insertar participante
    INSERT INTO reservation_participants (
        reservation_id, 
        participant_type, 
        age, 
        price, 
        age_range
    ) VALUES (
        reservation_id_param,
        participant_type_param,
        age_param,
        COALESCE(calculated_price, 0.00),
        age_range_label
    ) RETURNING id INTO participant_id;
    
    -- Actualizar contadores en la reserva
    UPDATE reservations 
    SET 
        adult_count = (SELECT COUNT(*) FROM reservation_participants WHERE reservation_id = reservation_id_param AND participant_type = 'adult'),
        child_count = (SELECT COUNT(*) FROM reservation_participants WHERE reservation_id = reservation_id_param AND participant_type = 'child'),
        senior_count = (SELECT COUNT(*) FROM reservation_participants WHERE reservation_id = reservation_id_param AND participant_type = 'senior'),
        baby_count = (SELECT COUNT(*) FROM reservation_participants WHERE reservation_id = reservation_id_param AND participant_type = 'baby')
    WHERE id = reservation_id_param;
    
    -- Calcular precio total
    PERFORM calculate_reservation_total_price(reservation_id_param);
    
    RETURN participant_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para obtener desglose de precios
CREATE OR REPLACE FUNCTION get_reservation_price_breakdown(reservation_id_param INTEGER)
RETURNS TABLE (
    participant_type VARCHAR(20),
    age_range VARCHAR(50),
    count INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.participant_type,
        rp.age_range,
        COUNT(*) as count,
        AVG(rp.price) as unit_price,
        SUM(rp.price) as total_price
    FROM reservation_participants rp
    WHERE rp.reservation_id = reservation_id_param
    GROUP BY rp.participant_type, rp.age_range
    ORDER BY 
        CASE rp.participant_type
            WHEN 'baby' THEN 1
            WHEN 'child' THEN 2
            WHEN 'adult' THEN 3
            WHEN 'senior' THEN 4
        END;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar contadores automáticamente
CREATE OR REPLACE FUNCTION update_reservation_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador correspondiente
        UPDATE reservations 
        SET 
            adult_count = adult_count + CASE WHEN NEW.participant_type = 'adult' THEN 1 ELSE 0 END,
            child_count = child_count + CASE WHEN NEW.participant_type = 'child' THEN 1 ELSE 0 END,
            senior_count = senior_count + CASE WHEN NEW.participant_type = 'senior' THEN 1 ELSE 0 END,
            baby_count = baby_count + CASE WHEN NEW.participant_type = 'baby' THEN 1 ELSE 0 END
        WHERE id = NEW.reservation_id;
        
        -- Calcular precio total
        PERFORM calculate_reservation_total_price(NEW.reservation_id);
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador correspondiente
        UPDATE reservations 
        SET 
            adult_count = adult_count - CASE WHEN OLD.participant_type = 'adult' THEN 1 ELSE 0 END,
            child_count = child_count - CASE WHEN OLD.participant_type = 'child' THEN 1 ELSE 0 END,
            senior_count = senior_count - CASE WHEN OLD.participant_type = 'senior' THEN 1 ELSE 0 END,
            baby_count = baby_count - CASE WHEN OLD.participant_type = 'baby' THEN 1 ELSE 0 END
        WHERE id = OLD.reservation_id;
        
        -- Calcular precio total
        PERFORM calculate_reservation_total_price(OLD.reservation_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservation_counters
    AFTER INSERT OR DELETE ON reservation_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_reservation_counters();

-- 8. Crear políticas RLS para la nueva tabla
ALTER TABLE reservation_participants ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios participantes
CREATE POLICY "Users can view their own reservation participants" ON reservation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.id = reservation_participants.reservation_id
            AND r.user_id = auth.uid()
        )
    );

-- Usuarios pueden insertar participantes en sus reservas
CREATE POLICY "Users can insert participants in their reservations" ON reservation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.id = reservation_participants.reservation_id
            AND r.user_id = auth.uid()
        )
    );

-- Usuarios pueden eliminar participantes de sus reservas
CREATE POLICY "Users can delete participants from their reservations" ON reservation_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.id = reservation_participants.reservation_id
            AND r.user_id = auth.uid()
        )
    );

-- Administradores pueden ver y modificar todos
CREATE POLICY "Admins can manage all reservation participants" ON reservation_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- 9. Crear vista para mostrar reservas con detalles de participantes
CREATE OR REPLACE VIEW reservation_details AS
SELECT 
    r.id as reservation_id,
    r.user_id,
    r.service_id,
    s.name as service_name,
    r.reservation_date,
    r.status,
    r.adult_count,
    r.child_count,
    r.senior_count,
    r.baby_count,
    r.total_price,
    r.created_at,
    u.email as user_email,
    p.full_name as user_name
FROM reservations r
JOIN services s ON r.service_id = s.id
JOIN auth.users u ON r.user_id = u.id
LEFT JOIN profiles p ON r.user_id = p.id
ORDER BY r.created_at DESC;

-- 10. Verificar la implementación
SELECT 'Sistema de reservas por edad implementado correctamente' as status;
SELECT COUNT(*) as total_reservations FROM reservations;
SELECT COUNT(*) as total_age_ranges FROM age_price_ranges;
