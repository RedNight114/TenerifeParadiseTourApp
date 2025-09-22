// Sistema de cookies mejorado para persistencia de sesión
// Maneja cookies de manera segura y consistente

interface CookieOptions {
  expires?: Date
  maxAge?: number
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

class CookieManager {
  private static instance: CookieManager | null = null

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager()
    }
    return CookieManager.instance
  }

  // Establecer cookie
  setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === 'undefined') return

    const {
      expires,
      maxAge,
      domain,
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      httpOnly = false,
      sameSite = 'strict'
    } = options

    let cookieString = `${name}=${encodeURIComponent(value)}`

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`
    }

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    cookieString += `; path=${path}`

    if (secure) {
      cookieString += '; secure'
    }

    if (httpOnly) {
      cookieString += '; httponly'
    }

    cookieString += `; samesite=${sameSite}`

    document.cookie = cookieString
  }

  // Obtener cookie
  getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null

    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=')
      if (cookieName === name) {
        return decodeURIComponent(cookieValue)
      }
    }
    return null
  }

  // Eliminar cookie
  deleteCookie(name: string, path: string = '/'): void {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
  }

  // Establecer cookies de sesión de Supabase
  setSessionCookies(accessToken: string, refreshToken: string): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 días

    this.setCookie('sb-access-token', accessToken, {
      expires,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Necesario para que el cliente JS pueda acceder
      sameSite: 'strict'
    })

    this.setCookie('sb-refresh-token', refreshToken, {
      expires,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'strict'
    })

    // Cookie de estado de sesión
    this.setCookie('sb-session-active', 'true', {
      expires,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'strict'
    })
  }

  // Limpiar cookies de sesión
  clearSessionCookies(): void {
    this.deleteCookie('sb-access-token')
    this.deleteCookie('sb-refresh-token')
    this.deleteCookie('sb-session-active')
  }

  // Verificar si hay sesión activa
  hasActiveSession(): boolean {
    const accessToken = this.getCookie('sb-access-token')
    const sessionActive = this.getCookie('sb-session-active')
    return !!(accessToken && sessionActive === 'true')
  }

  // Obtener token de acceso
  getAccessToken(): string | null {
    return this.getCookie('sb-access-token')
  }

  // Obtener token de refresh
  getRefreshToken(): string | null {
    return this.getCookie('sb-refresh-token')
  }
}

// Instancia singleton
export const cookieManager = CookieManager.getInstance()

// Funciones helper para uso directo
export const setSessionCookies = (accessToken: string, refreshToken: string) => {
  cookieManager.setSessionCookies(accessToken, refreshToken)
}

export const clearSessionCookies = () => {
  cookieManager.clearSessionCookies()
}

export const hasActiveSession = () => {
  return cookieManager.hasActiveSession()
}

export const getAccessToken = () => {
  return cookieManager.getAccessToken()
}

export const getRefreshToken = () => {
  return cookieManager.getRefreshToken()
}

export default cookieManager
