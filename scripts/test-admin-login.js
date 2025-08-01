#!/usr/bin/env node

/**
 * Script para probar el login del admin
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  console.log('🔐 Probando login con administradores existentes...\n');

  // Lista de administradores disponibles
  const adminEmails = [
    'tecnicos@tenerifeparadise.com',
    'admin@tenerifeparadise.com', 
    'brian12guargacho@gmail.com'
  ];

  console.log('👑 Administradores disponibles:');
  adminEmails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });

  console.log('\n💡 Para probar el login, necesitas:');
  console.log('   1. Ir a http://localhost:3000/admin/login');
  console.log('   2. Usar uno de estos emails');
  console.log('   3. Usar la contraseña que configuraste');
  console.log('\n🔧 Si no recuerdas la contraseña, puedes:');
  console.log('   - Usar "Olvidé mi contraseña" en la página de login');
  console.log('   - O ir a Supabase > Authentication > Users y resetear la contraseña');

  // Verificar si hay sesión activa
  console.log('\n🔍 Verificando sesión actual...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Error obteniendo usuario:', error.message);
    } else if (user) {
      console.log('✅ Usuario autenticado:', user.email);
      console.log('   ID:', user.id);
      
      // Verificar si es admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Error obteniendo perfil:', profileError.message);
      } else {
        console.log('✅ Perfil encontrado:', {
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name
        });
        
        if (profile.role === 'admin') {
          console.log('👑 ¡Eres administrador! Puedes acceder al dashboard');
          console.log('   Ve a: http://localhost:3000/admin/dashboard');
        } else {
          console.log('❌ No eres administrador. Rol actual:', profile.role);
        }
      }
    } else {
      console.log('⚠️  No hay usuario autenticado');
      console.log('   Necesitas hacer login primero');
    }
  } catch (e) {
    console.log('❌ Error verificando sesión:', e.message);
  }

  // Probar acceso a perfiles con sesión
  console.log('\n📋 Verificando acceso a perfiles...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('role', 'admin');

    if (error) {
      console.log('❌ Error obteniendo perfiles admin:', error.message);
    } else {
      console.log(`✅ Se encontraron ${profiles.length} administradores:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.full_name})`);
      });
    }
  } catch (e) {
    console.log('❌ Error accediendo a perfiles:', e.message);
  }

  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Ve a http://localhost:3000/admin/login');
  console.log('   2. Usa uno de los emails de administrador');
  console.log('   3. Ingresa tu contraseña');
  console.log('   4. Deberías poder acceder al dashboard');
}

// Ejecutar el test
testAdminLogin().then(() => {
  console.log('\n🏁 Test completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
}); 