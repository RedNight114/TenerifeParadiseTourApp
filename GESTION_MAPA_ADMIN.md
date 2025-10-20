# Gestión del Mapa - Panel de Administración

## Funcionalidades Implementadas

### 1. Componente MapManager (`components/admin/MapManager.tsx`)

**Funcionalidades principales:**
- **Gestión de Hoteles**: 
  - Ver todos los hoteles registrados
  - Activar/desactivar visibilidad en el mapa
  - Añadir nuevos hoteles con formulario completo
  - Ver información detallada (nombre, dirección, coordenadas, estrellas)

- **Gestión de Servicios**:
  - Ver todos los servicios disponibles
  - Activar/desactivar visibilidad en el mapa
  - Editar coordenadas directamente (latitud/longitud)
  - Ver información del servicio (título, precio, categoría, estado destacado)

**Características técnicas:**
- Interfaz con pestañas (Tabs) para separar hoteles y servicios
- Mutaciones optimistas con React Query
- Validación de formularios
- Estados de carga y error
- Notificaciones toast para feedback del usuario

### 2. Componente MapStatsAdmin (`components/admin/MapStatsAdmin.tsx`)

**Estadísticas mostradas:**
- **Hoteles**: Total, visibles, promedio de estrellas
- **Servicios**: Total, visibles, precio promedio, categorías
- **Indicadores visuales**: Badges de estado activo/inactivo
- **Resumen**: Contadores y métricas clave

### 3. Integración en el Dashboard

**Ubicación**: `/admin/dashboard` → Pestaña "Mapa"

**Layout responsive:**
- Desktop: MapManager (2/3) + MapStatsAdmin (1/3)
- Mobile: Componentes apilados verticalmente

## Funcionalidades del Formulario de Hoteles

### Campos disponibles:
- **Nombre del Hotel**: Campo obligatorio
- **Dirección**: Campo obligatorio
- **Coordenadas**: Latitud y longitud (por defecto: centro de Tenerife)
- **Estrellas**: 1-5 estrellas (por defecto: 4)
- **Teléfono**: Campo opcional
- **Descripción**: Campo opcional

### Validaciones:
- Nombre y dirección son obligatorios
- Coordenadas deben ser números válidos
- Estrellas entre 1 y 5

## Gestión de Servicios

### Edición de coordenadas:
- Campos de latitud y longitud editables
- Actualización automática al cambiar valores
- Validación de coordenadas válidas
- Advertencia si el servicio no tiene coordenadas

### Estados de visibilidad:
- Switch para activar/desactivar cada elemento
- Actualización inmediata en el mapa
- Feedback visual con badges

## Tecnologías Utilizadas

- **React Query**: Para gestión de estado y caché
- **Supabase**: Base de datos y autenticación
- **Tailwind CSS**: Estilos y diseño responsive
- **Radix UI**: Componentes de interfaz (Tabs, Switch, etc.)
- **Lucide React**: Iconos
- **Sonner**: Notificaciones toast

## Estructura de Datos

### Tabla `hoteles`:
```sql
- id (uuid, PK)
- nombre (text)
- direccion (text)
- lat (numeric)
- lng (numeric)
- visible_en_mapa (boolean)
- estrellas (integer)
- telefono (text)
- descripcion (text)
- created_at, updated_at (timestamps)
```

### Tabla `services`:
```sql
- id (uuid, PK)
- title (text)
- description (text)
- price (numeric)
- lat (numeric, nullable)
- lng (numeric, nullable)
- visible_en_mapa (boolean, nullable)
- category_id (text)
- available (boolean)
- featured (boolean)
- created_at, updated_at (timestamps)
```

## Acceso y Permisos

- Solo usuarios con rol `admin` pueden acceder
- Protegido por `AdminGuard`
- Integrado en el layout de administración existente

## Próximas Mejoras Sugeridas

1. **Drag & Drop**: Permitir arrastrar marcadores en el mapa para actualizar coordenadas
2. **Importación masiva**: Cargar hoteles desde CSV/Excel
3. **Geocodificación**: Buscar coordenadas automáticamente por dirección
4. **Historial de cambios**: Auditoría de modificaciones
5. **Filtros avanzados**: Buscar por nombre, categoría, etc.
6. **Vista previa**: Mostrar el mapa integrado en el panel de admin
