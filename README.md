# 🏝️ TenerifeParadiseTour&Excursions

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

Una plataforma moderna y completa para la reserva de tours y excursiones en la hermosa isla de Tenerife. Desarrollada con Next.js 14, TypeScript y Supabase.

## ✨ Características

- 🎯 **Sistema de autenticación completo** con Supabase
- 🏖️ **Catálogo de servicios** con filtros avanzados
- 📸 **Galerías de imágenes** optimizadas
- 💳 **Sistema de pagos** integrado con Redsys
- 👨‍💼 **Panel de administración** completo
- 📱 **Diseño responsive** y accesible
- ⚡ **Optimización de rendimiento** con Turbopack
- 🔒 **Seguridad robusta** con RLS y validaciones

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/tenerife-paradise-tours.git
cd tenerife-paradise-tours
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run dev:turbo        # Con Turbopack (experimental)

# Producción
npm run build           # Build de producción
npm start               # Servidor de producción

# Utilidades
npm run lint            # Linting
npm run type-check      # Verificación de tipos
npm run clean           # Limpiar caché
```

## 📁 Estructura del Proyecto

```
├── app/                 # App Router (Next.js 14)
│   ├── (main)/         # Rutas principales
│   ├── admin/          # Panel de administración
│   ├── api/            # API Routes
│   └── auth/           # Autenticación
├── components/         # Componentes reutilizables
├── hooks/             # Custom hooks
├── lib/               # Utilidades y configuraciones
├── public/            # Archivos estáticos
└── scripts/           # Scripts de utilidad
```

## 🔧 Tecnologías

- **[Next.js 14](https://nextjs.org/)** - Framework React
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Redsys](https://www.redsys.es/)** - Pasarela de pagos
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - Almacenamiento

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

- **Proveedor**: Redsys
- **Monedas**: EUR (€)
- **Métodos**: Tarjeta de crédito/débito
- **Seguridad**: Firma digital, validación

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Docker

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

## 📈 Rendimiento

- **Core Web Vitals**: Optimizados
- **Bundle Size**: Minimizado
- **Image Optimization**: WebP/AVIF
- **Caching**: Next.js + Supabase
- **CDN**: Vercel Edge Network

## 🧪 Testing

```bash
# Verificación de tipos
npm run type-check

# Linting
npm run lint

# Build de producción
npm run build
```

## 📚 Documentación

Para documentación completa, consulta:
- **[DOCUMENTACION_PROYECTO.md](./DOCUMENTACION_PROYECTO.md)** - Documentación detallada
- **[TURBOPACK_CONFIGURATION.md](./TURBOPACK_CONFIGURATION.md)** - Configuración de Turbopack
- **[TURBOPACK_STATUS.md](./TURBOPACK_STATUS.md)** - Estado de Turbopack

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework increíble
- [Supabase](https://supabase.com/) - Backend potente
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Componentes hermosos
- [Vercel](https://vercel.com/) - Hosting y deployment

---

⭐ **¡Si te gusta este proyecto, dale una estrella!**
