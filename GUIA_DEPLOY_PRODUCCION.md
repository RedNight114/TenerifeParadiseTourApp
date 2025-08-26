# 🚀 GUÍA COMPLETA DE DEPLOY A PRODUCCIÓN
## TenerifeParadiseTour&Excursions v1.0.0

---

## 📋 **PREPARACIÓN PREVIA AL DEPLOY**

### **1. Verificar Estado del Proyecto**
```bash
# Verificar que no hay errores críticos
npm run build
npm run type-check

# Verificar linting (debe tener menos de 100 warnings)
npm run lint
```

### **2. Preparar Variables de Entorno**
```bash
# Copiar template de producción
cp env.production.template .env.production

# Editar .env.production con valores reales
nano .env.production
```

### **3. Verificar Configuración de Base de Datos**
- [ ] Conectar a Supabase de producción
- [ ] Verificar que todas las tablas existan
- [ ] Aplicar políticas RLS
- [ ] Configurar backup automático

---

## 🔧 **CONFIGURACIÓN DE PRODUCCIÓN**

### **4. Configurar Redsys para Producción**
1. **Acceder a**: https://canales.redsys.es/
2. **Solicitar claves de producción**:
   - Merchant Code
   - Terminal ID
   - Secret Key
3. **Configurar URLs de callback**:
   - Success: `https://tenerifeparadisetoursexcursions.com/payment/success`
   - Error: `https://tenerifeparadisetoursexcursions.com/payment/error`
   - Webhook: `https://tenerifeparadisetoursexcursions.com/api/payment/webhook`

### **5. Configurar Vercel Blob**
1. **Acceder a**: https://vercel.com/dashboard
2. **Crear nuevo proyecto de Blob Storage**
3. **Obtener token de acceso**
4. **Configurar en variables de entorno**

### **6. Configurar Monitoreo**
1. **Sentry**:
   - Crear proyecto en https://sentry.io/
   - Obtener DSN
   - Configurar en variables de entorno

2. **Google Analytics**:
   - Crear propiedad en https://analytics.google.com/
   - Obtener ID de seguimiento
   - Configurar en variables de entorno

---

## 🚀 **DEPLOY EN VERCEL**

### **7. Configurar Proyecto en Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Configurar proyecto
vercel
```

### **8. Configurar Variables de Entorno en Vercel**
```bash
# Agregar variables una por una
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add REDSYS_MERCHANT_CODE
vercel env add REDSYS_SECRET_KEY
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add JWT_SECRET
vercel env add ENCRYPTION_KEY
vercel env add SENTRY_DSN
vercel env add ANALYTICS_ID
```

### **9. Configurar Dominio Personalizado**
1. **En Vercel Dashboard**:
   - Settings → Domains
   - Agregar: `tenerifeparadisetoursexcursions.com`
   - Configurar DNS según instrucciones

2. **Configurar DNS**:
   ```
   A     @     76.76.19.19
   CNAME www   cname.vercel-dns.com
   ```

### **10. Deploy de Producción**
```bash
# Deploy a producción
vercel --prod

