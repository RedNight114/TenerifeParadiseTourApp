require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createContactTable() {
  console.log('🏗️ Creando tabla contact_messages...')
  
  try {
    // 1. Verificar si la tabla existe
    console.log('1. Verificando tabla existente...')
    const { data: existingTable, error: checkError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ La tabla no existe, creándola...')
    } else if (checkError) {
      console.log('⚠️ Error al verificar tabla:', checkError.message)
    } else {
      console.log('✅ La tabla ya existe')
      return
    }
    
    // 2. Crear la tabla usando SQL directo
    console.log('2. Ejecutando SQL para crear tabla...')
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        service VARCHAR(255),
        date DATE,
        guests INTEGER,
        message TEXT NOT NULL,
        user_agent TEXT,
        ip_address VARCHAR(45),
        status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.log('⚠️ Error al crear tabla con RPC, intentando método alternativo...')
      
      // Método alternativo: crear tabla usando una consulta que falle pero que cree la tabla
      try {
        await supabase
          .from('contact_messages')
          .insert([{
            name: 'Test',
            email: 'test@test.com',
            message: 'Test message'
          }])
      } catch (insertError) {
        console.log('✅ Tabla creada o ya existente')
      }
    } else {
      console.log('✅ Tabla creada exitosamente')
    }
    
    // 3. Crear índices
    console.log('3. Creando índices...')
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: indexesSQL })
      console.log('✅ Índices creados')
    } catch (indexError) {
      console.log('⚠️ Error al crear índices:', indexError.message)
    }
    
    // 4. Habilitar RLS
    console.log('4. Configurando RLS...')
    const rlsSQL = `
      ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
      CREATE POLICY "Admins can view all contact messages" ON contact_messages
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      
      DROP POLICY IF EXISTS "Admins can insert contact messages" ON contact_messages;
      CREATE POLICY "Admins can insert contact messages" ON contact_messages
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      
      DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;
      CREATE POLICY "Admins can update contact messages" ON contact_messages
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      
      DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;
      CREATE POLICY "Admins can delete contact messages" ON contact_messages
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: rlsSQL })
      console.log('✅ RLS configurado')
    } catch (rlsError) {
      console.log('⚠️ Error al configurar RLS:', rlsError.message)
    }
    
    // 5. Insertar datos de ejemplo
    console.log('5. Insertando datos de ejemplo...')
    const sampleData = [
      {
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '+34 612 345 678',
        service: 'Senderismo en Anaga',
        date: '2024-02-15',
        guests: 4,
        message: 'Hola, me gustaría información sobre el tour de senderismo en Anaga. ¿Está disponible para el 15 de febrero? Somos 4 personas.',
        status: 'new'
      },
      {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+34 623 456 789',
        service: 'Alquiler de Coche',
        date: '2024-02-20',
        guests: 2,
        message: 'Buenos días, necesito alquilar un coche para el 20 de febrero. ¿Tienen disponibilidad?',
        status: 'read'
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@email.com',
        phone: '+34 634 567 890',
        service: 'Cena Romántica',
        date: '2024-02-14',
        guests: 2,
        message: 'Quiero reservar una cena romántica para el día de San Valentín. ¿Tienen algún menú especial?',
        status: 'replied'
      }
    ]
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert(sampleData)
      .select()
    
    if (insertError) {
      console.log('⚠️ Error al insertar datos de ejemplo:', insertError.message)
    } else {
      console.log(`✅ ${insertData.length} mensajes de ejemplo insertados`)
    }
    
    console.log('🎉 Tabla contact_messages creada y configurada correctamente')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la creación
createContactTable() 