# Configuración de Notificaciones y Configuración del Sistema

Este documento explica cómo configurar y usar el sistema de notificaciones y configuración del panel de administración.

## 🚀 Configuración Inicial

### 1. Crear Tablas en Supabase

Ejecuta los siguientes scripts SQL en tu base de datos de Supabase:

```sql
-- Ejecutar: database/create_notifications_table.sql
-- Ejecutar: database/create_system_settings_table.sql
```

### 2. Configurar Variables de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Instalar Configuraciones por Defecto

```bash
# Ejecutar el script para insertar configuraciones por defecto
node scripts/setup-default-settings.js
```

### 4. Crear Notificaciones de Ejemplo (Opcional)

```bash
# Crear notificaciones de ejemplo para probar
node scripts/create-sample-notifications.js
```

## 📋 Funcionalidades Implementadas

### 🔔 Sistema de Notificaciones

#### Características:
- **Notificaciones en tiempo real** con actualización automática cada 30 segundos
- **Tipos de notificación**: info, success, warning, error, reservation, payment, chat, system
- **Marcar como leído** individual o masivamente
- **Contador de notificaciones no leídas** en el icono
- **Persistencia en base de datos** con historial completo

#### API Endpoints:
- `GET /api/notifications` - Obtener notificaciones del usuario
- `POST /api/notifications` - Crear nueva notificación
- `PUT /api/notifications` - Marcar como leído
- `DELETE /api/notifications` - Eliminar notificación

#### Uso en el código:
```typescript
import { useNotifications } from '@/hooks/use-notifications'

const { createNotification, notifyNewReservation } = useNotifications()

// Crear notificación personalizada
await createNotification({
  title: 'Mi Notificación',
  message: 'Descripción de la notificación',
  type: 'info',
  data: { custom: 'data' }
})

// Notificar nueva reserva
await notifyNewReservation(reservationData)
```

### ⚙️ Sistema de Configuración

#### Características:
- **Configuraciones por categorías**: General, Admin, Reservas, Pagos, Características, Sistema, Notificaciones
- **Tipos de datos**: string, number, boolean, json
- **Configuraciones públicas y privadas**
- **Actualización en tiempo real** sin recargar página
- **Validación de tipos** automática

#### Configuraciones Disponibles:

**General:**
- `site_name` - Nombre del sitio web
- `site_description` - Descripción del sitio

**Administración:**
- `admin_email` - Email del administrador

**Reservas:**
- `max_reservations_per_user` - Máximo de reservas por usuario
- `booking_advance_days` - Días de antelación para reservas
- `auto_confirm_reservations` - Confirmar reservas automáticamente

**Pagos:**
- `default_currency` - Moneda por defecto
- `payment_methods` - Métodos de pago disponibles

**Características:**
- `enable_chat` - Habilitar sistema de chat
- `enable_notifications` - Habilitar notificaciones

**Sistema:**
- `maintenance_mode` - Modo mantenimiento

**Notificaciones:**
- `notification_retention_days` - Días de retención de notificaciones

#### API Endpoints:
- `GET /api/settings` - Obtener configuraciones
- `POST /api/settings` - Crear nueva configuración
- `PUT /api/settings` - Actualizar configuración
- `DELETE /api/settings` - Eliminar configuración

#### Uso en el código:
```typescript
import { useSystemSettings } from '@/hooks/use-system-settings'

const { 
  siteName, 
  enableChat, 
  maxReservationsPerUser,
  updateSetting 
} = useSystemSettings()

// Usar configuraciones
if (enableChat) {
  // Mostrar chat
}

// Actualizar configuración
await updateSetting('max_reservations_per_user', 10)
```

## 🔧 Notificaciones Automáticas

El sistema genera automáticamente notificaciones para:

### Nuevas Reservas
- Se envía a todos los administradores cuando se crea una nueva reserva
- Incluye detalles del servicio, número de personas y datos del cliente

### Pagos Confirmados
- Notificación cuando se confirma un pago
- Incluye monto y número de reserva

### Mensajes de Chat
- Notificación de nuevos mensajes en el sistema de chat
- Incluye nombre del usuario y preview del mensaje

### Eventos del Sistema
- Notificaciones sobre eventos importantes del sistema
- Errores críticos o operaciones exitosas

## 🎨 Componentes UI

### AdminNotifications
- Componente de notificaciones en el header
- Panel desplegable con lista de notificaciones
- Botones para marcar como leído y refrescar

### AdminSettings
- Componente de configuración en el header
- Panel desplegable con configuraciones organizadas por categorías
- Campos dinámicos según el tipo de configuración

## 🔒 Seguridad

### Permisos de Notificaciones:
- Los usuarios solo pueden ver sus propias notificaciones
- Los administradores pueden crear notificaciones para otros usuarios
- El sistema puede crear notificaciones usando service role

### Permisos de Configuración:
- Solo administradores pueden ver/editar todas las configuraciones
- Las configuraciones públicas son visibles para todos los usuarios autenticados
- Validación de tipos y valores en el servidor

## 📊 Mantenimiento

### Limpieza de Notificaciones
```typescript
import { cleanupOldNotifications } from '@/lib/notification-service'

// Limpiar notificaciones más antiguas de 30 días
await cleanupOldNotifications(30)
```

### Monitoreo
- Las notificaciones se actualizan automáticamente cada 30 segundos
- El sistema registra errores en la consola para debugging
- Las configuraciones se validan antes de guardar

## 🚀 Próximas Mejoras

- [ ] Notificaciones push en el navegador
- [ ] Email notifications para eventos críticos
- [ ] Dashboard de estadísticas de notificaciones
- [ ] Configuraciones avanzadas con validaciones complejas
- [ ] Historial de cambios en configuraciones
- [ ] Importar/exportar configuraciones
- [ ] Notificaciones por categorías con preferencias de usuario

## 🐛 Solución de Problemas

### Las notificaciones no se muestran:
1. Verifica que la tabla `notifications` existe en Supabase
2. Comprueba que el usuario tiene permisos de lectura
3. Revisa la consola del navegador para errores de API

### Las configuraciones no se guardan:
1. Verifica que el usuario es administrador
2. Comprueba que la tabla `system_settings` existe
3. Revisa los logs del servidor para errores de validación

### Errores de permisos:
1. Ejecuta las políticas RLS en Supabase
2. Verifica que el usuario tiene el rol correcto en `profiles`
3. Comprueba las variables de entorno de Supabase
