# 📚 Documentación del Proyecto
# Tenerife Paradise Tours & Excursions

## 🎯 Descripción General

**Tenerife Paradise Tours & Excursions** es una aplicación web moderna desarrollada con Next.js 14 que ofrece una plataforma completa para la reserva y gestión de tours y excursiones en la isla de Tenerife.

### 🚀 Características Principales

- ✅ **Sistema de autenticación completo** (login, registro, recuperación de contraseña)
- ✅ **Catálogo de servicios** con filtros y búsqueda avanzada
- ✅ **Páginas de detalles** con galería de imágenes y información completa
- ✅ **Sistema de reservas** integrado con pasarela de pagos
- ✅ **Panel de administración** con gestión de usuarios y servicios
- ✅ **Sistema de mensajes de contacto**
- ✅ **Optimización de rendimiento** con Turbopack y caching
- ✅ **Diseño responsive** y accesible
- ✅ **Integración con Supabase** para base de datos y autenticación

---

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura de Carpetas

```
v10/
├── app/                          # App Router de Next.js 14
│   ├── (main)/                   # Grupo de rutas principales
│   │   ├── about/                # Página "Nosotros"
│   │   ├── booking/              # Sistema de reservas
│   │   ├── contact/              # Página de contacto
│   │   ├── profile/              # Perfil de usuario
│   │   ├── reservations/         # Historial de reservas
│   │   ├── services/             # Catálogo de servicios
│   │   │   └── [serviceId]/      # Páginas de detalles
│   │   └── layout.tsx            # Layout principal
│   ├── admin/                    # Panel de administración
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── login/                # Login de administradores
│   │   └── test-users/           # Gestión de usuarios
│   ├── api/                      # API Routes
│   │   ├── admin/                # Endpoints de administración
│   │   ├── auth/                 # Autenticación
│   │   ├── contact/              # Mensajes de contacto
│   │   ├── payment/              # Sistema de pagos
│   │   └── reservations/         # Gestión de reservas
│   ├── auth/                     # Páginas de autenticación
│   │   ├── login/                # Inicio de sesión
│   │   ├── register/             # Registro
│   │   ├── forgot-password/      # Recuperación de contraseña
│   │   └── reset-password/       # Reset de contraseña
│   └── payment/                  # Páginas de pago
│       ├── success/              # Pago exitoso
│       └── error/                # Error en pago
├── components/                   # Componentes reutilizables
│   ├── admin/                    # Componentes del panel admin
│   ├── auth/                     # Componentes de autenticación
│   ├── ui/                       # Componentes de UI (shadcn/ui)
│   └── [otros componentes]       # Componentes específicos
├── hooks/                        # Custom hooks
├── lib/                          # Utilidades y configuraciones
├── public/                       # Archivos estáticos
├── scripts/                      # Scripts de utilidad
├── styles/                       # Estilos globales
└── supabase/                     # Funciones de Supabase
```

### 🔧 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.30 | Framework principal |
| **React** | 18.x | Biblioteca de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Framework de estilos |
| **Supabase** | Latest | Backend-as-a-Service |
| **Vercel Blob** | Latest | Almacenamiento de imágenes |
| **Redsys** | Latest | Pasarela de pagos |
| **Lucide React** | Latest | Iconos |
| **shadcn/ui** | Latest | Componentes de UI |

---

## 🚀 Configuración y Despliegue

### 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase
- Cuenta de Vercel (opcional)

### ⚙️ Variables de Entorno

Crear archivo `.env.local` con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio

# Vercel Blob
BLOB_READ_WRITE_TOKEN=tu_token_de_vercel_blob

