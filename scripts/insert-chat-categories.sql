-- Script para insertar categorías de chat por defecto
-- Ejecutar DESPUÉS de crear las tablas

-- =====================================================
-- INSERTAR CATEGORÍAS POR DEFECTO
-- =====================================================

-- Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'chat_categories'
) as chat_categories_exists;

-- Insertar categorías usando INSERT con DEFAULT para id
INSERT INTO chat_categories (name, description, color, icon, sort_order) VALUES
('General', 'Consultas generales y soporte básico', '#0061A8', 'message-circle', 1),
('Técnico', 'Problemas técnicos y bugs', '#DC2626', 'wrench', 2),
('Facturación', 'Consultas sobre facturación y pagos', '#059669', 'credit-card', 3),
('Reservas', 'Consultas sobre reservas y tours', '#7C3AED', 'calendar', 4),
('Sugerencias', 'Sugerencias y mejoras', '#EA580C', 'lightbulb', 5)
ON CONFLICT (name) DO NOTHING;

-- Verificar categorías insertadas
SELECT id, name, description, color, icon, sort_order 
FROM chat_categories 
ORDER BY sort_order;
