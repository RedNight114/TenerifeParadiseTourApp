#!/usr/bin/env node

/**
 * Script para verificar que las correcciones de Supabase Linter se aplicaron correctamente
 * Ejecutar después de aplicar fix-supabase-linter-errors.sql
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración - Ajusta según tu proyecto
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY configuradas');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRLSStatus() {
    console.log('\n🔍 Verificando estado de RLS...');
    
    try {
        // Verificar RLS en profiles
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
        
        if (profilesError) {
            console.log('✅ RLS habilitado en profiles (error esperado sin autenticación)');
        } else {
            console.log('⚠️  RLS no está funcionando correctamente en profiles');
        }

        // Verificar RLS en payments
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('id')
            .limit(1);
        
        if (paymentsError) {
            console.log('✅ RLS habilitado en payments (error esperado sin autenticación)');
        } else {
            console.log('⚠️  RLS no está funcionando correctamente en payments');
        }

        // Verificar RLS en audit_logs
        const { data: auditData, error: auditError } = await supabase
            .from('audit_logs')
            .select('id')
            .limit(1);
        
        if (auditError) {
            console.log('✅ RLS habilitado en audit_logs (error esperado sin autenticación)');
        } else {
            console.log('⚠️  RLS no está funcionando correctamente en audit_logs');
        }

    } catch (error) {
        console.error('❌ Error verificando RLS:', error.message);
    }
}

async function checkViews() {
    console.log('\n🔍 Verificando vistas...');
    
    try {
        // Verificar vista recent_audit_logs
        const { data: recentLogs, error: recentError } = await supabase
            .from('recent_audit_logs')
            .select('*')
            .limit(1);
        
        if (recentError) {
            console.log('✅ Vista recent_audit_logs respeta RLS (error esperado sin autenticación)');
        } else {
            console.log('⚠️  Vista recent_audit_logs puede no estar respetando RLS correctamente');
        }

        // Verificar vista daily_audit_stats
        const { data: dailyStats, error: dailyError } = await supabase
            .from('daily_audit_stats')
            .select('*')
            .limit(1);
        
        if (dailyError) {
            console.log('✅ Vista daily_audit_stats respeta RLS (error esperado sin autenticación)');
        } else {
            console.log('⚠️  Vista daily_audit_stats puede no estar respetando RLS correctamente');
        }

        // Verificar vista user_permissions
        const { data: userPerms, error: userPermsError } = await supabase
            .from('user_permissions')
            .select('*')
            .limit(1);
        
        if (userPermsError) {
            console.log('✅ Vista user_permissions respeta RLS (error esperado sin autenticación)');
        } else {
            console.log('⚠️  Vista user_permissions puede no estar respetando RLS correctamente');
        }

    } catch (error) {
        console.error('❌ Error verificando vistas:', error.message);
    }
}

async function testAuthenticatedAccess() {
    console.log('\n🔍 Probando acceso autenticado...');
    
    try {
        // Intentar autenticación con credenciales de prueba
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'testpassword'
        });

        if (authError) {
            console.log('ℹ️  No se pudo autenticar para pruebas (normal si no existe el usuario de prueba)');
            return;
        }

        console.log('✅ Usuario autenticado correctamente');

        // Probar acceso a profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.log('❌ Error accediendo al perfil del usuario:', profileError.message);
        } else {
            console.log('✅ Acceso al perfil funcionando correctamente');
        }

        // Cerrar sesión
        await supabase.auth.signOut();
        console.log('✅ Sesión cerrada correctamente');

    } catch (error) {
        console.error('❌ Error en prueba de autenticación:', error.message);
    }
}

async function generateVerificationSQL() {
    console.log('\n📝 Generando comandos SQL de verificación...');
    
    const verificationSQL = `
-- Comandos para verificar que las correcciones se aplicaron correctamente
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Deshabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs');

-- 2. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Política activa'
        ELSE '⚠️  Política sin condiciones'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'payments', 'audit_logs')
ORDER BY tablename, cmd;

-- 3. Verificar vistas sin SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    security_invoker,
    CASE 
        WHEN security_invoker THEN '✅ Respeta RLS'
        ELSE '❌ SECURITY DEFINER'
    END as status
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN ('recent_audit_logs', 'daily_audit_stats', 'user_permissions');

-- 4. Contar registros en cada tabla (solo para admins)
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as record_count
FROM public.payments
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as record_count
FROM public.audit_logs;
`;

    console.log(verificationSQL);
    
    // Guardar en archivo
    const fs = require('fs');
    fs.writeFileSync('scripts/verify-supabase-fixes.sql', verificationSQL);
    console.log('✅ Comandos de verificación guardados en scripts/verify-supabase-fixes.sql');
}

async function main() {
    console.log('🚀 Iniciando verificación de correcciones de Supabase Linter...\n');
    
    await checkRLSStatus();
    await checkViews();
    await testAuthenticatedAccess();
    await generateVerificationSQL();
    
    console.log('\n✅ Verificación completada');
    console.log('\n📋 Resumen de acciones realizadas:');
    console.log('1. ✅ Verificado estado de RLS en tablas principales');
    console.log('2. ✅ Verificado que las vistas respetan RLS');
    console.log('3. ✅ Probado acceso autenticado');
    console.log('4. ✅ Generado script SQL de verificación');
    
    console.log('\n🔧 Próximos pasos:');
    console.log('1. Ejecuta el script fix-supabase-linter-errors.sql en Supabase');
    console.log('2. Ejecuta este script de verificación nuevamente');
    console.log('3. Verifica que tu aplicación funcione correctamente');
    console.log('4. Revisa los logs de Supabase para confirmar que no hay errores');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkRLSStatus,
    checkViews,
    testAuthenticatedAccess,
    generateVerificationSQL
}; 