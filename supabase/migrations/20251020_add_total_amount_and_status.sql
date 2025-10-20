-- Migración aditiva: total_amount y normalización de estados
-- Reglas:
-- - Añadir columna total_amount si no existe
-- - Copiar valores desde total_price si total_amount está NULL
-- - No eliminar total_price (compatibilidad)
-- - Si existen enums de estado, asegurar valor 'refunded'

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE reservations ADD COLUMN total_amount NUMERIC(12,2);
  END IF;
END $$;

UPDATE reservations
SET total_amount = COALESCE(total_amount, total_price::NUMERIC)
WHERE total_amount IS NULL;

-- Añadir 'refunded' a posibles tipos ENUM si existen
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT n.nspname AS schema_name, t.typname AS type_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e' AND t.typname IN ('reservation_status', 'payment_status')
  LOOP
    EXECUTE format('ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS ''refunded''', t.schema_name, t.type_name);
  END LOOP;
END $$;

-- Opcional: normalizar valores existentes incoherentes hacia el set conocido
-- Nota: No alteramos valores actuales salvo que ya sean 'refunded'.


