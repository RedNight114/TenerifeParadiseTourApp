"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { logAuth, logError } from '@/lib/logger'
import { withAuthErrorHandling, handleAuthError } from '@/lib/auth-error-handler'

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionRefreshInterval, setSessionRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isClient, setIsClient] = useState(false)
  const authStateRef = useRef<{ user: User | null; profile: Profile | null }>({ user: null, profile: null })

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ NUEVO: Sincronizar estado local con ref para evitar desincronización
  useEffect(() => {
    authStateRef.current = { user, profile }
  }, [user, profile])

  // ✅ NUEVO: Función para refrescar sesión automáticamente
  const refreshSession = useCallback(async () => {
    const supabase = await getSupabaseClient()
    
    return await withAuthErrorHandling(
      async () => {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        
        if (error) {
          logAuth('Error refrescando sesión', { error: error.message })
          
          // Detectar errores específicos de refresh token
          const isInvalidRefreshToken = 
            error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('refresh_token_not_found') ||
            error.code === 'refresh_token_not_found'
          
          if (isInvalidRefreshToken) {
            logAuth('Token de refresco inválido detectado, limpiando sesión...')
            
            // Limpiar sesión completamente
            await supabase.auth.signOut()
            
            // Limpiar estado local
            setUser(null)
            setProfile(null)
            
            // Limpiar almacenamiento local si está disponible
            if (typeof window !== 'undefined') {
              try {
                localStorage.removeItem('supabase.auth.token')
                localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
              } catch (e) {
                // Ignorar errores de localStorage
              }
            }
            
            return false
          }
          
          // Para otros errores, usar el manejador estándar
          await handleAuthError({
            message: error.message,
            code: error.code,
            status: error.status
          }, supabase)
          
          return false
        }

        if (session?.user) {
          logAuth('Sesión refrescada exitosamente')
          setUser(session.user)
          await loadProfile(session.user.id)
          return true
        }

        return false
      },
      supabase,
      false
    )
  }, [])

  // ✅ NUEVO: Configurar refresh automático de sesión
  useEffect(() => {
    if (user) {
      // Refrescar sesión cada 50 minutos (antes de que expire)
      const interval = setInterval(() => {
        refreshSession()
      }, 50 * 60 * 1000) // 50 minutos

      setSessionRefreshInterval(interval)

      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [user, refreshSession])

  // ✅ NUEVO: Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval)
      }
    }
  }, [sessionRefreshInterval])

  // Cargar perfil del usuario
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logAuth('Error cargando perfil', { error: error.message })
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      logAuth('Error cargando perfil', { error: error instanceof Error ? error.message : 'Error desconocido' })
      return null
    }
  }, [])

  // Crear perfil por defecto
  const createDefaultProfile = async (userId: string, fullName: string) => {
    try {
      const supabase = await getSupabaseClient()
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: fullName,
            email: user?.email || '',
            role: 'user',
          },
        ])
        .select()
        .single()

      if (error) {
        logAuth('Error creando perfil por defecto', { error: error.message })
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      logAuth('Error creando perfil por defecto', { error: error instanceof Error ? error.message : 'Error desconocido' })
      return null
    }
  }

  // Inicializar autenticación solo en el cliente
  useEffect(() => {
    if (!isClient) return

    const initializeAuth = async () => {
      try {
        logAuth('Iniciando sistema de autenticación...');
        
        const supabase = await getSupabaseClient();

        // Obtener sesión actual
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            logError('Error obteniendo sesión', sessionError);
            setIsInitialized(true);
            return;
          }

          if (session?.user) {
            logAuth('Usuario autenticado encontrado', { userId: session.user.id });
            setUser(session.user);
            await loadProfile(session.user.id);
          } else {
            logAuth('No hay sesión activa');
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          logError('Error obteniendo sesión', error);
          setIsInitialized(true);
          return;
        }

        // Configurar listener de cambios de autenticación
        try {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              logAuth('Cambio de autenticación', { event, userId: session?.user?.id });
              
              if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id);
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
              } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                logAuth('Token refrescado automáticamente');
                setUser(session.user);
              } else if (event === 'TOKEN_REFRESHED' && !session) {
                logAuth('Token refresh falló, cerrando sesión');
                setUser(null);
                setProfile(null);
              }
            }
          );

          setIsInitialized(true);
          logAuth('Sistema de autenticación inicializado correctamente');

          return () => {
            subscription.unsubscribe();
          };
        } catch (error) {
          logError('Error configurando listener de autenticación', error);
          setIsInitialized(true);
        }
      } catch (err) {
        logError('Error inicializando autenticación', err);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [loadProfile, isClient])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      logAuth('Intentando login', { email });
      
      const supabase = await getSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logAuth('Error en login', { error: error.message })
        setError(error.message)
        return { data: null, error: error.message }
      }

      if (data.user) {
        logAuth('Login exitoso')
        setUser(data.user)
        await loadProfile(data.user.id)
        // Retornar información completa para redirección
        return {
          data: {
            user: data.user,
            profile: authStateRef.current.profile
          },
          error: null
        };
      }
      return { data: null, error: 'No se pudo iniciar sesión' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logAuth('Error en login', { error: errorMessage })
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      logAuth('Iniciando proceso de registro...');
      logAuth('Datos de registro', { email, fullName });
      
      const supabase = await getSupabaseClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        logAuth('Error en registro', { error: error.message })
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        logAuth('Registro exitoso')
        setUser(data.user)
        await createDefaultProfile(data.user.id, fullName)
        return { success: true, error: null }
      }

      return { success: false, error: 'No se pudo crear la cuenta' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logAuth('Error en registro', { error: errorMessage })
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      logAuth('Cerrando sesión...');
      
      const supabase = await getSupabaseClient()

      const { error } = await supabase.auth.signOut()
      if (error) {
        logAuth('Error en logout', { error: error.message })
        setError(error.message)
        return { success: false, error: error.message }
      }

      logAuth('Logout exitoso')
      setUser(null)
      setProfile(null)
      return { success: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logAuth('Error en logout', { error: errorMessage })
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      logAuth('Intentando login con proveedor', { provider });
      
      const supabase = await getSupabaseClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      logAuth('Redirección a proveedor iniciada');
    } catch (err) {
      logError('Error iniciando login con proveedor', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      logAuth('Reenviando email de verificación...');
      
      const supabase = await getSupabaseClient();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });

      if (error) {
        throw error;
      }

      logAuth('Email de verificación reenviado');
      return { success: true };
    } catch (err) {
      logError('Error reenviando email de verificación', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  // ✅ NUEVO: Función para verificar si la sesión está activa
  const isSessionValid = useCallback(() => {
    return !!user && !!profile;
  }, [user, profile])

  // ✅ NUEVO: Función para obtener información de la sesión
  const getSessionInfo = useCallback(() => {
    return {
      user,
      profile,
      isAuthenticated: !!user,
      isAdmin: profile?.role === 'admin',
      sessionAge: user ? Date.now() - new Date(user.created_at).getTime() : 0
    }
  }, [user, profile])

  return {
    user,
    profile,
    isInitialized,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithProvider,
    resendVerificationEmail,
    // ✅ NUEVAS FUNCIONES
    refreshSession,
    isSessionValid,
    getSessionInfo
  }
} 