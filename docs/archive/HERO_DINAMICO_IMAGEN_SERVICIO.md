# Hero Dinámico con Imagen del Servicio

## Cambio Realizado

Se ha modificado el hero para que use la primera imagen del servicio específico en lugar de una imagen genérica, creando una experiencia más personalizada y relevante para cada excursión.

## Características del Hero Dinámico

### **Imagen de Fondo:**
- **Fuente:** Primera imagen del servicio (`service.images[0]`)
- **Fallback:** `/images/hero-services.jpg` si no hay imágenes disponibles
- **Efecto:** `blur-sm` - Desenfoque sutil para mejor legibilidad del texto
- **Alt:** Dinámico - incluye el nombre del servicio

### **Overlay Mejorado:**
- **Opacidad:** Aumentada de 40% a 50% (`bg-black/50`)
- **Razón:** El desenfoque requiere más contraste para mantener la legibilidad

### **Lógica de Selección:**
```javascript
src={service.images && service.images.length > 0 ? service.images[0] : '/images/hero-services.jpg'}
```

## Beneficios del Cambio

### 1. **Personalización**
- Cada servicio tiene su propio hero único
- Imagen específica y relevante al contenido
- Mayor conexión visual con el servicio

### 2. **Consistencia Visual**
- Mantiene el mismo patrón de diseño
- Efecto de desenfoque profesional
- Overlay ajustado para mejor legibilidad

### 3. **Experiencia de Usuario**
- Hero más atractivo y específico
- Mejor contexto visual inmediato
- Transición visual coherente

### 4. **Fallback Robusto**
- Si un servicio no tiene imágenes, usa la imagen genérica
- No hay errores de carga de imagen
- Experiencia consistente en todos los casos

## Efectos Visuales

### **Desenfoque (`blur-sm`):**
- Desenfoque sutil pero efectivo
- Mantiene la identidad visual de la imagen
- Mejora la legibilidad del texto superpuesto
- Efecto profesional y moderno

### **Overlay Ajustado:**
- `bg-black/50` en lugar de `bg-black/40`
- Mayor contraste para compensar el desenfoque
- Texto más legible
- Mantiene la elegancia visual

## Estructura Técnica

```jsx
<Image
  src={service.images && service.images.length > 0 ? service.images[0] : '/images/hero-services.jpg'}
  alt={`${service.title} - Tenerife Paradise Tours & Excursions`}
  fill
  className="object-cover blur-sm"
  priority={true}
  sizes="100vw"
/>
```

## Casos de Uso

### **Servicio con Imágenes:**
- Usa la primera imagen del servicio
- Aplica desenfoque y overlay
- Hero personalizado y específico

### **Servicio sin Imágenes:**
- Usa la imagen genérica de hero-services.jpg
- Mantiene la funcionalidad completa
- Experiencia consistente

## Archivos Modificados

### **Archivo principal:**
- `app/(main)/services/[serviceId]/page.tsx` - Hero dinámico implementado

### **Cambios específicos:**
- Lógica de selección de imagen dinámica
- Aplicación de efecto `blur-sm`
- Ajuste del overlay a `bg-black/50`
- Alt text dinámico

## Verificación

Para verificar que el hero dinámico funciona correctamente:

1. **Navegar a diferentes páginas de servicios**
2. **Verificar hero personalizado:**
   - Cada servicio muestra su propia imagen
   - Efecto de desenfoque aplicado correctamente
   - Overlay proporciona buena legibilidad
3. **Verificar fallback:**
   - Servicios sin imágenes usan la imagen genérica
   - No hay errores de carga
4. **Verificar responsividad:**
   - Efecto de desenfoque funciona en todos los dispositivos
   - Texto legible en todas las resoluciones 