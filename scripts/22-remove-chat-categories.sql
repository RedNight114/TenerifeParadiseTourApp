-- Script para eliminar las categorías de chat de la tabla categories
-- Ejecutar antes de crear la nueva tabla chat_categories

-- Eliminar las categorías de chat que se insertaron anteriormente
DELETE FROM categories WHERE id LIKE 'chat-%';

-- Verificar que se eliminaron correctamente
SELECT 'Categorías de chat eliminadas de la tabla categories:' as message;
SELECT COUNT(*) as categorias_eliminadas FROM categories WHERE id LIKE 'chat-%';

-- Mostrar las categorías restantes (deberían ser solo las de servicios)
SELECT 'Categorías restantes en la tabla categories:' as message;
SELECT id, name, description FROM categories ORDER BY name;
