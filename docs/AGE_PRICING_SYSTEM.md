# 🎯 Sistema de Rangos de Edad y Precios

## 📋 **Descripción General**

El sistema de rangos de edad permite a los administradores configurar precios específicos para diferentes grupos de edad en cada servicio. Esto reemplaza el sistema simple de "precio para niños" con un sistema completo y flexible.

## 🏗️ **Arquitectura del Sistema**

### **Base de Datos**
- **Tabla**: `age_price_ranges`
- **Funciones SQL**: 
  - `upsert_service_age_ranges()` - Inserta/actualiza rangos
  - `get_service_age_ranges()` - Recupera rangos activos
- **Trigger**: Se ejecuta automáticamente al crear/actualizar servicios

### **Frontend**
- **Componente**: `AgePricingEditor`
- **Integración**: Formulario de creación/edición de servicios
- **Estado**: Sincronizado con el precio base del servicio

## 🚀 **Características Principales**

### ✅ **Rangos Predefinidos**
- **Bebés (0-2 años)**: Generalmente gratis
- **Niños (3-11 años)**: Precio reducido (70% del precio base)
- **Adolescentes (12-17 años)**: Precio intermedio (70% del precio base)
- **Adultos (18-64 años)**: Precio completo (100% del precio base)
- **Seniors (65+ años)**: Precio reducido (70% del precio base)

### ✅ **Funcionalidades Avanzadas**
- **Edición inline** de rangos existentes
- **Validación** para evitar rangos solapados
- **Activación/desactivación** de rangos
- **Rangos personalizados** adicionales
- **Sincronización automática** con el precio base

## 🎨 **Interfaz de Usuario**

### **Vista Principal**
```
┌─────────────────────────────────────────────────────────────┐
│ 🧒 Bebés                    €0                    [✏️] [⚡] │
│ 0-2 años                                                      │
├─────────────────────────────────────────────────────────────┤
│ 👶 Niños                   €35                   [✏️] [⚡] │
│ 3-11 años                                                      │
├─────────────────────────────────────────────────────────────┤
│ 👨 Adultos                 €50                   [✏️] [⚡] │
│ 18-64 años                                                     │
└─────────────────────────────────────────────────────────────┘
```

### **Modo de Edición**
```
┌─────────────────────────────────────────────────────────────┐
│ Edad mínima    Edad máxima    Precio (€)    [✓] [✗]        │
│ [   0   ]      [   2   ]      [  0.00  ]                    │
└─────────────────────────────────────────────────────────────┘
```

## 📱 **Cómo Usar**

### **1. Crear un Nuevo Servicio**
1. Ve al formulario de creación de servicios
2. Completa la información básica
3. En la sección "Precios y Capacidad":
   - Establece el **Precio Principal** (para adultos)
   - Los rangos de edad se configuran automáticamente
4. Personaliza los rangos según necesites
5. Guarda el servicio

### **2. Editar Rangos de Edad**
1. **Editar rango existente**: Haz clic en el botón ✏️
2. **Cambiar edades**: Modifica edad mínima y máxima
3. **Ajustar precio**: Cambia el precio específico
4. **Guardar cambios**: Haz clic en ✓
5. **Cancelar**: Haz clic en ✗

### **3. Gestionar Rangos**
- **Activar/Desactivar**: Usa el botón ⚡
- **Agregar personalizado**: Botón "Agregar Rango Personalizado"
- **Eliminar**: Solo rangos personalizados (✏️)

## 🔧 **Configuración Técnica**

### **Variables de Entorno Requeridas**
```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### **Dependencias del Frontend**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "lucide-react": "^0.x.x"
  }
}
```

