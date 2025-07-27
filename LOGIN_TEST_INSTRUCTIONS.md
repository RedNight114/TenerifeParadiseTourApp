# 🔐 Instrucciones para Probar el Sistema de Login

## ✅ Estado Actual

El sistema de autenticación ha sido reparado y las credenciales funcionan correctamente:

### Credenciales Válidas:

**Cliente:**
- Email: `brian12guargacho@gmail.com`
- Password: `Claudia1712`

**Admin:**
- Email: `Tecnicos@tenerifeparadise.com`
- Password: `TenerifeparadiseTour2025`

## 🧪 Pasos para Probar

### 1. Limpiar Estado del Navegador

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña Console**
3. **Ejecutar los siguientes comandos:**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```
4. **Recargar la página** (F5)

### 2. Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

O usar el script automático:
```bash
node scripts/restart-dev.js
```

### 3. Probar Login

1. **Ir a:** `http://localhost:3000/auth/login`
2. **Usar las credenciales del cliente:**
   - Email: `brian12guargacho@gmail.com`
   - Password: `Claudia1712`
3. **Hacer clic en "Iniciar Sesión"**
4. **Verificar que redirige a:** `/profile`

### 4. Probar Login de Admin

1. **Ir a:** `http://localhost:3000/auth/login`
2. **Usar las credenciales del admin:**
   - Email: `TenerifeparadiseTour2025`
   - Password: `TenerifeparadiseTour2025`
3. **Hacer clic en "Iniciar Sesión"**
4. **Verificar que redirige a:** `/admin/dashboard`

## 🔍 Verificación de Logs

Durante el proceso de login, deberías ver estos logs en la consola:

```
🚀 Inicializando autenticación...
✅ Estados de carga establecidos en false
🔐 Intentando login con: brian12guargacho@gmail.com
✅ Login exitoso, actualizando estado...
🔍 Obteniendo perfil para usuario: e6c33f40-1078-4e7d-9776-8d940b539eb0
✅ Perfil cargado exitosamente: Brian Afonso
🔄 Cambio de autenticación: SIGNED_IN e6c33f40-1078-4e7d-9776-8d940b539eb0
✅ Estados de carga establecidos en false desde onAuthStateChange
🎉 Login exitoso, manejando redirección...
📍 Redirigiendo a: /profile
```

## 🛠️ Scripts de Diagnóstico

### Verificar Estado del Sistema:
```bash
node scripts/diagnose-auth.js
```

### Probar Login Directamente:
```bash
node scripts/test-login.js
```

### Probar Login de Admin:
```bash
node scripts/test-admin-login.js
```

## ❌ Problemas Comunes y Soluciones

### 1. "Verificando autenticación" se queda cargando

**Solución:**
- Limpiar localStorage y sessionStorage
- Reiniciar el servidor
- Verificar que no hay errores en la consola

### 2. Redirección al login después del login exitoso

**Solución:**
- Verificar que el hook useAuth está funcionando correctamente
- Comprobar que el AuthGuard no está causando bucles
- Revisar los logs de la consola

### 3. Error de conexión con Supabase

**Solución:**
- Verificar variables de entorno en `.env.local`
- Ejecutar `node scripts/diagnose-auth.js`
- Comprobar conexión a internet

## 📋 Checklist de Verificación

- [ ] Servidor iniciado sin errores
- [ ] localStorage y sessionStorage limpiados
- [ ] Login de cliente funciona
- [ ] Login de admin funciona
- [ ] Redirecciones funcionan correctamente
- [ ] No hay bucles infinitos
- [ ] Logs aparecen en la consola
- [ ] Perfil se carga correctamente

## 🎯 Resultado Esperado

Después de seguir estos pasos, el sistema debería:

1. **Cargar la página de login** sin problemas
2. **Aceptar las credenciales** correctamente
3. **Redirigir al usuario** a la página correspondiente
4. **Mostrar el perfil** del usuario
5. **Mantener la sesión** activa

## 🔧 Si el Problema Persiste

1. **Ejecutar diagnóstico completo:**
   ```bash
   node scripts/diagnose-auth.js
   ```

2. **Verificar logs del servidor** para errores

3. **Comprobar variables de entorno:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Revisar la consola del navegador** para errores JavaScript

5. **Contactar soporte** con los logs de error 