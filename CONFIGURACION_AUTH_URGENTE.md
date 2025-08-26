# 🚨 CONFIGURACIÓN URGENTE - AUTENTICACIÓN SUPABASE

## ❌ PROBLEMA IDENTIFICADO

**El registro no funciona porque faltan las variables de entorno de Supabase.**

## 🔧 SOLUCIÓN INMEDIATA

### **Paso 1: Crear archivo .env.local**

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración de Supabase - DESARROLLO LOCAL
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_aqui

# Configuración de la aplicación
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Configuración de Redsys - Entorno de PRUEBAS
REDSYS_MERCHANT_CODE=367529286
REDSYS_TERMINAL=1
REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_ENVIRONMENT=https://sis-t.redsys.es:25443/sis/realizarPago

# Configuración de auditoría y logs
AUDIT_LOG_ENABLED=true
RATE_LIMIT_ENABLED=true

# Configuración de seguridad
JWT_SECRET=tu_jwt_secret_aqui
ENCRYPTION_KEY=tu_encryption_key_aqui
```

### **Paso 2: Obtener credenciales de Supabase**

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings > API**
4. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### **Paso 3: Reemplazar valores en .env.local**

Reemplaza los valores de ejemplo con los reales de tu proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Paso 4: Reiniciar servidor**

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

## 🧪 VERIFICACIÓN

### **Opción 1: Script automático**
```bash
node scripts/check-auth-config.js
```

### **Opción 2: Verificación manual**
1. Abre la consola del navegador (F12)
2. Ve a `/auth/register`
3. Intenta registrar un usuario
4. Verifica que aparezcan logs en la consola

## 📋 LOGS ESPERADOS

Si la configuración es correcta, deberías ver en la consola:

```
🚀 Iniciando proceso de registro...
📝 Datos del formulario: { fullName: "...", email: "...", password: "***", confirmPassword: "***", acceptTerms: true }
✅ Validaciones pasadas, llamando a signUp...
📞 Llamando a signUp con: { email: "...", password: "***", fullName: "..." }
📝 Iniciando proceso de registro...
🔧 Cliente de Supabase obtenido, llamando a signUp...
📥 Respuesta de Supabase signUp: { hasData: true, hasUser: true, hasSession: false, hasError: false }
✅ Usuario creado exitosamente: [user-id]
✅ Registro completado exitosamente
✅ Registro exitoso, preparando pantalla de verificación...
```

## ❌ LOGS DE ERROR COMUNES

### **Error 1: Variables no configuradas**
```
❌ No se pudo obtener el cliente de Supabase
Error de configuración: No se pudo conectar con la base de datos
```

### **Error 2: Credenciales incorrectas**
```
❌ Error de Supabase en signUp: [error details]
```

### **Error 3: Proyecto inactivo**
```
❌ Error de Supabase en signUp: Invalid API key
```

## 🔧 CONFIGURACIÓN ADICIONAL EN SUPABASE

### **1. Habilitar autenticación por email**
1. Ve a **Authentication > Settings**
2. Asegúrate de que **Enable email confirmations** esté activado
3. Configura **Site URL** como `http://localhost:3000`

### **2. Configurar políticas RLS**
1. Ve a **SQL Editor**
2. Ejecuta el script de creación de tablas si no lo has hecho
3. Verifica que las políticas permitan inserción en `profiles`

### **3. Configurar redirecciones**
1. Ve a **Authentication > URL Configuration**
2. Añade `http://localhost:3000/auth/callback` a **Redirect URLs**

## 🎯 ESTADO ACTUAL

- ❌ **Variables de entorno:** No configuradas
- ❌ **Conexión Supabase:** Fallando
- ❌ **Registro:** No funcional
- ✅ **Código:** Listo y optimizado
- ✅ **UI/UX:** Perfecta

## 🚀 PRÓXIMOS PASOS

1. **Configurar variables de entorno** (URGENTE)
2. **Verificar conexión** con script
3. **Probar registro** con usuario de prueba
4. **Verificar email** de confirmación
5. **Probar login** con usuario registrado

---

**⚠️ IMPORTANTE:** Sin las variables de entorno configuradas, el registro NO funcionará. Es el paso más crítico para que la autenticación funcione. 