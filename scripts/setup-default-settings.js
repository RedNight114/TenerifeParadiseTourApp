const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const defaultSettings = [
  // Configuraciones Generales
  {
    key: 'site_name',
    value: 'Tenerife Paradise Tours',
    type: 'string',
    category: 'General',
    description: 'Nombre del sitio web',
    is_public: true
  },
  {
    key: 'site_description',
    value: 'Tours y excursiones en Tenerife',
    type: 'string',
    category: 'General',
    description: 'Descripción del sitio',
    is_public: true
  },
  {
    key: 'admin_email',
    value: 'admin@tenerife-paradise.com',
    type: 'string',
    category: 'admin',
    description: 'Email del administrador',
    is_public: false
  },
  {
    key: 'max_reservations_per_user',
    value: '5',
    type: 'number',
    category: 'reservations',
    description: 'Máximo de reservas activas por usuario',
    is_public: false
  },
  {
    key: 'booking_advance_days',
    value: '30',
    type: 'number',
    category: 'reservations',
    description: 'Días de antelación para reservas',
    is_public: false
  },
  {
    key: 'enable_chat',
    value: 'true',
    type: 'boolean',
    category: 'features',
    description: 'Habilitar sistema de chat',
    is_public: false
  },
  {
    key: 'enable_notifications',
    value: 'true',
    type: 'boolean',
    category: 'features',
    description: 'Habilitar notificaciones',
    is_public: false
  },
  {
    key: 'maintenance_mode',
    value: 'false',
    type: 'boolean',
    category: 'system',
    description: 'Modo mantenimiento',
    is_public: false
  },
  {
    key: 'default_currency',
    value: 'EUR',
    type: 'string',
    category: 'payment',
    description: 'Moneda por defecto',
    is_public: true
  },
  {
    key: 'payment_methods',
    value: JSON.stringify(['card', 'paypal', 'bank_transfer']),
    type: 'json',
    category: 'payment',
    description: 'Métodos de pago disponibles',
    is_public: true
  },
  {
    key: 'notification_retention_days',
    value: '30',
    type: 'number',
    category: 'notifications',
    description: 'Días de retención de notificaciones',
    is_public: false
  },
  {
    key: 'auto_confirm_reservations',
    value: 'false',
    type: 'boolean',
    category: 'reservations',
    description: 'Confirmar reservas automáticamente',
    is_public: false
  },
  
  // Configuraciones adicionales de Reservas
  {
    key: 'max_reservations_per_user',
    value: '5',
    type: 'number',
    category: 'reservations',
    description: 'Número máximo de reservas activas por usuario',
    is_public: false
  },
  {
    key: 'min_days_advance_booking',
    value: '1',
    type: 'number',
    category: 'reservations',
    description: 'Mínimo de días de antelación para reservar',
    is_public: true
  },
  {
    key: 'max_days_advance_booking',
    value: '365',
    type: 'number',
    category: 'reservations',
    description: 'Máximo de días de antelación para reservar',
    is_public: true
  },
  
  // Configuraciones de Características
  {
    key: 'chat_enabled',
    value: 'true',
    type: 'boolean',
    category: 'features',
    description: 'Habilitar función de chat',
    is_public: true
  },
  {
    key: 'reviews_enabled',
    value: 'true',
    type: 'boolean',
    category: 'features',
    description: 'Habilitar sistema de reseñas',
    is_public: true
  },
  {
    key: 'newsletter_enabled',
    value: 'true',
    type: 'boolean',
    category: 'features',
    description: 'Habilitar suscripciones al newsletter',
    is_public: true
  },
  
  // Configuraciones de Sistema
  {
    key: 'maintenance_mode',
    value: 'false',
    type: 'boolean',
    category: 'system',
    description: 'Modo mantenimiento del sitio',
    is_public: false
  },
  {
    key: 'api_rate_limit',
    value: '100',
    type: 'number',
    category: 'system',
    description: 'Límite de peticiones por minuto por IP',
    is_public: false
  },
  {
    key: 'session_timeout_hours',
    value: '24',
    type: 'number',
    category: 'system',
    description: 'Horas antes de expirar la sesión del usuario',
    is_public: false
  },
  
  // Configuraciones de SEO
  {
    key: 'meta_title',
    value: 'Tenerife Paradise Tours - Excursiones y Tours en Tenerife',
    type: 'string',
    category: 'seo',
    description: 'Título meta por defecto',
    is_public: false
  },
  {
    key: 'meta_description',
    value: 'Descubre Tenerife con nuestros tours y excursiones. Teide, Anaga, playas y más.',
    type: 'string',
    category: 'seo',
    description: 'Descripción meta por defecto',
    is_public: false
  },
  
  // Configuraciones de Contacto
  {
    key: 'contact_email',
    value: 'info@tenerife-paradise.com',
    type: 'string',
    category: 'contact',
    description: 'Email de contacto principal',
    is_public: true
  },
  {
    key: 'contact_phone',
    value: '+34 922 123 456',
    type: 'string',
    category: 'contact',
    description: 'Teléfono de contacto',
    is_public: true
  },
  {
    key: 'contact_address',
    value: 'Calle Ejemplo, 123, 38001 Santa Cruz de Tenerife, España',
    type: 'string',
    category: 'contact',
    description: 'Dirección física',
    is_public: true
  }
]

async function setupDefaultSettings() {
  console.log('🚀 Configurando configuraciones por defecto del sistema...')

  try {
    // Verificar si la tabla existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'system_settings')

    if (tablesError || !tables || tables.length === 0) {
      console.error('❌ La tabla system_settings no existe. Ejecuta primero la migración SQL.')
      process.exit(1)
    }

    // Insertar configuraciones por defecto
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(defaultSettings, { onConflict: 'key' })

    if (error) {
      console.error('❌ Error insertando configuraciones:', error)
      process.exit(1)
    }

    console.log('✅ Configuraciones por defecto configuradas correctamente')
    console.log(`📊 Se insertaron/actualizaron ${defaultSettings.length} configuraciones`)

    // Mostrar resumen por categoría
    const categories = [...new Set(defaultSettings.map(s => s.category))]
    console.log('\n📋 Categorías configuradas:')
    categories.forEach(category => {
      const count = defaultSettings.filter(s => s.category === category).length
      console.log(`   • ${category}: ${count} configuraciones`)
    })

  } catch (error) {
    console.error('❌ Error general:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDefaultSettings()
}

module.exports = { setupDefaultSettings, defaultSettings }
