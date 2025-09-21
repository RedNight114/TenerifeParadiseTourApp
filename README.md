# 🏝️ Tenerife Paradise Tours & Excursions

Una aplicación web moderna desarrollada con Next.js 14 para la reserva y gestión de tours y excursiones en Tenerife.

## 🚀 Características Principales

- ✅ **Sistema de autenticación completo** (login, registro, recuperación de contraseña)
- ✅ **Catálogo de servicios** con filtros y búsqueda avanzada
- ✅ **Páginas de detalles** con galería de imágenes y información completa
- ✅ **Sistema de reservas** integrado con pasarela de pagos
- ✅ **Panel de administración** con gestión de usuarios y servicios
- ✅ **Sistema de mensajes de contacto**
- ✅ **Optimización de rendimiento** con sistema de caché unificado
- ✅ **Diseño responsive** y accesible
- ✅ **Integración con Supabase** para base de datos y autenticación

## 🛠️ Tecnologías

- **[Next.js 14](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[TanStack Query](https://tanstack.com/query)** - Gestión de estado del servidor
- **[Stripe](https://stripe.com/)** - Sistema de pagos

## 🚀 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📁 Estructura del Proyecto

```
├── app/                 # App Router (Next.js 14)
│   ├── (main)/         # Rutas principales
│   ├── admin/          # Panel de administración
│   ├── api/            # API Routes
│   └── auth/           # Autenticación
├── components/         # Componentes reutilizables
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
├── docs/               # Documentación organizada
│   ├── security/      # Documentación de seguridad
│   ├── performance/   # Optimizaciones de rendimiento
│   ├── ux/            # Mejoras de experiencia de usuario
│   └── deployment/    # Guías de despliegue
└── scripts/           # Scripts de utilidad
```

## 🔧 Scripts Disponibles

```bash
npm run dev              # Desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linting
npm run type-check       # Verificación de tipos
npm run test             # Tests unitarios
npm run test:coverage    # Cobertura de tests
npm run clean:cache      # Limpiar caché
npm run cache:stats      # Estadísticas de caché
```

## 📊 Base de Datos

El proyecto utiliza Supabase con las siguientes tablas principales:

- `profiles` - Perfiles de usuario
- `services` - Catálogo de servicios
- `reservations` - Reservas de usuarios
- `categories` - Categorías de servicios
- `contact_messages` - Mensajes de contacto

## 🎨 Diseño

- **Paleta de colores**: Azul (#0061A8) y Amarillo (#F4C762)
- **Responsive**: Mobile-first design
- **Accesibilidad**: WCAG 2.1 compliant
- **Componentes**: shadcn/ui + custom components

## 🔐 Autenticación

- **Proveedor**: Supabase Auth
- **Métodos**: Email/Password, Magic Links
- **Roles**: Usuario, Administrador
- **Seguridad**: JWT, RLS, Rate limiting

## 💳 Pagos

- **Proveedor**: Stripe
- **Monedas**: EUR (€)
- **Webhooks**: Confirmación automática de pagos

## 📚 Documentación

La documentación completa está organizada en la carpeta `docs/`:

- `docs/security/` - Configuración de seguridad y autenticación
- `docs/performance/` - Optimizaciones de rendimiento
- `docs/ux/` - Mejoras de experiencia de usuario
- `docs/deployment/` - Guías de despliegue
- `docs/archive/` - Documentación histórica

## 🚀 Despliegue

El proyecto está optimizado para despliegue en Vercel con:

- Build optimizado con Next.js 14
- Sistema de caché unificado
- Optimización de imágenes automática
- Configuración de seguridad completa

## 📄 Licencia

Este proyecto es privado y está destinado para uso comercial de Tenerife Paradise Tours.

---

**Desarrollado con ❤️ para Tenerife Paradise Tours**
