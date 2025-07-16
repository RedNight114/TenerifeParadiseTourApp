-- Confirmar el email del usuario de prueba en Supabase
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW(), updated_at = NOW()
WHERE email = 'testuser@tenerifeparadise.com';

-- (Opcional) Mostrar el estado del usuario
SELECT id, email, email_confirmed_at, confirmed_at FROM auth.users WHERE email = 'testuser@tenerifeparadise.com'; 