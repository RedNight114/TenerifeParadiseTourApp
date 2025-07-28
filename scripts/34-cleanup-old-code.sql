-- Limpiar código antiguo y verificar estructura de tablas
-- Ejecutar después de aplicar los scripts 32 y 33

-- Verificar estructura de tabla payments
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Verificar estructura de tabla reservations
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- Verificar índices de payments
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'payments';

-- Verificar índices de reservations
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'reservations';

-- Verificar constraints de payments
SELECT 
  conname, 
  contype, 
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'payments'::regclass;

-- Verificar constraints de reservations
SELECT 
  conname, 
  contype, 
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'reservations'::regclass; 