"use client"

import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase-singleton'
import { logAuth, logError } from '@/lib/logger'

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

  // Cargar perfil del usuario
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

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
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

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

  // Inicializar autenticación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logAuth('Iniciando sistema de autenticación...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          logError('No se pudo obtener el cliente de Supabase');
          setIsInitialized(true);
          return;
        }

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
  }, [loadProfile])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      logAuth('Intentando login', { email });
      
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

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
            profile // Usar el perfil actualizado
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
      
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

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
      
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase')
      }

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
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase');
      }

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
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('No se pudo obtener el cliente de Supabase');
      }

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
  }
} 