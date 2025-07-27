# 🚀 Guía de Despliegue - Tenerife Paradise Tours

## 📋 Checklist Pre-Despliegue

### ✅ Verificaciones Automáticas
```bash
# Ejecutar verificación final
node scripts/final-deployment-check.js

# Verificar build
npm run build

# Verificar tipos TypeScript
npm run type-check
```

### ✅ Verificaciones Manuales
- [ ] Variables de entorno configuradas
- [ ] Base de datos Supabase creada
- [ ] Claves de Redsys obtenidas
- [ ] Dominio personalizado configurado
- [ ] SSL certificado activo

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Anotar URL y claves

### 2. Ejecutar Scripts SQL
```sql
-- Ejecutar en orden:
-- 1. Crear tablas
\i scripts/01-create-tables-updated.sql

-- 2. Insertar categorías
\i scripts/02-insert-categories.sql

-- 3. Configurar RLS
\i scripts/03-rls-policies-updated.sql

-- 4. Crear auditoría
\i scripts/27-create-audit-logs-table.sql

-- 5. Crear mensajes de contacto
\i scripts/29-create-contact-messages-table.sql
```

### 3. Configurar Storage
```sql
-- Crear bucket para avatares
\i scripts/16-create-avatar-bucket.sql

-- Crear bucket para imágenes de servicios
\i scripts/12-create-storage-bucket.sql
```

### 4. Configurar Autenticación
1. Ir a Authentication > Settings
2. Configurar URL de redirección: `https://tu-dominio.com/auth/callback`
3. Habilitar proveedores: Google, Facebook, Email
4. Configurar templates de email

## 🌐 Configuración de Vercel

### 1. Conectar Repositorio
1. Ir a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Variables de Entorno
Configurar en Vercel Dashboard > Settings > Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Redsys (PRODUCCIÓN)
REDSYS_MERCHANT_CODE=tu_merchant_code
REDSYS_TERMINAL=tu_terminal
REDSYS_SECRET_KEY=tu_secret_key
REDSYS_ENVIRONMENT=https://sis.redsys.es/realizarPago

# Aplicación
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# Vercel Blob
BLOB_READ_WRITE_TOKEN=tu_blob_token

# Seguridad
JWT_SECRET=tu_jwt_secret
ENCRYPTION_KEY=tu_encryption_key

# Auditoría
AUDIT_LOG_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### 3. Configurar Dominio
1. Ir a Settings > Domains
2. Añadir dominio personalizado
3. Configurar DNS según instrucciones
4. Esperar propagación DNS (24-48h)

## 💳 Configuración de Redsys

### 1. Obtener Credenciales de Producción
1. Ir a [canales.redsys.es](https://canales.redsys.es)
2. Solicitar credenciales de producción
3. Configurar URLs de notificación:
   - URL de notificación: `https://tu-dominio.com/api/payment/webhook`
   - URL de retorno: `https://tu-dominio.com/payment/success`

### 2. Configurar Webhooks
```bash
# Verificar webhook
curl -X POST https://tu-dominio.com/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🔧 Configuración Post-Despliegue

### 1. Verificar Funcionalidades
- [ ] Autenticación de usuarios
- [ ] Registro de usuarios
- [ ] Creación de reservas
- [ ] Proceso de pago
- [ ] Panel de administración
- [ ] Sistema de auditoría

### 2. Configurar Monitoreo
```bash
# Verificar logs
vercel logs

# Verificar métricas
vercel analytics
```

### 3. Configurar Backups
- Configurar backup automático de Supabase
- Configurar backup de archivos en Vercel Blob
- Configurar backup de código en GitHub

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Build
```bash
# Limpiar cache
rm -rf .next
npm run build
```

#### Error de Conexión Supabase
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Error de Pagos Redsys
```bash
# Verificar configuración
node scripts/test-redsys-config.js
```

#### Error de Imágenes
```bash
# Verificar Vercel Blob
node scripts/check-images.js
```

## 📊 Monitoreo y Mantenimiento

### 1. Métricas a Monitorear
- Tiempo de respuesta de la aplicación
- Tasa de error en pagos
- Uso de recursos de Supabase
- Performance de imágenes

### 2. Mantenimiento Regular
- Actualizar dependencias mensualmente
- Revisar logs de auditoría semanalmente
- Verificar backups mensualmente
- Actualizar SSL certificados

### 3. Escalabilidad
- Configurar auto-scaling en Vercel
- Optimizar consultas de base de datos
- Implementar CDN para imágenes
- Configurar cache distribuido

## 🔒 Seguridad

### 1. Configuraciones de Seguridad
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados
- [ ] Rate limiting activo
- [ ] Auditoría habilitada
- [ ] RLS configurado en Supabase

### 2. Monitoreo de Seguridad
- Revisar logs de auditoría diariamente
- Monitorear intentos de acceso fallidos
- Verificar integridad de datos
- Revisar permisos de usuarios

## 📞 Soporte

### Contactos de Emergencia
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Redsys Support**: [canales.redsys.es](https://canales.redsys.es)

### Documentación
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**¡El proyecto está listo para producción! 🎉** 