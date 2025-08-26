-- Script para verificar la configuración DNS y emails
-- Este script ayuda a diagnosticar problemas de entregabilidad

-- 1. Verificar configuración actual de Supabase
SELECT 
  'VERIFICACIÓN SUPABASE:' as info,
  '1. Ve a Supabase Dashboard > Settings > Auth' as step1,
  '2. Verifica URL Configuration > Site URL' as step2,
  '3. Verifica Email Templates > Confirm signup' as step3;

-- 2. Verificar configuración de URLs
SELECT 
  'CONFIGURACIÓN URLS:' as info,
  'Site URL debe ser tu dominio real, no localhost' as instruction,
  'Redirect URLs deben incluir tu dominio' as redirect_note;

-- 3. Verificar plantillas de email
SELECT 
  'PLANTILLAS EMAIL:' as info,
  'Confirm signup debe estar personalizada' as confirm_signup,
  'Recovery debe estar personalizada' as recovery,
  'Change email debe estar personalizada' as change_email;

-- 4. Instrucciones para DNS
SELECT 
  'CONFIGURACIÓN DNS REQUERIDA:' as info,
  'SPF: v=spf1 include:_spf.supabase.co ~all' as spf_record,
  'DKIM: Configurar según Supabase Dashboard' as dkim_record,
  'DMARC: v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com' as dmarc_record;

-- 5. Herramientas de verificación
SELECT 
  'HERRAMIENTAS VERIFICACIÓN:' as info,
  'MXToolbox: mxtoolbox.com' as tool1,
  'Mail-Tester: mail-tester.com' as tool2,
  'GlockApps: glockapps.com' as tool3;
