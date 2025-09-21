-- Script simple para agregar la columna participants a la tabla reservations
-- ========================================================================

-- Verificar si la columna participants existe y agregarla si no
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

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name IN ('participants', 'guests', 'total_amount', 'total_price', 'booking_date', 'reservation_date')
ORDER BY column_name;