# Redsys (Pagos)
REDSYS_MERCHANT_CODE=tu_codigo_merchant
REDSYS_SECRET_KEY=tu_clave_secreta
REDSYS_TERMINAL=1
REDSYS_CURRENCY=978
REDSYS_TRANSACTION_TYPE=0

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME="Tenerife Paradise Tours & Excursions"
NEXT_PUBLIC_APP_DESCRIPTION="Descubre la isla de Tenerife con nuestras excursiones únicas"
```

### 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Desarrollo con Turbopack (experimental)
npm run dev:turbo

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔐 Sistema de Autenticación

### 👥 Tipos de Usuario

1. **Usuarios Regulares**
   - Registro e inicio de sesión
   - Perfil personalizable
   - Historial de reservas
   - Favoritos

2. **Administradores**
   - Panel de administración
   - Gestión de servicios
   - Gestión de usuarios
   - Estadísticas y reportes

### 🔑 Flujo de Autenticación

1. **Registro**: Formulario con validación
2. **Login**: Autenticación con Supabase
3. **Recuperación**: Email de reset de contraseña
4. **Perfil**: Gestión de datos personales
5. **Logout**: Cierre de sesión seguro

### 🛡️ Seguridad

- Autenticación JWT con Supabase
- Middleware de protección de rutas
- Validación de formularios
- Rate limiting en APIs
- CORS configurado

---

## 🎨 Sistema de Diseño

### 🎯 Paleta de Colores

```css
/* Colores principales */
--primary-blue: #0061A8
--primary-yellow: #F4C762
--secondary-orange: #FF6B35
--accent-green: #4CAF50

/* Colores de fondo */
--bg-light: #FFFFFF
--bg-dark: #1A1A1A
--bg-gray: #F5F5F5