### **Componentes UI Requeridos**
- `Button`
- `Input`
- `Label`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge`

## 🧪 **Pruebas del Sistema**

### **Script de Verificación**
```bash
node scripts/test-age-pricing-integration.js
```

### **Qué Verifica**
1. ✅ Acceso a la tabla `age_price_ranges`
2. ✅ Funcionamiento de `upsert_service_age_ranges`
3. ✅ Funcionamiento de `get_service_age_ranges`
4. ✅ Persistencia correcta de datos
5. ✅ Recuperación correcta de datos

## 📊 **Estructura de Datos**

### **Interfaz AgeRange**
```typescript
interface AgeRange {
  id: string;           // Identificador único
  min_age: number;      // Edad mínima (inclusive)
  max_age: number;      // Edad máxima (inclusive)
  price: number;        // Precio en euros
  price_type: string;   // Tipo: 'baby', 'child', 'teen', 'adult', 'senior', 'custom'
  is_active: boolean;   // Si el rango está activo
}
```

### **Datos de Ejemplo**
```json
{
  "id": "default-baby",
  "min_age": 0,
  "max_age": 2,
  "price": 0,
  "price_type": "baby",
  "is_active": true
}
```

## 🚨 **Validaciones y Restricciones**

### **Reglas de Negocio**
- **Edad mínima**: Debe ser ≥ 0
- **Edad máxima**: Debe ser ≥ edad mínima
- **Sin solapamiento**: No pueden existir rangos que se superpongan
- **Precio**: Debe ser ≥ 0
- **Rangos predefinidos**: No se pueden eliminar

### **Validaciones del Frontend**
- Verificación en tiempo real de rangos solapados
- Validación de edades antes de guardar
- Prevención de rangos duplicados

## 🔄 **Flujo de Datos**

### **1. Creación de Servicio**
```
Formulario → AgePricingEditor → handleAgeRangesChange → ageRanges state
                                                    ↓
                                              handleSubmit → age_ranges en cleanedData
                                                    ↓
                                              Backend → upsert_service_age_ranges()
```

### **2. Actualización de Servicio**
```
Servicio existente → Cargar rangos → AgePricingEditor → Modificaciones
                                                    ↓
                                              Guardar → Actualizar en BD
```

### **3. Recuperación de Datos**
```
Frontend → get_service_age_ranges() → age_price_ranges → Mostrar en UI
```

## 🎯 **Casos de Uso Comunes**

### **Excursión Familiar**
- **Bebés (0-2)**: Gratis
- **Niños (3-11)**: €25 (50% del precio base)
- **Adultos (18+)**: €50 (precio completo)

### **Actividad de Aventura**
- **Niños (8-12)**: €30 (60% del precio base)
- **Adolescentes (13-17)**: €40 (80% del precio base)
- **Adultos (18+)**: €50 (precio completo)

### **Servicio Premium**
- **Todos los rangos**: Precio personalizado
- **Sin descuentos automáticos**
- **Configuración manual completa**

## 🚀 **Próximas Mejoras**

### **Funcionalidades Planificadas**
- [ ] **Descuentos por temporada**
- [ ] **Precios por grupos grandes**
- [ ] **Sistema de cupones por edad**
- [ ] **Reportes de precios por edad**
- [ ] **Importación masiva de rangos**

### **Optimizaciones Técnicas**
- [ ] **Caché de rangos de edad**
- [ ] **Validación en tiempo real más robusta**
- [ ] **Sincronización offline**
- [ ] **Historial de cambios de precios**

## 📞 **Soporte y Mantenimiento**

### **Problemas Comunes**
1. **Rangos no se guardan**: Verificar permisos de BD
2. **Error de validación**: Revisar rangos solapados
3. **Precios no se actualizan**: Verificar sincronización con precio base

### **Logs de Debug**
```bash
# Verificar funciones SQL
node scripts/test-age-pricing-form.js

# Verificar integración completa
node scripts/test-age-pricing-integration.js
```

---

## 🎉 **¡Sistema Implementado y Funcionando!**

El sistema de rangos de edad está completamente integrado en los formularios de servicios y listo para usar. Los administradores pueden ahora configurar precios específicos por edad de manera intuitiva y eficiente.
