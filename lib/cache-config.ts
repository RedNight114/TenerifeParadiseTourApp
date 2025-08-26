
// Configuración de caché optimizada para Supabase
export const CACHE_CONFIG = {
  // TTL del caché (10 minutos)
  TTL: 10 * 60 * 1000,
  
  // Umbral para prefetch (80% del TTL)
  PRELOAD_THRESHOLD: 0.8,
  
  // Tamaño de lote para procesamiento
  BATCH_SIZE: 50,
  
  // Intentos de retry
  RETRY_ATTEMPTS: 3,
  
  // Delay entre retries
  RETRY_DELAY: 1000,
  
  // Configuración de imágenes
  IMAGE_CONFIG: {
    // Tamaños de imagen optimizados
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    
    // Calidad de imagen
    quality: 85,
    
    // Formato preferido
    format: "webp",
    
    // Lazy loading threshold
    lazyThreshold: 0.1,
  },
  
  // Configuración de queries
  QUERY_CONFIG: {
    // Campos específicos a seleccionar
    selectFields: [
      'id',
      'title',
      'description',
      'category_id',
      'subcategory_id',
      'price',
      'price_children',
      'price_type',
      'images',
      'available',
      'featured',
      'duration',
      'location',
      'min_group_size',
      'max_group_size',
      'difficulty_level',
      'vehicle_type',
      'characteristics',
      'insurance_included',
      'fuel_included',
      'menu',
      'schedule',
      'capacity',
      'dietary_options',
      'min_age',
      'license_required',
      'permit_required',
      'what_to_bring',
      'included_services',
      'not_included_services',
      'meeting_point_details',
      'transmission',
      'seats',
      'doors',
      'fuel_policy',
      'pickup_locations',
      'deposit_required',
      'deposit_amount',
      'experience_type',
      'chef_name',
      'drink_options',
      'ambience',
      'activity_type',
      'fitness_level_required',
      'equipment_provided',
      'cancellation_policy',
      'itinerary',
      'guide_languages',
      'created_at',
      'updated_at'
    ],
    
    // Relaciones a incluir
    relations: [
      'category:categories(name)',
      'subcategory:subcategories(name)'
    ],
    
    // Orden por defecto
    defaultOrder: 'created_at',
    defaultOrderDirection: 'desc'
  }
}

// Función para medir rendimiento
export const performanceMetrics = {
  startTime: 0,
  endTime: 0,
  
  start() {
    this.startTime = performance.now()
  },
  
  end() {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  },
  
  log(operation: string, duration: number) {
    console.log(`${operation} completed in ${duration.toFixed(2)}ms`)
  }
}

// Función para optimizar queries
export const optimizeQuery = (query: any) => {
  return query
    .select(CACHE_CONFIG.QUERY_CONFIG.selectFields.join(', '))
    .order(CACHE_CONFIG.QUERY_CONFIG.defaultOrder, { 
      ascending: CACHE_CONFIG.QUERY_CONFIG.defaultOrderDirection === 'asc' 
    })
}

// Función para procesar datos en lotes
export const processBatch = <T>(data: T[], batchSize: number = CACHE_CONFIG.BATCH_SIZE) => {
  const batches: T[][] = []
  
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize))
  }
  
  return batches
}

// Función para retry con backoff exponencial
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  attempts: number = CACHE_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) throw error
    
    await new Promise(resolve => setTimeout(resolve, CACHE_CONFIG.RETRY_DELAY))
    return retryWithBackoff(fn, attempts - 1)
  }
}