# O desde GitHub (recomendado)
# Conectar repositorio y configurar deploy automático
```

---

## 🔍 **VERIFICACIÓN POST-DEPLOY**

### **11. Verificar Funcionalidades Básicas**
- [ ] **Página principal**: https://tenerifeparadisetoursexcursions.com
- [ ] **Autenticación**: Login/Registro funcionando
- [ ] **Catálogo**: Servicios cargando correctamente
- [ ] **Imágenes**: Galerías funcionando
- [ ] **Contacto**: Formulario enviando mensajes

### **12. Verificar Funcionalidades Críticas**
- [ ] **Sistema de pagos**: Transacción de prueba exitosa
- [ ] **Chat**: Mensajes enviándose correctamente
- [ ] **Reservas**: Proceso completo funcionando
- [ ] **Admin**: Panel accesible y funcional

### **13. Verificar Performance**
- [ ] **Lighthouse Score**: >90 en todas las métricas
- [ ] **Tiempo de carga**: <3 segundos
- [ ] **Imágenes**: Optimizadas y comprimidas
- [ ] **Bundle size**: <500KB inicial

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **14. Error: Variables de Entorno No Encontradas**
```bash
# Verificar en Vercel Dashboard
# Settings → Environment Variables
# Asegurar que estén en "Production"
```

### **15. Error: Base de Datos No Conecta**
```bash
# Verificar claves de Supabase
# Verificar políticas RLS
# Verificar conexión desde Vercel
```

### **16. Error: Pagos No Funcionan**
```bash
# Verificar claves de Redsys
# Verificar URLs de callback
# Verificar webhooks
```

### **17. Error: Imágenes No Cargan**
```bash
# Verificar token de Vercel Blob
# Verificar permisos de bucket
# Verificar configuración de CORS
```

---

## 📊 **MONITOREO EN PRODUCCIÓN**

### **18. Configurar Alertas**
- [ ] **Sentry**: Alertas de errores
- [ ] **Vercel**: Alertas de performance
- [ ] **Supabase**: Alertas de base de datos
- [ ] **Email**: Notificaciones de sistema

### **19. Configurar Logs**
- [ ] **Structured Logging**: Formato JSON
- [ ] **Log Rotation**: Eliminar logs antiguos
- [ ] **Log Aggregation**: Centralizar logs
- [ ] **Log Search**: Búsqueda eficiente

### **20. Configurar Métricas**
- [ ] **Performance**: Core Web Vitals
- [ ] **Business**: Conversiones, reservas
- [ ] **Technical**: Uptime, errores
- [ ] **User**: Engagement, navegación

---

## 🔒 **SEGURIDAD EN PRODUCCIÓN**

### **21. Headers de Seguridad**
```typescript
// Verificar en next.config.mjs
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }
  ]
}
```

### **22. Rate Limiting**
- [ ] **API endpoints**: Límite de requests
- [ ] **Autenticación**: Límite de intentos
- [ ] **Uploads**: Límite de archivos
- [ ] **Chat**: Límite de mensajes

### **23. Validación de Datos**
- [ ] **Input sanitization**: Limpiar datos de entrada
- [ ] **SQL injection**: Prevenir ataques
- [ ] **XSS protection**: Escapar contenido
- [ ] **CSRF protection**: Tokens de seguridad

---

## 📈 **OPTIMIZACIÓN POST-DEPLOY**

### **24. Performance**
```bash
# Analizar bundle
npm run build:analyze

# Optimizar imágenes
npm run optimize:images

# Configurar CDN
# Verificar caché
```

### **25. SEO**
- [ ] **Meta tags**: Títulos y descripciones
- [ ] **Sitemap**: Generar automáticamente
- [ ] **Robots.txt**: Configurar correctamente
- [ ] **Schema markup**: Datos estructurados

### **26. Analytics**
- [ ] **Google Analytics**: Configurar eventos
- [ ] **Conversion tracking**: Reservas y pagos
- [ ] **User behavior**: Flujo de usuarios
- [ ] **A/B testing**: Optimizar conversiones

---

## 📞 **CONTACTOS DE EMERGENCIA**

### **27. Soporte Técnico**
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/support
- **Redsys**: +34 900 100 123

### **28. Documentación**
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs

---

## ✅ **CHECKLIST FINAL DE PRODUCCIÓN**

### **Antes del Deploy**
- [ ] Build exitoso sin errores
- [ ] Linting con menos de 100 warnings
- [ ] Variables de entorno configuradas
- [ ] Base de datos verificada
- [ ] Sistema de pagos probado

### **Después del Deploy**
- [ ] Sitio accesible públicamente
- [ ] Todas las funcionalidades funcionando
- [ ] Performance aceptable
- [ ] Monitoreo configurado
- [ ] Alertas funcionando

### **Verificación Continua**
- [ ] Logs revisados diariamente
- [ ] Performance monitoreada
- [ ] Errores corregidos rápidamente
- [ ] Backups verificados
- [ ] Seguridad auditada

---

## 🎯 **OBJETIVO FINAL**

**Estado de producción exitoso:**
- ✅ Sitio funcionando 24/7
- ✅ Performance optimizada
- ✅ Seguridad robusta
- ✅ Monitoreo activo
- ✅ Usuarios satisfechos
- ✅ Conversiones optimizadas

---

**Última actualización**: $(date)
**Responsable**: Equipo de desarrollo
**Estado**: Listo para implementar
