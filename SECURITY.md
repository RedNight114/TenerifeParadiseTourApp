# Documentación de Seguridad - Tenerife Paradise Tours

## Índice

1. [CORS Seguro](#cors-seguro)
2. [Validación y Autenticación en Webhooks](#validación-y-autenticación-en-webhooks)
3. [Validación de Datos en APIs](#validación-de-datos-en-apis)
4. [Roles y Permisos en Backend](#roles-y-permisos-en-backend)
5. [Rate Limiting](#rate-limiting)
6. [Auditoría y Logging de Seguridad](#auditoría-y-logging-de-seguridad)

---

## 6. Auditoría y Logging de Seguridad

### Descripción General

El sistema de auditoría y logging proporciona un registro completo de todas las actividades importantes en la aplicación, permitiendo el monitoreo de seguridad, detección de amenazas y cumplimiento normativo.

### Características Principales

#### 6.1 Sistema de Logging Estructurado

**Archivo**: `lib/audit-logger.ts`

- **Logging en múltiples destinos**: Consola, base de datos y archivos
- **Niveles de severidad**: info, warning, error, critical
- **Categorías de eventos**: authentication, authorization, data_access, data_modification, payment, reservation, admin_action, security, system, api
- **Sanitización automática**: Eliminación de datos sensibles
- **Batch processing**: Procesamiento por lotes para optimizar rendimiento
- **Retry mechanism**: Reintentos automáticos en caso de fallos

```typescript
// Ejemplo de uso
await auditLogger.logAuthentication(
  'login_attempt',
  user.id,
  user.email,
  success,
  { ip_address, user_agent },
  error_message
)
```

#### 6.2 Base de Datos de Auditoría

**Script**: `scripts/27-create-audit-logs-table.sql`

**Tabla**: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices optimizados**:
- `idx_audit_logs_user_id`: Búsqueda por usuario
- `idx_audit_logs_category`: Filtrado por categoría
- `idx_audit_logs_level`: Filtrado por nivel de severidad
- `idx_audit_logs_created_at`: Ordenamiento temporal
- `idx_audit_logs_details_gin`: Búsqueda en JSONB

#### 6.3 Funciones de Base de Datos

**Estadísticas de auditoría**:
```sql
SELECT * FROM get_audit_stats(30, NULL);
```

**Detección de actividades sospechosas**:
```sql
SELECT * FROM detect_suspicious_activity(24);
```

**Exportación de logs**:
```sql
SELECT * FROM export_audit_logs(
  '2024-01-01'::timestamp,
  '2024-12-31'::timestamp,
  'authentication',
  'error',
  NULL,
  1000
);
```

**Limpieza automática**:
```sql
SELECT cleanup_old_audit_logs(90);
```

#### 6.4 Middleware de Auditoría

**Archivo**: `lib/audit-middleware.ts`

**Características**:
- Interceptación automática de requests/responses
- Captura de información del request (IP, User-Agent)
- Sanitización de headers sensibles
- Configuración flexible por endpoint
- Logging específico por tipo de evento

```typescript
// Middleware automático
export const GET = withAudit(async (request: NextRequest) => {
  // Tu lógica aquí
})

// Logging específico
await auditAuthEvent('login', user.id, user.email, success, request, details)
await auditPaymentEvent('payment_processed', user.id, user.email, paymentId, amount, success, request)
await auditAdminEvent('user_deleted', admin.id, admin.email, 'user', userId, request, details)
```

#### 6.5 APIs de Auditoría

**Endpoint**: `/api/admin/audit-logs`

**GET**: Consultar logs con filtros
```bash
GET /api/admin/audit-logs?category=authentication&level=error&limit=50&format=csv
```

**POST**: Acciones administrativas
```bash
# Limpiar logs antiguos
POST /api/admin/audit-logs
{
  "action": "cleanup",
  "days_to_keep": 90
}

# Exportar logs
POST /api/admin/audit-logs
{
  "action": "export",
  "format": "json",
  "filters": {
    "category": "authentication",
    "start_date": "2024-01-01"
  }
}
```

**Endpoint**: `/api/admin/audit-stats`

**GET**: Estadísticas y métricas
```bash
GET /api/admin/audit-stats?days=30&include_suspicious=true
```

**POST**: Reportes y análisis
```bash
# Detectar actividades sospechosas
POST /api/admin/audit-stats
{
  "action": "detect_suspicious",
  "hours_back": 24
}

# Generar reporte completo
POST /api/admin/audit-stats
{
  "action": "generate_report",
  "days": 30
}
```

#### 6.6 Dashboard de Auditoría

**Componente**: `components/admin/audit-dashboard.tsx`

**Funcionalidades**:
- Estadísticas en tiempo real
- Visualización de logs recientes
- Detección de actividades sospechosas
- Exportación de datos
- Configuración del sistema

**Métricas mostradas**:
- Total de logs
- Tasa de éxito/error
- Actividad por categoría
- Logs por nivel de severidad
- Actividades sospechosas

#### 6.7 Integración con Endpoints Existentes

**Autenticación** (`/api/auth/callback`):
- Logging de intentos de login
- Registro de errores de autenticación
- Seguimiento de sesiones creadas

**Pagos** (`/api/payment/webhook`):
- Validación de webhooks
- Procesamiento de pagos
- Errores de transacciones
- Confirmaciones exitosas

**APIs administrativas**:
- Acceso a logs de auditoría
- Acciones de limpieza
- Exportación de datos

#### 6.8 Detección de Amenazas

**Actividades sospechosas detectadas**:
- Múltiples intentos de login fallidos
- Errores críticos del sistema
- Intentos de acceso no autorizado
- Fallos en pagos
- Actividad anómala por IP

**Alertas automáticas**:
- Logs de nivel 'critical' se procesan inmediatamente
- Detección de patrones sospechosos
- Notificaciones para administradores

#### 6.9 Configuración y Mantenimiento

**Configuración del logger**:
```typescript
const auditLogger = new AuditLogger({
  enableConsole: true,
  enableDatabase: true,
  enableFile: false,
  logLevel: 'info',
  maxRetries: 3,
  batchSize: 10,
  flushInterval: 5000
})
```

**Limpieza automática**:
- Eliminación de logs antiguos (90+ días)
- Optimización de rendimiento
- Gestión de espacio en disco

**Backup y retención**:
- Exportación regular de logs
- Almacenamiento externo para cumplimiento
- Políticas de retención configurables

#### 6.10 Cumplimiento y Privacidad

**GDPR/CCPA**:
- Sanitización de datos personales
- Exportación de datos del usuario
- Derecho al olvido

**Auditoría de seguridad**:
- Trazabilidad completa de acciones
- Registro de accesos administrativos
- Cumplimiento de estándares de seguridad

**Monitoreo continuo**:
- Alertas en tiempo real
- Reportes automáticos
- Análisis de tendencias

### Beneficios del Sistema de Auditoría

1. **Seguridad mejorada**: Detección temprana de amenazas
2. **Cumplimiento normativo**: Registros para auditorías externas
3. **Debugging**: Trazabilidad completa de errores
4. **Análisis de uso**: Métricas de actividad del sistema
5. **Investigación forense**: Datos para análisis post-incidente
6. **Optimización**: Identificación de patrones de uso

### Próximos Pasos

1. **Alertas en tiempo real**: Integración con sistemas de notificación
2. **Machine Learning**: Detección automática de anomalías
3. **Dashboards avanzados**: Visualizaciones más detalladas
4. **Integración SIEM**: Conexión con sistemas de gestión de eventos
5. **Análisis predictivo**: Predicción de amenazas basada en patrones

---

## Resumen de Implementación

El sistema de auditoría y logging proporciona una capa completa de observabilidad y seguridad, registrando todas las actividades importantes del sistema y proporcionando herramientas para el análisis y detección de amenazas.

### Archivos Creados/Modificados

- `lib/audit-logger.ts` - Sistema principal de logging
- `lib/audit-middleware.ts` - Middleware de auditoría
- `scripts/27-create-audit-logs-table.sql` - Base de datos
- `app/api/admin/audit-logs/route.ts` - API de gestión
- `app/api/admin/audit-stats/route.ts` - API de estadísticas
- `components/admin/audit-dashboard.tsx` - Dashboard de auditoría
- `app/api/auth/callback/route.ts` - Integración en autenticación
- `app/api/payment/webhook/route.ts` - Integración en pagos

### Verificación

```bash
# Verificar build
npm run build

# Verificar tipos
npm run type-check

# Verificar linting
npm run lint
```

El sistema está listo para producción y proporciona una base sólida para el monitoreo de seguridad y cumplimiento normativo. 