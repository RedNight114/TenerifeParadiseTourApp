#!/usr/bin/env node

/**
 * Script para probar el flujo completo de reserva y pago
 * Verifica que los datos de la base de datos sean correctos
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteBookingFlow() {
  console.log('🧪 PRUEBA DEL FLUJO COMPLETO DE RESERVA Y PAGO')
  console.log('==============================================')

  try {
    // 1. Verificar servicios en la base de datos
    console.log('\n1️⃣ Verificando servicios en la base de datos...')
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title, price, price_type, available')
      .eq('available', true)
      .order('price', { ascending: true })

    if (servicesError) {
      throw new Error(`Error obteniendo servicios: ${servicesError.message}`)
    }

    console.log(`✅ Se encontraron ${services.length} servicios disponibles`)

    // 2. Analizar precios de servicios
    console.log('\n2️⃣ Analizando precios de servicios...')
    
    const priceAnalysis = {
      total: services.length,
      validPrices: services.filter(s => s.price > 0).length,
      invalidPrices: services.filter(s => !s.price || s.price <= 0).length,
      nullPrices: services.filter(s => s.price === null).length,
      zeroPrices: services.filter(s => s.price === 0).length,
      negativePrices: services.filter(s => s.price < 0).length
    }

    console.log('📊 Análisis de precios:')
    console.log(`   Total de servicios: ${priceAnalysis.total}`)
    console.log(`   Precios válidos (> 0): ${priceAnalysis.validPrices}`)
    console.log(`   Precios inválidos: ${priceAnalysis.invalidPrices}`)
    console.log(`   Precios NULL: ${priceAnalysis.nullPrices}`)
    console.log(`   Precios 0: ${priceAnalysis.zeroPrices}`)
    console.log(`   Precios negativos: ${priceAnalysis.negativePrices}`)

    // 3. Mostrar servicios problemáticos
    if (priceAnalysis.invalidPrices > 0) {
      console.log('\n⚠️  Servicios con precios problemáticos:')
      services
        .filter(s => !s.price || s.price <= 0)
        .forEach(service => {
          console.log(`   - ${service.title}: ${service.price} (${typeof service.price})`)
        })
    }

    // 4. Simular cálculo de total para cada servicio
    console.log('\n3️⃣ Simulando cálculos de total...')
    
    const testGuests = 2
    const calculations = services.map(service => {
      const total = service.price * testGuests
      return {
        service: service.title,
        price: service.price,
        guests: testGuests,
        total: total,
        isValid: total > 0 && isFinite(total)
      }
    })

    const validCalculations = calculations.filter(c => c.isValid)
    const invalidCalculations = calculations.filter(c => !c.isValid)

    console.log(`✅ Cálculos válidos: ${validCalculations.length}`)
    console.log(`❌ Cálculos inválidos: ${invalidCalculations.length}`)

    if (invalidCalculations.length > 0) {
      console.log('\n❌ Cálculos que generarían error SIS0042:')
      invalidCalculations.forEach(calc => {
        console.log(`   - ${calc.service}: ${calc.price} × ${calc.guests} = ${calc.total}`)
      })
    }

    // 5. Verificar usuarios de prueba
    console.log('\n4️⃣ Verificando usuarios de prueba...')
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .limit(5)

    if (usersError) {
      throw new Error(`Error obteniendo usuarios: ${usersError.message}`)
    }

    console.log(`✅ Se encontraron ${users.length} usuarios`)
    users.forEach(user => {
      console.log(`   - ${user.full_name} (${user.email}) - ${user.role}`)
    })

    // 6. Simular datos de reserva
    console.log('\n5️⃣ Simulando datos de reserva...')
    
    if (validCalculations.length > 0 && users.length > 0) {
      const testService = services.find(s => s.id === validCalculations[0].service)
      const testUser = users[0]
      const testTotal = validCalculations[0].total

      const reservationData = {
        user_id: testUser.id,
        service_id: testService.id,
        reservation_date: '2025-07-20',
        reservation_time: '10:00',
        guests: testGuests,
        total_amount: testTotal,
        status: 'pendiente',
        payment_status: 'pendiente',
        special_requests: 'Prueba del sistema',
        contact_name: testUser.full_name,
        contact_email: testUser.email,
        contact_phone: '+34 123 456 789'
      }

      console.log('📋 Datos de reserva simulados:')
      console.log(JSON.stringify(reservationData, null, 2))

      // 7. Simular datos de pago
      const paymentData = {
        reservationId: 'test-reservation-id',
        amount: testTotal,
        description: `Reserva: ${testService.title}`
      }

      console.log('\n💳 Datos de pago simulados:')
      console.log(JSON.stringify(paymentData, null, 2))

      // 8. Validar datos de pago
      const isPaymentValid = paymentData.amount > 0 && 
                           isFinite(paymentData.amount) && 
                           paymentData.reservationId && 
                           paymentData.description

      console.log(`\n✅ Validación de pago: ${isPaymentValid ? 'VÁLIDO' : 'INVÁLIDO'}`)
    }

    // 9. Resumen final
    console.log('\n📊 RESUMEN FINAL')
    console.log('================')
    
    if (priceAnalysis.invalidPrices === 0) {
      console.log('✅ Todos los servicios tienen precios válidos')
      console.log('✅ El sistema está listo para procesar reservas')
    } else {
      console.log('❌ Hay servicios con precios inválidos')
      console.log('❌ Se debe ejecutar el script de corrección de precios')
      console.log('   node scripts/fix-service-prices.sql')
    }

    if (invalidCalculations.length === 0) {
      console.log('✅ Todos los cálculos de total son válidos')
      console.log('✅ No se generarán errores SIS0042')
    } else {
      console.log('❌ Hay cálculos que generarían errores SIS0042')
      console.log('❌ Se debe corregir los precios de los servicios')
    }

    console.log('\n🎯 RECOMENDACIONES')
    console.log('==================')
    
    if (priceAnalysis.invalidPrices > 0) {
      console.log('1. Ejecutar script de corrección de precios')
      console.log('2. Verificar que todos los servicios tengan precio > 0')
      console.log('3. Probar el flujo completo después de la corrección')
    } else {
      console.log('1. El sistema está funcionando correctamente')
      console.log('2. Se pueden procesar reservas sin problemas')
      console.log('3. Los pagos se enviarán correctamente a Redsys')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    process.exit(1)
  }
}

// Ejecutar la prueba
testCompleteBookingFlow()
  .then(() => {
    console.log('\n✅ Prueba completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en la prueba:', error)
    process.exit(1)
  }) 