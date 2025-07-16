const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1]?.trim()
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1]?.trim()
      }
    }
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'))

async function checkAndCreateAdmin() {
  console.log('👤 Verificando y creando usuario admin...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Variables de entorno no configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    // 1. Verificar usuarios existentes
    console.log('1️⃣ Verificando usuarios existentes...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError)
      return
    }

    console.log(`📊 Total de usuarios: ${profiles.length}`)
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.email} (${profile.role}) - ${profile.full_name}`)
    })

    // 2. Buscar usuario técnico específico
    console.log('\n2️⃣ Buscando usuario técnico...')
    const tecnicoProfile = profiles.find(p => p.email === 'tecnicos@tenerifeparadise.com')
    
    if (tecnicoProfile) {
      console.log('✅ Usuario técnico encontrado:', {
        id: tecnicoProfile.id,
        email: tecnicoProfile.email,
        role: tecnicoProfile.role,
        full_name: tecnicoProfile.full_name
      })
    } else {
      console.log('❌ Usuario técnico no encontrado')
      
      // 3. Crear usuario técnico si no existe
      console.log('\n3️⃣ Creando usuario técnico...')
      const newTecnico = {
        id: '781412ba-4ee4-486e-a428-e1b052d20538',
        email: 'tecnicos@tenerifeparadise.com',
        full_name: 'Tecnico QuickAgence',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newTecnico)
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creando usuario técnico:', createError)
      } else {
        console.log('✅ Usuario técnico creado:', {
          id: createdProfile.id,
          email: createdProfile.email,
          role: createdProfile.role,
          full_name: createdProfile.full_name
        })
      }
    }

    // 4. Verificar que hay al menos un admin
    console.log('\n4️⃣ Verificando administradores...')
    const admins = profiles.filter(p => p.role === 'admin')
    console.log(`📊 Total de administradores: ${admins.length}`)
    
    if (admins.length === 0) {
      console.log('⚠️  No hay administradores. Creando uno...')
      
      const adminProfile = {
        email: 'admin@tenerifeparadise.com',
        full_name: 'Administrador',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdAdmin, error: adminError } = await supabase
        .from('profiles')
        .insert(adminProfile)
        .select()
        .single()

      if (adminError) {
        console.error('❌ Error creando administrador:', adminError)
      } else {
        console.log('✅ Administrador creado:', {
          id: createdAdmin.id,
          email: createdAdmin.email,
          role: createdAdmin.role,
          full_name: createdAdmin.full_name
        })
      }
    }

    // 5. Verificar acceso a audit_logs
    console.log('\n5️⃣ Verificando acceso a audit_logs...')
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1)

    if (logsError) {
      console.error('❌ Error accediendo a audit_logs:', logsError)
      console.log('💡 Ejecuta el SQL para deshabilitar RLS:')
      console.log('ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;')
    } else {
      console.log('✅ Acceso a audit_logs exitoso')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n🏁 Proceso completado')
}

checkAndCreateAdmin().catch(console.error) 