# Sistema de Logging y Métricas para la API

## 📋 Descripción General

Este sistema proporciona logging estructurado, métricas de rendimiento y monitoreo completo para todas las operaciones de la API de Tenerife Paradise Tours. Está diseñado para ser eficiente, no intrusivo y proporcionar insights valiosos para debugging y optimización.

## 🚀 Características Principales

### ✅ **Logging Automático**
- Intercepta todas las peticiones HTTP automáticamente
- Registra métricas de rendimiento (tiempo de respuesta, status codes)
- Filtra datos sensibles automáticamente
- Diferentes niveles de logging por entorno

### 📊 **Métricas en Tiempo Real**
- Contadores de requests por endpoint
- Tiempos de respuesta (promedio, P95, P99)
- Tasas de error por endpoint
- Métricas de cache y base de datos
- Usuarios activos y geografía

### 🔒 **Seguridad y Privacidad**
- Filtrado automático de datos sensibles
- Logs encriptados en producción
- Acceso restringido solo a administradores
- Cumplimiento GDPR

### ⚡ **Rendimiento Optimizado**
- Buffering de logs para evitar bloqueos
- Flush automático configurable
- Limpieza automática de datos antiguos
- Índices optimizados en base de datos

## 🛠️ Instalación y Configuración

### 1. **Ejecutar Script SQL**
```bash
# Conectar a Supabase y ejecutar:
\i scripts/create-api-logs-table.sql
```

### 2. **Configurar Variables de Entorno**
```env
# Habilitar logging a base de datos
ENABLE_DATABASE_LOGGING=true

# Configurar nivel de logging
LOG_LEVEL=info

# Configurar retención de logs (días)
LOG_RETENTION_DAYS=30
```

### 3. **Verificar Instalación**
```bash
# Health check
curl -H "Authorization: Bearer YOUR_TOKEN" /api/health

# Métricas
curl -H "Authorization: Bearer YOUR_TOKEN" /api/metrics

# Logs
curl -H "Authorization: Bearer YOUR_TOKEN" /api/logs
```

## 📖 Uso Básico

### **Logging Automático**
El sistema registra automáticamente todas las peticiones HTTP. No necesitas hacer nada adicional:

```typescript
// Esto se loggea automáticamente
export async function GET(request: NextRequest) {
  // Tu código aquí
  return NextResponse.json({ data: 'example' })
}
```

### **Logging Manual**
Para logging manual en casos específicos:

```typescript
import { log } from '@/lib/advanced-logger'

export async function POST(request: NextRequest) {
  try {
    // Tu código aquí
    
    log.info('Operation completed successfully', {
      endpoint: '/api/example',
      method: 'POST',
      userId: 'user123',
      metadata: { operation: 'create', entity: 'user' }
    })
    
  } catch (error) {
    log.error('Operation failed', error, {
      endpoint: '/api/example',
      method: 'POST',
      userId: 'user123'
    })
  }
}
```

### **Métricas Personalizadas**
Para registrar métricas específicas:

```typescript
import { recordMetric } from '@/lib/api-metrics'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Tu código aquí
    
    const duration = Date.now() - startTime
    recordMetric.request('/api/example', 'GET', 200, duration)
    
  } catch (error) {
    const duration = Date.now() - startTime
    recordMetric.request('/api/example', 'GET', 500, duration)
    recordMetric.error('/api/example', error.message)
  }
}
```

## 🔧 Configuración Avanzada

### **Configuración por Entorno**

```typescript
import { getLoggerConfig } from '@/lib/logger-config'

const config = getLoggerConfig()
// config.level, config.enableDatabase, etc.
```

### **Configuración por Endpoint**

```typescript
import { getEndpointLoggingConfig } from '@/lib/logger-config'

const endpointConfig = getEndpointLoggingConfig('/api/payment')
// endpointConfig.enabled, endpointConfig.detailed, etc.
```

### **Middleware Personalizado**

```typescript
import { withApiLogging } from '@/lib/api-logging-middleware'

export const GET = withApiLogging(async function handler(request: NextRequest) {
  // Tu código aquí
}, {
  logRequestBody: true,
  logResponseBody: false,
  logHeaders: true
})
```

## 📊 Endpoints Disponibles

### **GET /api/health**
Estado del sistema y health checks.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "memory": { "status": "healthy", "value": "45.2MB" },
    "uptime": { "status": "healthy", "value": "24.5h" }
  }
}
```

### **GET /api/metrics**
Métricas agregadas del sistema.

**Response:**
```json
{
  "requests": {
    "total": 1250,
    "byEndpoint": { "/api/services": 450, "/api/auth": 200 },
    "byStatus": { "200": 1200, "404": 30, "500": 20 }
  },
  "performance": {
    "averageResponseTime": 245,
    "p95ResponseTime": 890,
    "slowestEndpoints": [...]
  }
}
```

### **GET /api/logs**
Resumen de logs y métricas.

**Query Parameters:**
- `level`: debug, info, warn, error, fatal
- `endpoint`: filtro por endpoint
- `limit`: número máximo de resultados
- `offset`: paginación

## 🎯 Casos de Uso Comunes

### **1. Debugging de Errores**
```bash
# Obtener errores recientes
curl "/api/logs?level=error&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Análisis de Rendimiento**
```bash
# Obtener endpoints más lentos
curl "/api/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.performance.slowestEndpoints'
```

