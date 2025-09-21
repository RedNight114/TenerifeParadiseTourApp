-- Script para corregir la estructura de la tabla reservations
-- ================================================================

-- 1. Verificar estructura actual de la tabla reservations
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- 2. Agregar columna participants si no existe
DO $$
BEGIN
    -- Verificar si la columna participants existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'participants'
    ) THEN
        -- Agregar la columna participants
        ALTER TABLE reservations 
        ADD COLUMN participants INTEGER DEFAULT 1;
        
        -- Actualizar registros existentes para calcular participants
        UPDATE reservations 
        SET participants = COALESCE(guests, 1)
        WHERE participants IS NULL;
        
        RAISE NOTICE 'Columna participants agregada a la tabla reservations';
    ELSE
        RAISE NOTICE 'La columna participants ya existe en la tabla reservations';
    END IF;
END $$;

-- 3. Agregar otras columnas que podrían estar faltando
DO $$
BEGIN
    -- Agregar columna booking_date si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'booking_date'
    ) THEN
        ALTER TABLE reservations 
        ADD COLUMN booking_date DATE;
        
        -- Actualizar booking_date con reservation_date
        UPDATE reservations 
        SET booking_date = reservation_date
        WHERE booking_date IS NULL;
        
        RAISE NOTICE 'Columna booking_date agregada a la tabla reservations';
    END IF;
    
    -- Agregar columna total_price si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'total_price'
    ) THEN
        ALTER TABLE reservations 
        ADD COLUMN total_price DECIMAL(10,2);
        
        -- Actualizar total_price con total_amount
        UPDATE reservations 
        SET total_price = total_amount
        WHERE total_price IS NULL;
        
        RAISE NOTICE 'Columna total_price agregada a la tabla reservations';
    END IF;
    
    -- Agregar columna payment_status si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE reservations 
        ADD COLUMN payment_status TEXT DEFAULT 'pendiente' 
        CHECK (payment_status IN ('pendiente', 'preautorizado', 'pagado', 'fallido'));
        
        RAISE NOTICE 'Columna payment_status agregada a la tabla reservations';
    END IF;
    
    -- Agregar columna notes si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE reservations 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE 'Columna notes agregada a la tabla reservations';
    END IF;
END $$;

-- 4. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reservations_participants ON reservations(participants);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_date ON reservations(booking_date);
CREATE INDEX IF NOT EXISTS idx_reservations_total_price ON reservations(total_price);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status);

-- 5. Verificar que todas las columnas necesarias existen
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY['id', 'user_id', 'service_id', 'participants', 'booking_date', 'total_price', 'status', 'payment_status', 'notes', 'created_at'];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'reservations' 
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Faltan las siguientes columnas en la tabla reservations: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Todas las columnas requeridas existen en la tabla reservations';
    END IF;
END $$;

-- 6. Crear función para obtener reservas con información completa
CREATE OR REPLACE FUNCTION get_user_reservations(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  service_id UUID,
  participants INTEGER,
  booking_date DATE,
  total_price DECIMAL(10,2),
  status TEXT,
  payment_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  service_name TEXT,
  service_price DECIMAL(10,2),
  user_name TEXT,
  user_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.service_id,
    r.participants,
    r.booking_date,
    r.total_price,
    r.status,
    r.payment_status,
    r.notes,
    r.created_at,
    s.title as service_name,
    s.price as service_price,
    p.full_name as user_name,
    p.email as user_email
  FROM reservations r
  LEFT JOIN services s ON r.service_id = s.id
  LEFT JOIN profiles p ON r.user_id = p.id
  WHERE r.user_id = user_id_param
  ORDER BY r.created_at DESC;
END;
$$;

-- 7. Verificar que la función funciona correctamente
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Solo probar si hay usuarios en la tabla
    IF EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        SELECT COUNT(*) INTO test_count 
        FROM get_user_reservations((SELECT id FROM profiles LIMIT 1));
        RAISE NOTICE 'Función get_user_reservations creada correctamente. Registros de prueba: %', test_count;
    ELSE
        RAISE NOTICE 'Función get_user_reservations creada correctamente (sin datos de prueba)';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creando la función get_user_reservations: %', SQLERRM;
END;
$$;
