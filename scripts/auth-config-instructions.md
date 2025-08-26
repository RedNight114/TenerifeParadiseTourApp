# 🔐 CONFIGURACIÓN MANUAL DE AUTENTICACIÓN

## ⚠️ Configuraciones que requieren acción manual en el Dashboard de Supabase

### 1. **Auth OTP Long Expiry** (auth_otp_long_expiry)

**Problema:** El tiempo de expiración del OTP (One-Time Password) está configurado para más de una hora.

**Solución:**
1. Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Settings**
4. En la sección **Email Auth**, busca **OTP Expiry**
5. Cambia el valor a **3600** (1 hora) o menos
6. Guarda los cambios

**Valor recomendado:** 3600 segundos (1 hora)

---

### 2. **Leaked Password Protection** (auth_leaked_password_protection)

**Problema:** La protección contra contraseñas comprometidas está deshabilitada.

**Solución:**
1. Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Settings**
4. En la sección **Password Security**, busca **Leaked Password Protection**
5. **Habilita** la opción
6. Guarda los cambios

**Beneficios:**
- Previene el uso de contraseñas comprometidas
- Verifica contra la base de datos de HaveIBeenPwned.org
- Mejora significativamente la seguridad

---

## 📋 Pasos para completar la configuración de seguridad

### Paso 1: Ejecutar el script SQL
```sql
-- Ejecutar en Supabase SQL Editor
-- Este script corrige los warnings de search_path
\i scripts/fix-all-security-warnings.sql
```

### Paso 2: Configurar autenticación manualmente
- Seguir las instrucciones de arriba para configurar OTP y Leaked Password Protection

### Paso 3: Verificar que los warnings desaparecieron
- Ejecutar el linter de Supabase nuevamente
- Verificar que no hay más warnings de seguridad

---

## 🔒 Beneficios de estas configuraciones

### **Search Path Configurado:**
- ✅ Previene ataques de inyección de esquema
- ✅ Mejora la seguridad de las funciones
- ✅ Cumple con las mejores prácticas de PostgreSQL

### **OTP Expiry Reducido:**
- ✅ Reduce el tiempo de ventana para ataques
- ✅ Mejora la seguridad de la autenticación
- ✅ Cumple con estándares de seguridad

### **Leaked Password Protection:**
- ✅ Previene el uso de contraseñas comprometidas
- ✅ Mejora significativamente la seguridad de las cuentas
- ✅ Cumple con estándares de seguridad modernos

---

## 🚀 Después de completar la configuración

1. **Reinicia la aplicación frontend**
2. **Prueba la funcionalidad de autenticación**
3. **Verifica que las funciones de servicios funcionen correctamente**
4. **Ejecuta el linter para confirmar que los warnings desaparecieron**

---

## 📞 Soporte

Si encuentras algún problema durante la configuración:
1. Revisa los logs de Supabase
2. Verifica que todas las funciones se crearon correctamente
3. Confirma que los permisos están configurados
4. Contacta al equipo de desarrollo si persisten los problemas
