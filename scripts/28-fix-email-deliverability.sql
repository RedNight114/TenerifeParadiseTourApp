-- Script para verificar y mejorar la entregabilidad de emails
-- Este script verifica la configuración actual de Supabase

-- 1. Verificar configuración actual de emails
SELECT 
  'CONFIGURACIÓN ACTUAL EMAILS:' as info,
  'Verificar en Supabase Dashboard > Settings > Auth > Email Templates' as instruction;

-- 2. Verificar plantillas de email existentes
SELECT 
  'PLANTILLAS DE EMAIL:' as info,
  'Verificar: Confirmación, Recuperación de contraseña, Cambio de email' as instruction;

-- 3. Verificar configuración de dominio personalizado (si existe)
SELECT 
  'DOMINIO PERSONALIZADO:' as info,
  'Verificar en Supabase Dashboard > Settings > Auth > URL Configuration' as instruction;
