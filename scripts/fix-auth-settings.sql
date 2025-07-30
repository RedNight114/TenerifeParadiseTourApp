-- Script para corregir configuraciones de Auth
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. CONFIGURAR OTP EXPIRY (menos de 1 hora)
-- =====================================================

-- Nota: Esta configuración se debe hacer desde el Dashboard de Supabase
-- Ve a Authentication > Settings > Email Auth
-- Cambia "OTP Expiry" a menos de 1 hora (por ejemplo, 30 minutos)

-- =====================================================
-- 2. HABILITAR LEAKED PASSWORD PROTECTION
-- =====================================================

-- Nota: Esta configuración se debe hacer desde el Dashboard de Supabase
-- Ve a Authentication > Settings > Password Security
-- Habilita "Leaked password protection"

-- =====================================================
-- 3. VERIFICAR CONFIGURACIONES ACTUALES
-- =====================================================

-- Verificar configuración de OTP (esto es informativo)
SELECT 
    'CONFIGURACIÓN OTP' as configuracion,
    'Debe ser menos de 1 hora (recomendado: 30 minutos)' as recomendacion,
    'Configurar en Dashboard > Authentication > Settings > Email Auth' as ubicacion;

-- Verificar configuración de leaked password protection (esto es informativo)
SELECT 
    'LEAKED PASSWORD PROTECTION' as configuracion,
    'Debe estar habilitada' as recomendacion,
    'Configurar en Dashboard > Authentication > Settings > Password Security' as ubicacion;

-- =====================================================
-- 4. INSTRUCCIONES PASO A PASO
-- =====================================================

SELECT 
    'INSTRUCCIONES PARA CORREGIR AUTH SETTINGS' as titulo,
    '1. Ve al Dashboard de Supabase' as paso1,
    '2. Navega a Authentication > Settings' as paso2,
    '3. En Email Auth, cambia OTP Expiry a 30 minutos' as paso3,
    '4. En Password Security, habilita Leaked password protection' as paso4,
    '5. Guarda los cambios' as paso5;

-- =====================================================
-- 5. RESUMEN
-- =====================================================

SELECT 
    'CONFIGURACIÓN MANUAL REQUERIDA' as mensaje,
    'Las configuraciones de Auth deben hacerse desde el Dashboard' as detalle,
    'Sigue las instrucciones anteriores para completar la corrección' as siguiente_paso; 