/* Colores de texto */
--text-primary: #333333
--text-secondary: #666666
--text-light: #FFFFFF
```

### 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Grid System**: CSS Grid y Flexbox
- **Componentes Adaptativos**: Se adaptan a diferentes pantallas

### 🎨 Componentes UI

Utilizamos **shadcn/ui** como base de componentes:

- Buttons, Cards, Forms
- Modals, Alerts, Badges
- Navigation, Layouts
- Inputs, Selects, Datepickers

---

## 📊 Base de Datos (Supabase)

### 🗄️ Tablas Principales

#### `profiles`
```sql
- id (UUID, PK)
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- phone (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `services`
```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- price (DECIMAL)
- duration (INTEGER)
- location (TEXT)
- category_id (UUID, FK)
- images (TEXT[])
- featured (BOOLEAN)
- available (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `reservations`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- service_id (UUID, FK)
- date (DATE)
- guests (INTEGER)
- total_price (DECIMAL)
- status (TEXT)
- payment_id (TEXT)
- created_at (TIMESTAMP)
```

#### `categories`
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- icon (TEXT)
- created_at (TIMESTAMP)
```

### 🔒 Políticas de Seguridad (RLS)

- **Profiles**: Usuarios solo pueden ver/editar su propio perfil
- **Services**: Lectura pública, escritura solo para admins
- **Reservations**: Usuarios ven sus reservas, admins ven todas
- **Categories**: Lectura pública, escritura solo para admins

---

## 💳 Sistema de Pagos (Redsys)

### 🔄 Flujo de Pago

1. **Selección de servicio** → Usuario elige tour
2. **Formulario de reserva** → Fecha, huéspedes, precio
3. **Redirección a Redsys** → Procesamiento seguro
4. **Confirmación de pago** → Webhook de Redsys
5. **Creación de reserva** → Base de datos actualizada
6. **Email de confirmación** → Notificación al usuario

### 🛡️ Seguridad de Pagos

- Firma digital con clave secreta
- Validación de parámetros
- Verificación de montos
- Logs de transacciones
- Manejo de errores

---

## 📱 Funcionalidades Principales

### 🏠 Página de Inicio
- Hero section con búsqueda
- Servicios destacados
- Categorías principales
- Testimonios
- Información de contacto

### 🔍 Catálogo de Servicios
- Filtros por categoría, precio, duración
- Búsqueda por texto
- Ordenamiento personalizable
- Paginación
- Vista de tarjetas y lista

### 📄 Páginas de Detalles
- Información completa del servicio
- Galería de imágenes
- Formulario de reserva
- Información de ubicación
- Políticas y condiciones

### 👤 Panel de Usuario
- Perfil personalizable
- Historial de reservas
- Favoritos
- Configuración de cuenta
- Notificaciones

### ⚙️ Panel de Administración
- Dashboard con estadísticas
- Gestión de servicios (CRUD)
- Gestión de usuarios
- Gestión de reservas
- Mensajes de contacto
- Logs del sistema

---

## 🔧 Configuración Avanzada

### ⚡ Optimización de Rendimiento

#### Turbopack (Experimental)
```javascript
// next.config.mjs
experimental: {
  turbo: {
    resolveAlias: {
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/app': './app',
    },
  },
}
```

#### Caching
- **Next.js Cache**: Configurado automáticamente
- **Supabase Cache**: Optimizado para consultas frecuentes
- **Image Optimization**: Next.js Image component
- **Static Generation**: Páginas estáticas cuando es posible

#### Bundle Optimization
- **Code Splitting**: Automático con Next.js
- **Tree Shaking**: Eliminación de código no usado
- **Dynamic Imports**: Carga bajo demanda
- **Optimized Images**: WebP, AVIF support

### 🔍 SEO y Metadatos

```typescript
// Metadata dinámica
export const metadata: Metadata = {
  title: "Tenerife Paradise Tours & Excursions",
  description: "Descubre la isla de Tenerife con nuestras excursiones únicas",
  keywords: "Tenerife, tours, excursiones, turismo, Canarias",
  openGraph: {
    title: "Tenerife Paradise Tours & Excursions",
    description: "Descubre la isla de Tenerife",
    images: ["/images/og-image.jpg"],
  },
}
```

### 🌐 Internacionalización

- **Idioma**: Español (configurable para múltiples idiomas)
- **Formato de fechas**: DD/MM/YYYY
- **Moneda**: EUR (€)
- **Zona horaria**: Europe/Madrid

---

## 🧪 Testing y Calidad

### 📋 Scripts de Testing

```bash
# Verificación de tipos
npm run type-check

# Linting
npm run lint

# Build de producción
npm run build

# Verificación de archivos críticos
npm run predev
```

### 🔍 Herramientas de Desarrollo

- **ESLint**: Linting de código
- **TypeScript**: Verificación de tipos
- **Prettier**: Formateo de código
- **Husky**: Git hooks
- **Lint-staged**: Linting pre-commit

---

## 🚀 Despliegue

### 📦 Vercel (Recomendado)

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno**
3. **Deploy automático** en cada push
4. **Preview deployments** para PRs

### 🐳 Docker (Alternativa)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 🔧 Variables de Producción

```env
# Producción
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Base de datos
DATABASE_URL=tu_url_de_supabase_produccion

# Pagos
REDSYS_ENVIRONMENT=production
```

---

## 📈 Monitoreo y Analytics

### 📊 Métricas de Rendimiento

- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Analysis**: Tamaño de bundles
- **Performance Monitoring**: Vercel Analytics
- **Error Tracking**: Logs de errores

### 🔍 Logs y Debugging

- **Server Logs**: Next.js logging
- **Client Logs**: Console logging
- **Database Logs**: Supabase logging
- **Payment Logs**: Redsys logging

---

## 🔧 Mantenimiento

### 🧹 Limpieza Regular

```bash
# Limpiar caché
npm run clean

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Optimizar imágenes
npm run optimize-images
```

### 📦 Actualizaciones

- **Next.js**: Seguir releases oficiales
- **Dependencias**: Actualizar mensualmente
- **Supabase**: Mantener actualizado
- **Seguridad**: Revisar vulnerabilidades

---

## 🆘 Solución de Problemas

### ❌ Errores Comunes

#### Error de Turbopack
```bash
# Solución: Usar desarrollo normal
npm run dev  # En lugar de npm run dev:turbo
```

#### Error de Autenticación
```bash
# Verificar variables de entorno
# Reiniciar servidor de desarrollo
npm run dev
```

#### Error de Base de Datos
```bash
# Verificar conexión a Supabase
# Revisar políticas RLS
# Verificar permisos de usuario
```

### 🔧 Scripts de Utilidad

```bash
# Limpiar caché y reinstalar
npm run clean-install

# Verificar configuración
npm run check-config

# Backup de base de datos
npm run db-backup

# Restaurar configuración
npm run restore-config
```

---

## 📞 Soporte y Contacto

### 👥 Equipo de Desarrollo

- **Desarrollador Principal**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [tu-usuario-github]

### 📚 Recursos Adicionales

- **Documentación Next.js**: https://nextjs.org/docs
- **Documentación Supabase**: https://supabase.com/docs
- **Documentación Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### 🐛 Reportar Bugs

1. Crear issue en GitHub
2. Incluir pasos para reproducir
3. Adjuntar logs de error
4. Especificar entorno (dev/prod)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd")
**Versión del proyecto**: 1.0.0
**Estado**: ✅ Producción 