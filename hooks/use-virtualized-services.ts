"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
// import { setCache, getCache } from '@/lib/performance-optimizer' // Módulo eliminado

// Funciones mock para reemplazar setCache y getCache
const setCache = (key: string, value: any, ttl?: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now(), ttl }))
  }
}

const getCache = (key: string) => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(key)
    if (cached) {
      try {
        const { value, timestamp, ttl } = JSON.parse(cached)
        if (ttl && Date.now() - timestamp > ttl) {
          localStorage.removeItem(key)
          return null
        }
        return value
      } catch {
        return null
      }
    }
  }
  return null
}
import type { Service } from '@/lib/supabase'
import { getSupabaseClient } from '@/lib/supabase-unified'

interface VirtualizedServicesConfig {
  pageSize: number;
  cacheTTL: number;
  enableVirtualization: boolean;
  preloadDistance: number;
}

interface VirtualizedServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  search: (query: string) => void;
  filter: (filters: unknown) => void;
  virtualizedItems: Service[];
  totalCount: number;
  currentPage: number;
}

export function useVirtualizedServices(
  config: Partial<VirtualizedServicesConfig> = {}
): VirtualizedServicesReturn {
  const {
    pageSize = 12,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    enableVirtualization = true,
    preloadDistance = 2
  } = config;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});

  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  // Generar clave de caché única
  const cacheKey = useMemo(() => {
    const filtersStr = JSON.stringify(activeFilters);
    const searchStr = searchQuery || '';
    return `services_${filtersStr}_${searchStr}_${currentPage}`;
  }, [activeFilters, searchQuery, currentPage]);

  // Función para cargar servicios desde caché o API
  const loadServices = useCallback(async (page: number, forceRefresh = false) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Intentar obtener del caché primero
      if (!forceRefresh) {
        const cached = getCache(cacheKey);
        if (cached) {
          setServices(cached.services || []);
          setTotalCount(cached.totalCount || 0);
          setHasMore(cached.hasMore || false);
          setLoading(false);
          return;
        }
      }

      // Obtener cliente unificado
      const supabase = await getSupabaseClient()

      // Construir query base
      let query = supabase
        .from('services')
        .select(`
          *,
          categories!inner(name, description),
          subcategories!inner(name, description)
        `, { count: 'exact' });

      // Aplicar filtros
      if (activeFilters.category_id) {
        query = query.eq('category_id', activeFilters.category_id);
      }

      if (activeFilters.subcategory_id) {
        query = query.eq('subcategory_id', activeFilters.subcategory_id);
      }

      if (activeFilters.price_min !== undefined) {
        query = query.gte('price', activeFilters.price_min);
      }

      if (activeFilters.price_max !== undefined) {
        query = query.lte('price', activeFilters.price_max);
      }

      if (activeFilters.featured) {
        query = query.eq('featured', true);
      }

      // Aplicar búsqueda
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Aplicar paginación
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      // Ejecutar query
      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      // Procesar datos
      const processedServices = (data || []).map(service => ({
        ...service,
        category_name: service.categories?.name || 'Sin categoría',
        subcategory_name: service.subcategories?.name || 'Sin subcategoría'
      }));

      // Actualizar estado
      if (page === 0) {
        setServices(processedServices);
      } else {
        setServices(prev => [...prev, ...processedServices]);
      }

      setTotalCount(count || 0);
      setHasMore(processedServices.length === pageSize);
      setCurrentPage(page);

      // Guardar en caché
      const cacheData = {
        services: processedServices,
        totalCount: count || 0,
        hasMore: processedServices.length === pageSize,
        timestamp: Date.now()
      };

      setCache(cacheKey, cacheData, cacheTTL);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
} finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cacheKey, cacheTTL, pageSize, activeFilters, searchQuery]);

  // Función para cargar más servicios
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadServices(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, loadServices]);

  // Función para refrescar
  const refresh = useCallback(() => {
    setCurrentPage(0);
    loadServices(0, true);
  }, [loadServices]);

  // Función de búsqueda
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    setServices([]);
    setHasMore(true);
    
    // Debounce para evitar muchas peticiones
    const timeoutId = setTimeout(() => {
      loadServices(0, true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadServices]);

  // Función de filtrado
  const filter = useCallback((filters: unknown) => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setServices([]);
    setHasMore(true);
    loadServices(0, true);
  }, [loadServices]);

  // Configurar Intersection Observer para infinite scroll
  useEffect(() => {
    if (!enableVirtualization) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore, enableVirtualization]);

  // Cargar servicios iniciales
  useEffect(() => {
    loadServices(0);
  }, [loadServices]);

  // Items virtualizados (solo los necesarios)
  const virtualizedItems = useMemo(() => {
    if (!enableVirtualization) return services;

    // Implementar virtualización básica
    const startIndex = Math.max(0, currentPage * pageSize - preloadDistance * pageSize);
    const endIndex = Math.min(services.length, (currentPage + 1) * pageSize + preloadDistance * pageSize);
    
    return services.slice(startIndex, endIndex);
  }, [services, currentPage, pageSize, preloadDistance, enableVirtualization]);

  // Prefetch de siguiente página
  useEffect(() => {
    if (hasMore && !loading && enableVirtualization) {
      const timeoutId = setTimeout(() => {
        if (currentPage > 0) {
          loadServices(currentPage + 1);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [hasMore, loading, currentPage, loadServices, enableVirtualization]);

  return {
    services,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    search,
    filter,
    virtualizedItems,
    totalCount,
    currentPage
  };
}

// Hook para servicios destacados con caché inteligente
export function useFeaturedServices(limit: number = 6) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar obtener del caché
      const cached = getCache('featured_services');
      if (cached) {
        setServices(cached);
        setLoading(false);
        return;
      }

      const supabase = await getSupabaseClient()

      const { data, error: queryError } = await supabase
        .from('services')
        .select(`
          *,
          categories!inner(name, description),
          subcategories!inner(name, description)
        `)
        .eq('featured', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      const processedServices = (data || []).map(service => ({
        ...service,
        category_name: service.categories?.name || 'Sin categoría',
        subcategory_name: service.subcategories?.name || 'Sin subcategoría'
      }));

      setServices(processedServices);

      // Guardar en caché
      setCache('featured_services', processedServices, 10 * 60 * 1000); // 10 minutos

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFeaturedServices();
  }, [loadFeaturedServices]);

  return {
    services,
    loading,
    error,
    refresh: loadFeaturedServices
  };
}






