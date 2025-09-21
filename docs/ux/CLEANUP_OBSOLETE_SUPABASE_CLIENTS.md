# 🧹 LIMPIEZA DE CLIENTES SUPABASE OBSOLETOS

## 📋 ARCHIVOS A ELIMINAR

### 1. **Clientes duplicados obsoletos**
- `lib/supabase-singleton.ts` - Reemplazado por `supabase-unified.ts`
- `lib/supabase-client.ts` - Reemplazado por `supabase-unified.ts`
- `lib/supabase-optimized.ts` - Reemplazado por `supabase-unified.ts`

### 2. **Hooks que crean clientes duplicados**
- `hooks/use-supabase-connection.ts` - Usar cliente unificado
- `hooks/use-virtualized-services.ts` - Usar cliente unificado

### 3. **APIs que crean clientes duplicados**
- `app/api/contact/route.ts` - Usar cliente unificado
- `app/api/reservations/route.ts` - Usar cliente unificado
- `app/api/stripe/create-payment-intent/route.ts` - Usar cliente unificado
- `app/api/auth/callback/route.ts` - Usar cliente unificado
- `app/api/reservas/create/route.ts` - Usar cliente unificado
- `app/api/stripe/capture-payment/route.ts` - Usar cliente unificado
- `app/api/reservations/age-based/route.ts` - Usar cliente unificado
- `app/api/stripe/cancel-payment/route.ts` - Usar cliente unificado
- `app/api/admin/users/route.ts` - Usar cliente unificado

## 🔄 ARCHIVOS A ACTUALIZAR

### 1. **Usar cliente unificado**
```typescript
// ANTES (obsoleto)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)

// DESPUÉS (nuevo)
import { getSupabaseClient } from '@/lib/supabase-unified'
const supabase = await getSupabaseClient()
```

### 2. **Hooks estandarizados**
```typescript
// ANTES (inconsistente)
import { useAuth } from '@/hooks/use-auth'
const { user, logout } = useAuth()

// DESPUÉS (estándar)
import { useAuthContext } from '@/components/auth-provider'
const { user, signOut } = useAuthContext()
```

## 🚀 BENEFICIOS DE LA LIMPIEZA

1. **Rendimiento**: Una sola conexión a Supabase
2. **Mantenibilidad**: Código unificado y fácil de mantener
3. **Consistencia**: Todos los componentes usan la misma interfaz
4. **Seguridad**: Políticas RLS granulares y auditoría
5. **Escalabilidad**: Sistema preparado para crecimiento

## 📝 PASOS PARA COMPLETAR LA LIMPIEZA

1. ✅ Crear cliente unificado (`supabase-unified.ts`)
2. ✅ Actualizar hooks principales (`use-auth.ts`, `use-authorization.ts`)
3. ✅ Estandarizar componentes de chat
4. ✅ Eliminar AuthProvider duplicado en admin
5. ✅ Actualizar API de sesión
6. 🔄 **PENDIENTE**: Actualizar todas las APIs restantes
7. 🔄 **PENDIENTE**: Actualizar hooks restantes
8. 🔄 **PENDIENTE**: Eliminar archivos obsoletos
9. 🔄 **PENDIENTE**: Aplicar migración de políticas RLS

## ⚠️ ADVERTENCIAS

- **NO eliminar archivos** hasta que todas las referencias estén actualizadas
- **Probar** cada cambio antes de continuar
- **Mantener** compatibilidad durante la transición
- **Documentar** cualquier cambio en la API
