/**
 * Servicio centralizado para manejo de configuración
 * Elimina la duplicación de lógica de configuración en todo el sistema
 */

export interface AppConfig {
  supabase: {
    url: string | undefined
    anonKey: string | undefined
    isConfigured: boolean
  }
  chat: {
    enableRealTime: boolean
    enableMockData: boolean
    messageRetentionDays: number
    maxMessagesPerPage: number
  }
  features: {
    enableTypingIndicators: boolean
    enableMessageReadStatus: boolean
    enableFileUploads: boolean
  }
}

export class ConfigService {
  private static instance: ConfigService
  private config: AppConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): ConfigService {
    if (!this.instance) {
      this.instance = new ConfigService()
    }
    return this.instance
  }

  private loadConfig(): AppConfig {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseKey,
        isConfigured: this.isSupabaseConfigured(supabaseUrl, supabaseKey)
      },
      chat: {
        enableRealTime: true,
        enableMockData: !this.isSupabaseConfigured(supabaseUrl, supabaseKey),
        messageRetentionDays: 7,
        maxMessagesPerPage: 50
      },
      features: {
        enableTypingIndicators: true,
        enableMessageReadStatus: true,
        enableFileUploads: false
      }
    }
  }

  private isSupabaseConfigured(url?: string, key?: string): boolean {
    return !!(
      url && 
      key && 
      url.includes('supabase.co') && 
      key.length > 20
    )
  }

  getConfig(): AppConfig {
    return this.config
  }

  isSupabaseAvailable(): boolean {
    return this.config.supabase.isConfigured
  }

  shouldUseMockData(): boolean {
    return this.config.chat.enableMockData
  }

  getMessageRetentionDays(): number {
    return this.config.chat.messageRetentionDays
  }

  getMaxMessagesPerPage(): number {
    return this.config.chat.maxMessagesPerPage
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature]
  }

  // Método para recargar configuración (útil en desarrollo)
  reloadConfig(): void {
    this.config = this.loadConfig()
  }
}
