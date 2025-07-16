-- Añadir campos para personalización del perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Crear función para generar display_id único
CREATE OR REPLACE FUNCTION generate_display_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    done BOOL := FALSE;
BEGIN
    WHILE NOT done LOOP
        -- Generar ID de 8 caracteres: 2 letras + 6 números
        new_id := upper(substring(md5(random()::text) from 1 for 2)) || 
                  lpad(floor(random() * 1000000)::text, 6, '0');
        
        -- Verificar si ya existe
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE display_id = new_id) THEN
            done := TRUE;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Generar display_id para perfiles existentes que no lo tengan
UPDATE profiles 
SET display_id = generate_display_id() 
WHERE display_id IS NULL;

-- Trigger para generar display_id automáticamente en nuevos perfiles
CREATE OR REPLACE FUNCTION set_display_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_id IS NULL THEN
        NEW.display_id := generate_display_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_display_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_display_id();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_id ON profiles(display_id);

-- Comentarios
COMMENT ON COLUMN profiles.username IS 'Nombre de usuario único elegido por el usuario';
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la imagen de avatar del usuario';
COMMENT ON COLUMN profiles.display_id IS 'ID corto y amigable para mostrar al usuario (ej: AB123456)';
