#!/usr/bin/env node

/**
 * Script rápido para corregir errores de Supabase Linter
 * Automatiza el proceso de corrección y verificación
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando corrección rápida de errores de Supabase Linter...\n');

// Verificar que los archivos necesarios existan
const requiredFiles = [
    'scripts/fix-supabase-linter-errors.sql',
    'scripts/verify-supabase-fixes.js',
    'CORRECCION_ERRORES_SUPABASE_LINTER.md'
];

console.log('📋 Verificando archivos necesarios...');
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - NO ENCONTRADO`);
        process.exit(1);
    }
}

// Mostrar instrucciones
console.log('\n📝 INSTRUCCIONES PARA CORREGIR ERRORES DE SUPABASE LINTER:\n');

console.log('1️⃣  EJECUTAR SCRIPT DE CORRECCIÓN:');
console.log('   • Ve al SQL Editor de tu proyecto Supabase');
console.log('   • Copia y pega el contenido de: scripts/fix-supabase-linter-errors.sql');
console.log('   • Ejecuta el script completo');
console.log('   • Espera a que termine la ejecución\n');

console.log('2️⃣  VERIFICAR LAS CORRECCIONES:');
console.log('   • Ejecuta: node scripts/verify-supabase-fixes.js');
console.log('   • O ejecuta manualmente los comandos SQL de verificación\n');

console.log('3️⃣  LIMPIAR CACHÉ DEL NAVEGADOR:');
console.log('   • Abre la consola del navegador (F12)');
console.log('   • Ejecuta el siguiente código:');
console.log(`
   localStorage.clear();
   sessionStorage.clear();
   document.cookie.split(";").forEach(function(c) { 
       document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
   });
   location.reload();
`);

console.log('4️⃣  PROBAR LA APLICACIÓN:');
console.log('   • Inicia sesión con un usuario existente');
console.log('   • Verifica que el perfil se cargue correctamente');
console.log('   • Navega por las páginas protegidas');
console.log('   • Prueba las funcionalidades de administración\n');

// Mostrar resumen de correcciones
console.log('🔧 CORRECCIONES QUE SE APLICARÁN:\n');

const corrections = [
    '✅ Habilitar RLS en public.profiles',
    '✅ Habilitar RLS en public.payments', 
    '✅ Habilitar RLS en public.audit_logs',
    '✅ Crear políticas RLS para profiles (ver/actualizar/insertar propio perfil, admins ver todos)',
    '✅ Crear políticas RLS para payments (ver/insertar propios pagos, admins ver/actualizar todos)',
    '✅ Crear políticas RLS para audit_logs (admins ver/insertar, sistema insertar)',
    '✅ Recrear vista recent_audit_logs sin SECURITY DEFINER',
    '✅ Recrear vista daily_audit_stats sin SECURITY DEFINER',
    '✅ Recrear vista user_permissions sin SECURITY DEFINER'
];

corrections.forEach(correction => console.log(correction));

// Mostrar beneficios
console.log('\n🚀 BENEFICIOS DE LA CORRECCIÓN:\n');
const benefits = [
    '🔒 Seguridad mejorada - RLS protege todos los datos sensibles',
    '📋 Cumplimiento - Cumple con las mejores prácticas de Supabase',
    '⚡ Rendimiento - Las políticas RLS optimizan las consultas',
    '🧹 Mantenibilidad - Código más limpio y seguro',
    '📈 Escalabilidad - Base sólida para futuras funcionalidades'
];

benefits.forEach(benefit => console.log(benefit));

// Mostrar comandos útiles
console.log('\n💡 COMANDOS ÚTILES:\n');

console.log('📊 Verificar estado actual de RLS:');
console.log('   SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\' AND tablename IN (\'profiles\', \'payments\', \'audit_logs\');\n');

console.log('🔍 Verificar políticas existentes:');
console.log('   SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = \'public\' AND tablename IN (\'profiles\', \'payments\', \'audit_logs\');\n');

console.log('👁️  Verificar vistas:');
console.log('   SELECT schemaname, viewname, security_invoker FROM pg_views WHERE schemaname = \'public\' AND viewname IN (\'recent_audit_logs\', \'daily_audit_stats\', \'user_permissions\');\n');

// Mostrar archivos generados
console.log('📁 ARCHIVOS GENERADOS:\n');
const generatedFiles = [
    'scripts/fix-supabase-linter-errors.sql - Script principal de corrección',
    'scripts/verify-supabase-fixes.js - Script de verificación',
    'scripts/verify-supabase-fixes.sql - Comandos SQL de verificación',
    'CORRECCION_ERRORES_SUPABASE_LINTER.md - Documentación completa'
];

generatedFiles.forEach(file => console.log(`   ${file}`));

console.log('\n✅ ¡Listo! Sigue las instrucciones paso a paso para corregir los errores.');
console.log('📞 Si tienes problemas, consulta CORRECCION_ERRORES_SUPABASE_LINTER.md para más detalles.\n');

// Función para mostrar el contenido del script SQL
function showSQLScript() {
    const sqlPath = path.join(__dirname, 'fix-supabase-linter-errors.sql');
    if (fs.existsSync(sqlPath)) {
        console.log('📄 CONTENIDO DEL SCRIPT SQL (scripts/fix-supabase-linter-errors.sql):\n');
        console.log('='.repeat(80));
        console.log(fs.readFileSync(sqlPath, 'utf8'));
        console.log('='.repeat(80));
    }
}

// Mostrar script SQL si se solicita
if (process.argv.includes('--show-sql')) {
    showSQLScript();
}

module.exports = {
    showSQLScript,
    requiredFiles,
    corrections,
    benefits
}; 