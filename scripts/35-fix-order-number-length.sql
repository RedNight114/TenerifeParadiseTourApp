-- Corregir longitud del order_number en ambas tablas
-- Redsys requiere exactamente 12 caracteres

-- Corregir tabla payments
ALTER TABLE payments 
ALTER COLUMN order_number TYPE VARCHAR(12);

-- Corregir tabla reservations  
ALTER TABLE reservations 
ALTER COLUMN order_number TYPE VARCHAR(12);

-- Verificar que los datos existentes no excedan 12 caracteres
-- Si hay datos que exceden, truncarlos
UPDATE payments 
SET order_number = LEFT(order_number, 12) 
WHERE LENGTH(order_number) > 12;

UPDATE reservations 
SET order_number = LEFT(order_number, 12) 
WHERE LENGTH(order_number) > 12;

-- Verificar la estructura actualizada
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name IN ('payments', 'reservations') 
  AND column_name = 'order_number'
ORDER BY table_name; 