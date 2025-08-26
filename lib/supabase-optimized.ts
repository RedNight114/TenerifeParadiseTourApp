// Cliente Supabase optimizado para Tenerife Paradise Tour
// Implementa conexión pooling, retry automático y caché inteligente

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getCache, setCache } from './performance-optimizer'

interface SupabaseConfig {
  url: string;
  key: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    db?: {
      schema?: 'public';
    };
    global?: {
      headers?: Record<string, string>;
    };
    realtime?: {
      params?: Record<string, string>;
    };
  };
}

class OptimizedSupabaseClient {
  private client: SupabaseClient<any, "public", any> | null = null;
  private config: SupabaseConfig;
  private connectionPool: Map<string, SupabaseClient<any, "public", any>> = new Map();
  private maxPoolSize = 3;
  private retryAttempts = 3;
  private retryDelay = 1000;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: SupabaseConfig) {
    this.config = config;
    // NO inicializar automáticamente - se hará bajo demanda
  }

  // Inicializar cliente principal
  private async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize() {
    if (this.isInitialized) return;

    try {
      // Verificar que las variables de entorno estén disponibles
      if (!this.config.url || !this.config.key) {
        throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos');
      }

      // Inicializando cliente Supabase optimizado

      this.client = createClient(
        this.config.url,
        this.config.key,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            ...this.config.options?.auth
          },
          db: {
            schema: 'public' as const,
            ...this.config.options?.db
          },
          global: {
            headers: {
              'X-Client-Info': 'tenerife-paradise-tour-optimized',
              ...this.config.options?.global?.headers
            }
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
              ...this.config.options?.realtime?.params
            }
          }
        }
      );

      // Verificar conexión con un health check simple
      const { error } = await this.client.from('services').select('count').limit(1);
      
      if (error) {
        // Health check falló, pero continuando
      } else {
        // Health check exitoso
      }

      this.isInitialized = true;
      // Cliente Supabase optimizado inicializado correctamente
    } catch (error) {
      // Error inicializando cliente Supabase
      // No lanzar error, permitir que la aplicación continúe
      this.isInitialized = false;
    }
  }

  // Obtener cliente principal con verificación (Singleton pattern)
  async getClient(): Promise<SupabaseClient<any, "public", any>> {
    // Si ya está inicializado y existe el cliente, retornarlo
    if (this.client && this.isInitialized) {
      return this.client;
    }

    // Si ya se está inicializando, esperar
    if (this.initializationPromise) {
      await this.initializationPromise;
      return this.client!;
    }

    // Inicializar solo una vez
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.client) {
      throw new Error('No se pudo inicializar el cliente de Supabase');
    }
    
    return this.client;
  }

  // Obtener cliente del pool de conexiones
  async getPooledClient(poolKey: string = 'default'): Promise<SupabaseClient<any, "public", any>> {
    // Verificar si ya existe en el pool
    if (this.connectionPool.has(poolKey)) {
      const pooledClient = this.connectionPool.get(poolKey)!;
      
      // Verificar que el cliente esté funcionando
      try {
        await pooledClient.from('services').select('count').limit(1);
        return pooledClient;
      } catch (error) {
        // Si falla, remover del pool y crear uno nuevo
        this.connectionPool.delete(poolKey);
      }
    }

    // Crear nuevo cliente para el pool
    if (this.connectionPool.size >= this.maxPoolSize) {
      // Remover el cliente más antiguo
      const firstKey = this.connectionPool.keys().next().value;
      if (firstKey) {
        this.connectionPool.delete(firstKey);
      }
    }

    const newClient = createClient(this.config.url, this.config.key);
    this.connectionPool.set(poolKey, newClient);
    
    return newClient;
  }

  // Ejecutar operación con retry automático
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'query'
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
if (attempt < this.retryAttempts) {
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }
    
    throw new Error(`Operación ${operationName} falló después de ${this.retryAttempts} intentos: ${lastError?.message || 'Error desconocido'}`);
  }

  // Verificar si un error no debe reintentarse
  private shouldNotRetry(error: any): boolean {
    // No reintentar errores de autenticación o autorización
    if (error?.status === 401 || error?.status === 403) {
      return true;
    }
    
    // No reintentar errores de validación
    if (error?.code === 'PGRST116') {
      return true;
    }
    
    return false;
  }

  // Función de delay para retry
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Query con caché
  async queryWithCache<T>(
    table: string,
    query: string,
    params: any[] = [],
    cacheKey: string,
    cacheTTL: number = 5 * 60 * 1000
  ): Promise<T> {
    try {
      // Intentar obtener del caché primero
      const cached = getCache(cacheKey);
      if (cached) {
return cached;
      }

             // Si no hay caché, ejecutar query
       const client = await this.getClient();
       const { data: result, error } = await client.rpc(query, params);
       
       if (error) {
         throw error;
       }
       
       // Guardar en caché
       setCache(cacheKey, result, cacheTTL);
return result;
    } catch (error) {
throw error;
    }
  }

  // Obtener servicios optimizado
  async getServicesOptimized(filters: any = {}, page: number = 0, limit: number = 12) {
    try {
      const client = await this.getClient();
      
      let query = client
        .from('services')
        .select(`
          *,
          category:categories(name, description),
          subcategory:subcategories(name, description)
        `)
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Aplicar filtros
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.subcategory_id) {
        query = query.eq('subcategory_id', filters.subcategory_id);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }
      if (filters.duration) {
        query = query.eq('duration', filters.duration);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
// Retornar array vacío en caso de error
      return [];
    }
  }

  // Obtener categorías optimizado
  async getCategoriesOptimized() {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
return [];
    }
  }

  // Obtener subcategorías optimizado
  async getSubcategoriesOptimized(categoryId?: string) {
    try {
      const client = await this.getClient();
      let query = client
        .from('subcategories')
        .select('*')
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
return [];
    }
  }

  // Limpiar pool de conexiones
  async cleanupPool() {
for (const [key, client] of this.connectionPool.entries()) {
      try {
        await client.auth.signOut();
        this.connectionPool.delete(key);
} catch (error) {
}
    }
}

  // Obtener estadísticas del pool
  getPoolStats() {
    return {
      poolSize: this.connectionPool.size,
      maxPoolSize: this.maxPoolSize,
      isInitialized: this.isInitialized,
      hasClient: !!this.client
    };
  }

  // Health check del cliente
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }

      const { error } = await this.client
        .from('services')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
