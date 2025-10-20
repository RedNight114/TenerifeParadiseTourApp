# Configuración de Mapbox para Tenerife Paradise Tour

## Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env.local`:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox_aqui
```

## Obtener Token de Mapbox

1. Ve a [mapbox.com](https://www.mapbox.com/)
2. Crea una cuenta gratuita
3. Ve a tu dashboard y copia tu token público
4. Añádelo a las variables de entorno

## Estilo del Mapa

El mapa utiliza el estilo `mapbox://styles/mapbox/dark-v11` que proporciona:
- Fondo oscuro con carreteras iluminadas
- Edificios 3D en perspectiva (2.5D)
- Perfecto para mostrar hoteles y servicios

## Coordenadas de Tenerife

- **Centro de la isla**: 28.2916, -16.6291
- **Zoom inicial**: 10
- **Sur (Costa Adeje)**: 28.0956, -16.7206
- **Norte (Puerto de la Cruz)**: 28.4181, -16.5489
- **Teide**: 28.2556, -16.6256
- **Los Gigantes**: 28.2389, -16.8411

## Funcionalidades Implementadas

### ✅ Mapa Base
- Mapbox con estilo oscuro y carreteras iluminadas
- Centrado en Tenerife
- Edificios 3D en perspectiva

### ✅ Capas de Datos
- Hoteles con marcadores azules
- Servicios con marcadores verdes
- Filtros por visibilidad

### ✅ Gestión desde Dashboard
- Panel de administración en `/admin/map`
- Activar/desactivar capas completas
- Toggle de visibilidad individual
- Edición de coordenadas manual

### ✅ Interacción en el Mapa
- Popups informativos al hacer clic
- Botón "Reservar" para servicios
- Localización del usuario
- Zoom animado

### ✅ UI/UX
- 100% responsive
- Controles de capas
- Accesibilidad con teclado
- Screen readers compatibles

### ✅ Optimización
- API endpoint `/api/map-data/tenerife`
- React Query para cache
- Lazy loading de markers
- Datos filtrados por visibilidad

## Estructura de Archivos

```
components/
├── MapModule.tsx          # Componente principal del mapa
└── admin/
    └── MapManager.tsx     # Panel de gestión administrativa

app/
├── api/map-data/tenerife/
│   └── route.ts           # API endpoint para datos del mapa
└── (main)/map/
    └── page.tsx           # Página del mapa (sustituye "Sobre Nosotros")
```

## Base de Datos

### Tabla `hoteles`
- `id`, `nombre`, `direccion`, `lat`, `lng`
- `visible_en_mapa`, `telefono`, `email`
- `categoria`, `estrellas`, `descripcion`, `imagen_url`

### Tabla `services` (extendida)
- Columnas añadidas: `lat`, `lng`, `visible_en_mapa`
- Mantiene todas las columnas existentes

## Uso

1. **Para usuarios**: Visita `/map` para explorar el mapa interactivo
2. **Para administradores**: Ve a `/admin/map` para gestionar la visibilidad y coordenadas
3. **API**: Usa `/api/map-data/tenerife` para obtener datos filtrados

## Próximos Pasos

- [ ] Añadir más datos de servicios con coordenadas
- [ ] Implementar clustering para zonas densas
- [ ] Añadir filtros por categoría
- [ ] Integrar con sistema de reservas
- [ ] Añadir rutas entre ubicaciones
