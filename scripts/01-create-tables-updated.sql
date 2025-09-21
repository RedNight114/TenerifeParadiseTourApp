-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de categorías principales
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de subcategorías
CREATE TABLE subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios actualizada con subcategorías
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id) NOT NULL,
  subcategory_id TEXT REFERENCES subcategories(id) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[],
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  -- Campos específicos para actividades
  duration INTEGER, -- en minutos
  location TEXT,
  min_group_size INTEGER,
  max_group_size INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('facil', 'moderado', 'dificil')),
  
  -- Campos específicos para renting
  vehicle_type TEXT,
  characteristics TEXT,
  insurance_included BOOLEAN,
  fuel_included BOOLEAN,
  
  -- Campos específicos para gastronomía
  menu TEXT,
  schedule TEXT,
  capacity INTEGER,
  dietary_options TEXT[], -- vegetariano, vegano, sin gluten, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME,
  guests INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'cancelado', 'rechazado')),
  payment_status TEXT DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente', 'preautorizado', 'pagado', 'fallido')),
  payment_id TEXT, -- ID de transacción del proveedor de pagos
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_subcategory ON services(subcategory_id);
CREATE INDEX idx_services_available ON services(available);
CREATE INDEX idx_services_featured ON services(featured);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
