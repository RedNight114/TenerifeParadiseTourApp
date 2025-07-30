# Solución para Problema de Perfiles - Usuario Autenticado pero Perfil No Carga

## 🔍 Problema Identificado

El problema específico que has identificado es:
- ✅ **Usuario está autenticado** (login exitoso)
- ❌ **Perfil no se carga** (loading infinito)
- 🔄 **Verificación se queda colgada** esperando el perfil

## 🎯 Causas Principales

1. **Perfil no existe en la base de datos**
2. **RLS (Row Level Security) policies mal configuradas**
3. **Estructura de tabla profiles incorrecta**
4. **Cache corrupto de autenticación**
5. **Timeouts insuficientes en la carga de perfil**

## ✅ Solución Implementada

### 1. Hook Específico para Perfiles (`use-auth-profile-fix.ts`)

**Características principales:**
- ✅ **Creación automática de perfiles** si no existen
- ✅ **Reintentos automáticos** (3 intentos) para cargar perfil
- ✅ **Timeouts optimizados** (8s para perfil, 12s para sesión)
- ✅ **Detección de errores específicos** de perfil
- ✅ **Función de recarga específica** para perfiles

**Mejoras clave:**
```typescript
// Creación automática de perfil si no existe
const createProfileIfNotExists = useCallback(async (userId: string, userEmail: string) => {
  // Verificar si ya existe un perfil
  const { data: existingProfile } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existingProfile) {
    await loadProfile(userId)
    return
  }

  // Crear perfil automáticamente
  const { data: newProfile } = await client
    .from('profiles')
    .insert([{
      id: userId,
      email: userEmail,
      full_name: userEmail.split('@')[0],
      role: 'user'
    }])
    .select()
    .single()

  setProfile(newProfile)
}, [loadProfile])
```

### 2. AuthGuard Específico para Perfiles (`auth-guard-profile-fix.tsx`)

**Características principales:**
- ✅ **Detección específica** de usuario sin perfil
- ✅ **Reintentos automáticos** de carga de perfil
- ✅ **Componente específico** para usuario sin perfil
- ✅ **Botones de recuperación** separados para auth y perfil
- ✅ **Información visual** del estado de carga

### 3. Scripts de Diagnóstico y Reparación

**Archivos generados:**
- `scripts/check-profiles-table.sql` - Verificar estructura y datos
- `scripts/fix-profiles.sql` - Reparar perfiles automáticamente
- `scripts/cleanup-auth-cache.js` - Limpiar cache del navegador

## 🚀 Cómo Usar la Solución

### 1. Usar el Hook Mejorado

```typescript
import { useAuthProfileFix } from '@/hooks/use-auth-profile-fix'

function MyComponent() {
  const { 
    user, 
    profile, 
    loading, 
    profileLoading, 
    refreshProfile,
    refreshAuth 
  } = useAuthProfileFix()
  
  // El hook maneja automáticamente la creación de perfiles
}
```

### 2. Usar el AuthGuard Específico

```typescript
import { AuthGuardProfileFix } from '@/components/auth-guard-profile-fix'

// Para páginas que requieren perfil completo
<AuthGuardProfileFix requireAuth={true} requireProfile={true}>
  <ProtectedContent />
</AuthGuardProfileFix>

// Para páginas que solo requieren autenticación
<AuthGuardProfileFix requireAuth={true} requireProfile={false}>
  <BasicContent />
</AuthGuardProfileFix>
```

## 🛠️ Pasos de Reparación

### Paso 1: Diagnóstico en Supabase

1. **Ir a Supabase Dashboard** → SQL Editor
2. **Ejecutar el script de verificación:**
   ```sql
   -- Copiar contenido de scripts/check-profiles-table.sql
   ```
3. **Verificar resultados:**
   - Si hay usuarios sin perfiles
   - Si las RLS policies están correctas
   - Si la estructura de la tabla es correcta

### Paso 2: Reparación Automática

1. **Ejecutar el script de reparación:**
   ```sql
   -- Copiar contenido de scripts/fix-profiles.sql
   ```
2. **Este script:**
   - ✅ Crea perfiles faltantes automáticamente
   - ✅ Repara datos corruptos
   - ✅ Limpia perfiles duplicados
   - ✅ Configura RLS policies correctamente

### Paso 3: Limpieza de Cache

1. **Abrir DevTools** (F12) en el navegador
2. **Ir a la pestaña Console**
3. **Ejecutar el script de limpieza:**
   ```javascript
   // Copiar contenido de scripts/cleanup-auth-cache.js
   ```
4. **El script recargará automáticamente la página**

### Paso 4: Verificación

1. **Recargar la página** (Ctrl+F5)
2. **Verificar el componente AuthDiagnostic** en la esquina inferior derecha
3. **Probar login** con un usuario existente
4. **Confirmar que el perfil se carga correctamente**

## 🔧 Configuración de RLS Policies

### Políticas Requeridas para la Tabla `profiles`:

```sql
-- Usuarios pueden leer su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 📋 Estructura Correcta de la Tabla `profiles`

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## 🎯 Casos de Uso Específicos

### Caso 1: Usuario Nuevo sin Perfil
```typescript
// El hook detecta automáticamente y crea el perfil
const { user, profile } = useAuthProfileFix()
// profile se creará automáticamente si no existe
```

### Caso 2: Usuario Existente con Perfil Corrupto
```typescript
// El hook reintenta la carga automáticamente
// Si falla, muestra opciones de recuperación
```

### Caso 3: Problemas de Conexión
```typescript
// Timeouts previenen loading infinito
// Botones de recuperación manual disponibles
```

## 🔍 Diagnóstico Avanzado

### Verificar en la Consola del Navegador:

```javascript
// Verificar estado de autenticación
console.log('Usuario:', user)
console.log('Perfil:', profile)
console.log('Loading:', loading)
console.log('Profile Loading:', profileLoading)

// Verificar errores específicos
console.log('Errores:', error)
```

### Verificar en Supabase:

```sql
-- Verificar usuarios sin perfiles
SELECT 
  au.id, au.email, au.created_at,
  CASE WHEN p.id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

## 🚨 Síntomas y Soluciones

### Síntoma: "Usuario autenticado pero perfil null"
**Solución:** Ejecutar `fix-profiles.sql` en Supabase

### Síntoma: "Loading infinito en verificación"
**Solución:** Usar `AuthGuardProfileFix` con timeouts

### Síntoma: "Error 404 al cargar perfil"
**Solución:** Verificar RLS policies y crear perfil automáticamente

### Síntoma: "Cache corrupto"
**Solución:** Ejecutar `cleanup-auth-cache.js` en el navegador

## 📞 Soporte Adicional

Si el problema persiste:

1. **Revisar logs** en la consola del navegador
2. **Verificar componente AuthDiagnostic** para información detallada
3. **Ejecutar scripts de diagnóstico** para identificar problemas específicos
4. **Verificar configuración** de Supabase y variables de entorno

---

**Nota:** Esta solución es específica para el problema de perfiles y puede usarse junto con la solución general de autenticación. 