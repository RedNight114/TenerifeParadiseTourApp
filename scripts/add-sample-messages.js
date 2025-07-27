require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addSampleMessages() {
  console.log('📝 Añadiendo mensajes de ejemplo...')
  
  try {
    const sampleMessages = [
      {
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '+34 612 345 678',
        service: 'Senderismo en Anaga',
        date: '2024-02-15',
        guests: 4,
        message: 'Hola, me gustaría información sobre el tour de senderismo en Anaga. ¿Está disponible para el 15 de febrero? Somos 4 personas y nos interesa mucho la ruta de los miradores.',
        status: 'new'
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+34 645 678 901',
        service: 'Tour del Teide',
        date: '2024-02-18',
        guests: 6,
        message: 'Somos un grupo de 6 personas y nos interesa el tour del Teide. ¿Pueden darnos más información sobre horarios, precios y qué incluye el tour?',
        status: 'read',
        admin_notes: 'Cliente interesado en tour completo. Enviar información detallada.'
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@email.com',
        phone: '+34 634 567 890',
        service: 'Cena Romántica',
        date: '2024-02-14',
        guests: 2,
        message: 'Quiero reservar una cena romántica para el día de San Valentín. ¿Tienen algún menú especial? Somos 2 personas.',
        status: 'replied',
        admin_notes: 'Reserva confirmada para 14 de febrero. Menú especial de San Valentín.'
      },
      {
        name: 'Laura Martín',
        email: 'laura.martin@email.com',
        phone: '+34 656 789 012',
        service: 'Buceo',
        date: '2024-02-22',
        guests: 3,
        message: 'Hola, queremos hacer buceo el 22 de febrero. Somos 3 personas, 2 con experiencia y 1 principiante. ¿Tienen cursos para principiantes?',
        status: 'new'
      },
      {
        name: 'David Fernández',
        email: 'david.fernandez@email.com',
        phone: '+34 667 890 123',
        service: 'Alquiler de Moto',
        date: '2024-02-25',
        guests: 2,
        message: 'Necesito alquilar una moto para el 25 de febrero. ¿Tienen motos disponibles? Somos 2 personas.',
        status: 'read',
        admin_notes: 'Verificar disponibilidad de motos para esa fecha.'
      },
      {
        name: 'Sofía Jiménez',
        email: 'sofia.jimenez@email.com',
        phone: '+34 678 901 234',
        service: 'Cena Gastronómica',
        date: '2024-02-20',
        guests: 4,
        message: 'Queremos reservar una cena gastronómica para el 20 de febrero. Somos 4 personas y nos interesa la experiencia con el chef.',
        status: 'new'
      },
      {
        name: 'Miguel Torres',
        email: 'miguel.torres@email.com',
        phone: '+34 689 012 345',
        service: 'Tour en Quad',
        date: '2024-02-16',
        guests: 2,
        message: 'Nos interesa el tour en quad para el 16 de febrero. ¿Es necesario tener experiencia previa? Somos 2 personas.',
        status: 'archived',
        admin_notes: 'Cliente canceló por cambio de planes.'
      }
    ]
    
    console.log(`📤 Insertando ${sampleMessages.length} mensajes de ejemplo...`)
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert(sampleMessages)
      .select()
    
    if (insertError) {
      console.error('❌ Error al insertar mensajes:', insertError)
      return
    }
    
    console.log(`✅ ${insertData.length} mensajes insertados correctamente`)
    
    // Verificar estadísticas
    console.log('\n📊 Verificando estadísticas...')
    const { data: allMessages } = await supabase
      .from('contact_messages')
      .select('status')
    
    if (allMessages) {
      const stats = {
        total: allMessages.length,
        new: allMessages.filter(msg => msg.status === 'new').length,
        read: allMessages.filter(msg => msg.status === 'read').length,
        replied: allMessages.filter(msg => msg.status === 'replied').length,
        archived: allMessages.filter(msg => msg.status === 'archived').length,
      }
      
      console.log('Estadísticas actuales:', stats)
    }
    
    console.log('🎉 Mensajes de ejemplo añadidos correctamente')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la función
addSampleMessages() 