return false;
    }
  }

  // Verificar estado de la conexión
  async checkConnection(): Promise<{
    isConnected: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      const isHealthy = await this.healthCheck();
      
      if (isHealthy) {
        return {
          isConnected: true,
          details: {
            url: this.config.url,
            isInitialized: this.isInitialized,
            poolSize: this.connectionPool.size
          }
        };
      } else {
        return {
          isConnected: false,
          error: 'Health check falló'
        };
      }
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: {
          url: this.config.url,
          isInitialized: this.isInitialized,
          error
        }
      };
    }
  }
}

// Instancia global del cliente optimizado (Singleton pattern)
let globalClient: OptimizedSupabaseClient | null = null;

// Función para obtener el cliente Supabase optimizado
export function getSupabaseClient(): OptimizedSupabaseClient {
  // Si ya existe una instancia, retornarla inmediatamente
  if (globalClient) {
    return globalClient;
  }

  // Verificar variables de entorno
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Crear cliente con valores por defecto para desarrollo
    if (process.env.NODE_ENV === 'development') {
      globalClient = new OptimizedSupabaseClient({
        url: url || 'https://placeholder.supabase.co',
        key: key || 'placeholder-key'
      });
    } else {
      throw new Error('Variables de entorno de Supabase requeridas en producción');
    }
  } else {
    globalClient = new OptimizedSupabaseClient({ url, key });
  }

  return globalClient;
}

// Función para limpiar el cliente global
export function cleanupSupabaseClient() {
  if (globalClient) {
    globalClient.cleanupPool();
    globalClient = null;
  }
}

// Función para verificar si ya existe una instancia
export function hasSupabaseClient(): boolean {
  return globalClient !== null;
}

// Función para reinicializar el cliente (útil para testing)
export function resetSupabaseClient() {
  cleanupSupabaseClient();
  // Forzar nueva creación en la próxima llamada
}

// Funciones de conveniencia
export const queryWithCache = (table: string, query: string, params: any[] = [], cacheKey: string, cacheTTL?: number) => {
  const client = getSupabaseClient();
  return client.queryWithCache(table, query, params, cacheKey, cacheTTL);
};

export const getServicesOptimized = (filters?: any, page?: number, limit?: number) => {
  const client = getSupabaseClient();
  return client.getServicesOptimized(filters, page, limit);
};

export const getCategoriesOptimized = () => {
  const client = getSupabaseClient();
  return client.getCategoriesOptimized();
};

export const getSubcategoriesOptimized = (categoryId?: string) => {
  const client = getSupabaseClient();
  return client.getSubcategoriesOptimized(categoryId);
}; 
