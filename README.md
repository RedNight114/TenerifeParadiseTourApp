# 🏝️ Tenerife Paradise Tours & Excursions

Plataforma completa de reservas turísticas para Tenerife Paradise Tours & Excursions. Una aplicación moderna y optimizada para la reserva de servicios turísticos incluyendo actividades, renting de vehículos y gastronomía, con integración de pagos Redsys y gestión administrativa completa.

![Tenerife Paradise Tours](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 🚀 Características Principales

### ✨ Frontend Moderno
- **Next.js 14** con App Router para máxima performance
- **TypeScript** para desarrollo seguro y mantenible
- **Tailwind CSS** con shadcn/ui para diseño consistente
- **Responsive Design** optimizado para todos los dispositivos
- **PWA Ready** con manifest.json y service workers

### 🔐 Autenticación y Seguridad
- **Supabase Auth** con múltiples proveedores (Google, Facebook, Email)
- **Row Level Security (RLS)** en PostgreSQL
- **JWT Tokens** para sesiones seguras
- **Rate Limiting** en APIs críticas
- **Audit Logging** para seguimiento de actividades

### 💳 Sistema de Pagos
- **Redsys Integration** con pre-autorización
- **Webhooks** para confirmación automática
- **Múltiples métodos de pago**
- **Gestión de reembolsos**

### 📊 Gestión Administrativa
- **Dashboard Admin** completo
- **Gestión de servicios** con formularios avanzados
- **Gestión de reservas** con estados dinámicos
- **Estadísticas y reportes** en tiempo real
- **Audit Dashboard** para seguimiento de actividades

### 🎯 Optimizaciones de Performance
- **Lazy Loading** de componentes
- **Image Optimization** con Next.js
- **Code Splitting** automático
- **Bundle Optimization** con webpack
- **SEO Optimizado** con metadata dinámica
- **PWA Features** para mejor UX

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Iconos optimizados

### Backend & Base de Datos
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security** - Seguridad a nivel de fila
- **Edge Functions** - Serverless functions

### Pagos & Integraciones
- **Redsys** - Pasarela de pagos
- **Vercel Blob** - Almacenamiento de archivos
- **Image Compression** - Optimización de imágenes

### DevOps & Deploy
- **Vercel** - Plataforma de despliegue
- **GitHub** - Control de versiones
- **ESLint** - Linting de código
- **TypeScript** - Verificación de tipos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm 8+ o pnpm
- Cuenta de Supabase
- Cuenta de Redsys (para pagos)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd tenerife-paradise-tours
```

### 2. Instalar Dependencias
```bash
npm install
# o
pnpm install
```

### 3. Configurar Variables de Entorno
Copia `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Configura las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_supabase

# Redsys (Pagos)
REDSYS_MERCHANT_CODE=tu_codigo_comercio
REDSYS_TERMINAL=tu_terminal
REDSYS_SECRET_KEY=tu_clave_secreta
REDSYS_ENVIRONMENT=test

# Vercel Blob
BLOB_READ_WRITE_TOKEN=tu_token_blob

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configurar Supabase

#### 4.1 Crear Proyecto
1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales a tu `.env.local`

#### 4.2 Ejecutar Scripts SQL
Ejecuta los scripts en el siguiente orden:

```bash
# 1. Crear tablas principales
psql -h tu-host -U tu-user -d tu-db -f scripts/01-create-tables-updated.sql

# 2. Insertar categorías
psql -h tu-host -U tu-user -d tu-db -f scripts/02-insert-categories.sql

# 3. Configurar RLS
psql -h tu-host -U tu-user -d tu-db -f scripts/03-rls-policies-updated.sql

# 4. Insertar datos de prueba
psql -h tu-host -U tu-user -d tu-db -f scripts/03-seed-data.sql

# 5. Insertar servicios
psql -h tu-host -U tu-user -d tu-db -f scripts/04-more-services.sql

# 6. Crear bucket de storage
psql -h tu-host -U tu-user -d tu-db -f scripts/12-create-storage-bucket.sql

# 7. Crear usuarios admin
psql -h tu-host -U tu-user -d tu-db -f scripts/14-create-admin-users.sql
```

### 5. Desplegar Edge Functions
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Desplegar functions
supabase functions deploy redsys-webhook
supabase functions deploy confirm-payment
```

### 6. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Despliegue en Vercel

### 1. Preparar para Producción
```bash
# Verificar build
npm run build:check

# Build de producción
npm run build
```

### 2. Conectar con Vercel
1. Ve a [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en el dashboard

### 3. Variables de Entorno en Vercel
Configura las siguientes variables en el dashboard de Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role

# Redsys
REDSYS_MERCHANT_CODE=tu-codigo-comercio
REDSYS_TERMINAL=tu-terminal
REDSYS_SECRET_KEY=tu-clave-secreta
REDSYS_ENVIRONMENT=live

# Vercel Blob
BLOB_READ_WRITE_TOKEN=tu-token-blob

# URLs
NEXT_PUBLIC_SITE_URL=https://tenerifeparadisetoursexcursions.com
```

### 4. Desplegar
```bash
# Desplegar automáticamente
git push origin main

# O manualmente
vercel --prod
```

## 📊 Estructura del Proyecto

```
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── admin/         # APIs administrativas
│   │   ├── auth/          # Autenticación
│   │   ├── payment/       # Integración de pagos
│   │   ├── reservations/  # Gestión de reservas
│   │   └── upload/        # Subida de archivos
│   ├── admin/             # Dashboard administrativo
│   ├── booking/           # Proceso de reserva
│   ├── dashboard/         # Dashboard de usuario
│   ├── login/             # Páginas de autenticación
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── admin/            # Componentes administrativos
│   └── auth/             # Componentes de autenticación
├── hooks/                # Custom React Hooks
├── lib/                  # Utilidades y configuraciones
├── scripts/              # Scripts SQL y utilidades
├── supabase/             # Edge Functions
└── public/               # Archivos estáticos
```

## 🔐 Autenticación y Roles

### Roles de Usuario
- **client**: Usuario normal que puede hacer reservas
- **admin**: Administrador con acceso completo
- **technician**: Usuario técnico para operaciones específicas

### Flujo de Autenticación
1. **Registro** con email/password o proveedores sociales
2. **Confirmación** automática de email
3. **Creación** automática de perfil
4. **Login** y gestión de sesión persistente

## 💳 Integración con Redsys

### Flujo de Pago
1. **Creación de reserva** en estado "pendiente"
2. **Generación de pago** con Redsys
3. **Redirección** al formulario de pago
4. **Confirmación** vía webhook
5. **Actualización** del estado de la reserva

### Configuración de Webhooks
```bash
# URL del webhook en Redsys
https://tenerifeparadisetoursexcursions.com/api/payment/webhook
```

## 📱 PWA Features

La aplicación incluye características PWA:
- **Manifest.json** para instalación
- **Service Workers** para cache offline
- **App Icons** en múltiples tamaños
- **Splash Screen** personalizada
- **Offline Support** básico

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción

# Linting y Type Checking
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores automáticamente
npm run type-check       # Verificar tipos TypeScript

# Build y Análisis
npm run build:check      # Lint + Type Check + Build
npm run build:analyze    # Analizar bundle size
npm run clean            # Limpiar archivos de build

# Utilidades
npm run clean-logs       # Limpiar logs de auditoría
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm run test
npm run test:watch
npm run test:coverage
```

## 📈 Performance

### Métricas Objetivo
- **Lighthouse Score**: >90 en todas las categorías
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Optimizaciones Implementadas
- ✅ **Code Splitting** automático
- ✅ **Image Optimization** con Next.js
- ✅ **Lazy Loading** de componentes
- ✅ **Bundle Analysis** y optimización
- ✅ **CDN** con Vercel Edge Network
- ✅ **Caching** agresivo de assets estáticos

## 🔒 Seguridad

### Medidas Implementadas
- ✅ **HTTPS** obligatorio en producción
- ✅ **CSP Headers** configurados
- ✅ **Rate Limiting** en APIs críticas
- ✅ **Input Validation** con Zod
- ✅ **SQL Injection** prevenido con Supabase
- ✅ **XSS Protection** con headers de seguridad
- ✅ **CSRF Protection** con tokens

## 📊 SEO

### Optimizaciones Implementadas
- ✅ **Meta Tags** dinámicos
- ✅ **Open Graph** y Twitter Cards
- ✅ **Structured Data** (JSON-LD)
- ✅ **Sitemap.xml** dinámico
- ✅ **Robots.txt** optimizado
- ✅ **Canonical URLs**
- ✅ **Hreflang** para internacionalización

## 🚀 Roadmap

### Próximas Características
- [ ] **Multiidioma** (ES/EN/DE)
- [ ] **App móvil** nativa
- [ ] **Chat en vivo** con clientes
- [ ] **Sistema de reviews** y ratings
- [ ] **Integración con Google Analytics**
- [ ] **Email marketing** automatizado
- [ ] **Sistema de fidelización**
- [ ] **API pública** para partners

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: info@tenerifeparadisetoursexcursions.com
- **Teléfono**: +34 617 30 39 29
- **Documentación**: [Wiki del proyecto](link-to-wiki)

## 🙏 Agradecimientos

- **Supabase** por el excelente backend as a service
- **Vercel** por la plataforma de despliegue
- **shadcn/ui** por los componentes UI
- **Next.js** por el framework increíble
- **Tailwind CSS** por el framework CSS

---

**Desarrollado con ❤️ para Tenerife Paradise Tours & Excursions**
