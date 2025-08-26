# 🚫 Prevención de Errores 404 en Archivos Estáticos

## 📋 **Descripción del Problema**

Los errores 404 en archivos estáticos de Next.js (`/_next/static/css/`, `/_next/static/chunks/`) indican que:
- El build no se completó correctamente
- Los archivos estáticos están corruptos
- Hay problemas de caché del navegador
- La configuración de Next.js es inestable

## ✅ **Soluciones Implementadas**

### 1. **Configuración de Next.js Simplificada**
- **Eliminadas configuraciones experimentales** que causan conflictos
- **Deshabilitado `turbo`** para evitar problemas de compilación
- **Deshabilitado `optimizeCss`** para estabilidad
- **Configuración de webpack más conservadora**

### 2. **Script de Limpieza Automática**
```powershell
# Ejecutar en PowerShell
.\scripts\clean-and-build.ps1
```

### 3. **Headers de Caché Optimizados**
```javascript
// Archivos estáticos con caché de 1 año
source: '/_next/static/(.*)',
headers: [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  }
]
```

## 🛠️ **Procedimiento de Limpieza Manual**

### **Opción 1: Limpieza Rápida**
```bash
# Eliminar solo .next
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

### **Opción 2: Limpieza Completa**
```bash
# Eliminar .next y node_modules
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run build
```

### **Opción 3: Limpieza de Caché**
```bash
# Limpiar caché de npm
npm cache clean --force
npm run build
```

## 🔍 **Verificación Post-Build**

Después del build, verificar que existan:
```
.next/
├── static/
│   ├── css/
│   ├── chunks/
│   └── media/
└── server/
```

## 🚨 **Señales de Alerta**

- **Errores 404** en archivos CSS/JS
- **Build interrumpido** o con errores
- **Archivos estáticos faltantes** en `.next/static/`
- **Problemas de hidratación** en el navegador

## 💡 **Prevención Continua**

### **En Desarrollo:**
```bash
# Usar npm run dev en lugar de build para desarrollo
npm run dev
```

### **En Producción:**
```bash
# Siempre limpiar antes de build
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

### **Monitoreo:**
- Verificar logs del build
- Revisar consola del navegador
- Comprobar Network tab en DevTools

## 📚 **Recursos Adicionales**

- [Next.js Build Output](https://nextjs.org/docs/app/building-your-application/deploying)
- [Static File Serving](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- [Webpack Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)

## 🎯 **Resumen de Mejores Prácticas**

1. **Mantener configuración simple** en `next.config.mjs`
2. **Limpiar `.next` antes de cada build**
3. **Usar `npm run dev` para desarrollo**
4. **Verificar archivos estáticos post-build**
5. **Monitorear logs y errores del navegador**
6. **Ejecutar script de limpieza automática**