### **3. Monitoreo de Usuarios**
```bash
# Obtener métricas de usuarios
curl "/api/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.users'
```

### **4. Health Check Automático**
```bash
# Para monitoreo externo
curl "/api/health" | jq '.status'
```

## 🔍 Consultas SQL Útiles

### **Errores por Endpoint (Últimas 24h)**
```sql
SELECT 
  endpoint,
  COUNT(*) as error_count,
  COUNT(*) FILTER (WHERE level = 'fatal') as fatal_count
FROM api_logs 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
  AND level IN ('error', 'fatal')
GROUP BY endpoint
ORDER BY error_count DESC;
```

### **Endpoints Más Lentos**
```sql
SELECT 
  endpoint,
  AVG(duration) as avg_duration,
  COUNT(*) as request_count
FROM api_logs 
WHERE duration IS NOT NULL
GROUP BY endpoint
HAVING COUNT(*) >= 10
ORDER BY avg_duration DESC
LIMIT 10;
```

### **Usuarios con Más Errores**
```sql
SELECT 
  user_id,
  COUNT(*) as error_count
FROM api_logs 
WHERE level IN ('error', 'fatal')
  AND user_id IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY error_count DESC
LIMIT 20;
```

## ⚠️ Consideraciones de Rendimiento

### **En Desarrollo**
- Logging completo habilitado
- Flush cada 2 segundos
- Archivos de log locales

### **En Producción**
- Solo logs de warning y error
- Flush cada 10 segundos
- Base de datos como destino principal
- Limpieza automática cada hora

### **Optimizaciones**
- Índices en campos críticos
- Particionado por fecha (opcional)
- Compresión de logs antiguos
- Cache de métricas frecuentes

## 🚨 Alertas y Monitoreo

### **Alertas Automáticas**
- Errores > 10 por minuto
- Tiempo de respuesta > 5 segundos
- Uso de memoria > 400MB
- Endpoints críticos caídos

### **Integración con Herramientas Externas**
- Webhooks para alertas
- Export a sistemas de monitoreo
- Métricas en formato Prometheus
- Logs en formato JSON estructurado

## 🔧 Mantenimiento

### **Limpieza Automática**
```sql
-- Ejecutar manualmente o configurar cron job
SELECT cleanup_old_api_logs();
```

### **Backup de Logs**
```bash
# Exportar logs de un período específico
pg_dump -t api_logs --data-only \
  --where="timestamp >= '2024-01-01' AND timestamp < '2024-02-01'" \
  your_database > logs_january.sql
```

### **Rotación de Archivos**
- Archivos de log rotan automáticamente
- Tamaño máximo: 10MB por archivo
- Máximo 5 archivos por endpoint
- Compresión automática de archivos antiguos

## 📈 Métricas y KPIs

### **KPIs Principales**
- **Disponibilidad**: Uptime del sistema
- **Rendimiento**: Tiempo de respuesta promedio
- **Errores**: Tasa de error por endpoint
- **Usuarios**: Usuarios activos y engagement

### **Métricas de Negocio**
- Endpoints más utilizados
- Patrones de uso por país
- Horas pico de tráfico
- Correlación entre errores y conversiones

## 🆘 Troubleshooting

### **Problemas Comunes**

#### **1. Logs no aparecen en base de datos**
```bash
# Verificar conexión a Supabase
curl "/api/health" | jq '.checks.env_NEXT_PUBLIC_SUPABASE_URL'
```

#### **2. Métricas no se actualizan**
```bash
# Verificar estado del colector
curl "/api/metrics" | jq '.system.lastUpdate'
```

#### **3. Performance degradada**
```bash
# Verificar endpoints lentos
curl "/api/metrics" | jq '.performance.slowestEndpoints'
```

### **Comandos de Debug**
```bash
# Ver logs en tiempo real
tail -f logs/api-$(date +%Y-%m-%d).log

# Ver métricas del sistema
curl "/api/metrics" | jq '.system'

# Ver configuración del logger
node -e "console.log(require('./lib/logger-config').getLoggerConfig())"
```

## 🔮 Roadmap y Mejoras Futuras

### **Próximas Funcionalidades**
- Dashboard web para métricas
- Alertas por email/Slack
- Integración con Grafana
- Machine Learning para detección de anomalías
- Logs distribuidos (para microservicios)

### **Optimizaciones Planificadas**
- Cache distribuido con Redis
- Compresión de logs en tiempo real
- Streaming de métricas
- Análisis de patrones de uso

## 📞 Soporte

Para preguntas o problemas con el sistema de logging:

1. **Revisar logs**: `/api/logs`
2. **Verificar métricas**: `/api/metrics`
3. **Health check**: `/api/health`
4. **Documentación**: Este archivo
5. **Issues**: Crear issue en el repositorio

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Tenerife Paradise Tours
