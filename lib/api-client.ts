import { createClient } from '@supabase/supabase-js'

// Cliente API para llamadas autenticadas
export class ApiClient {
  private static async getAuthHeaders() {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error('Variables de entorno de Supabase no configuradas')
      }
      
      const supabase = createClient(url, key)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error("No hay sesión activa")
      }

      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    } catch (error) {
throw error
    }
  }

  static async get(url: string, options: RequestInit = {}) {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
throw error
    }
  }

  static async post(url: string, data: unknown, options: RequestInit = {}) {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
throw error
    }
  }

  static async put(url: string, data: unknown, options: RequestInit = {}) {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
throw error
    }
  }

  static async delete(url: string, options: RequestInit = {}) {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
throw error
    }
  }
}

// Funciones específicas para el admin
export const adminApi = {
  // Auditoría
  getAuditStats: (days: number = 30) => 
    ApiClient.get(`/api/admin/audit-stats?days=${days}`),
  
  getAuditLogs: (params: {
    page?: number
    limit?: number
    action?: string
    userId?: string
    startDate?: string
    endDate?: string
    severity?: string
  } = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return ApiClient.get(`/api/admin/audit-logs?${searchParams.toString()}`)
  },

  postAuditLogs: (data: unknown) => 
    ApiClient.post('/api/admin/audit-logs', data),

  // Usuarios
  getUsers: (params: {
    page?: number
    limit?: number
    role?: string
    search?: string
  } = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return ApiClient.get(`/api/admin/users?${searchParams.toString()}`)
  },

  // Estadísticas de rate limiting
  getRateLimitStats: (days: number = 30) => 
    ApiClient.get(`/api/admin/rate-limit-stats?days=${days}`),
} 

