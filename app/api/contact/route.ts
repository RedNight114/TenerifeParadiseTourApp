import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'

// Forzar renderizado dinámico para evitar errores de build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Validación de email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Protección contra spam básica
const isSpam = (data: any) => {
  // Verificar si el mensaje es muy corto o muy largo
  if (data.message.length < 10 || data.message.length > 2000) {
    return true
  }
  
  // Verificar si el nombre es muy corto
  if (data.name.length < 2 || data.name.length > 100) {
    return true
  }
  
  // Verificar si hay muchos enlaces en el mensaje (spam común)
  const linkCount = (data.message.match(/https?:\/\/[^\s]+/g) || []).length
  if (linkCount > 3) {
    return true
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validación de campos requeridos
    const { name, email, message, service, date, guests, phone, timestamp, userAgent } = body
    
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }
    
    // Validación de email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    // Protección contra spam
    if (isSpam(body)) {
      return NextResponse.json(
        { error: 'Mensaje detectado como spam' },
        { status: 400 }
      )
    }
    
    // Obtener cliente unificado
    const supabase = await getSupabaseClient()
    
    // Verificar si ya se envió un mensaje similar recientemente (rate limiting)
    const { data: recentMessages } = await supabase
      .from('contact_messages')
      .select('id, created_at')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
      .limit(1)
    
    if (recentMessages && recentMessages.length > 0) {
      return NextResponse.json(
        { error: 'Por favor, espera unos minutos antes de enviar otro mensaje' },
        { status: 429 }
      )
    }
    
    // Guardar el mensaje en la base de datos
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          service: service || null,
          date: date || null,
          guests: guests || null,
          message: message.trim(),
          user_agent: userAgent || null,
          ip_address: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          status: 'new'
        }
      ])
      .select()
    
    if (error) {
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
    
    // Enviar notificación por email (opcional - implementar con servicio de email)
    // await sendNotificationEmail(data[0])
    
    // Enviar notificación a WhatsApp (opcional - implementar con API de WhatsApp)
    // await sendWhatsAppNotification(data[0])
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensaje enviado correctamente',
        id: data[0].id 
      },
      { status: 200 }
    )
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para enviar notificación por email (implementar con servicio como SendGrid, Resend, etc.)
async function sendNotificationEmail(contactData: unknown) {
  // Implementar envío de email
}

// Función para enviar notificación por WhatsApp (implementar con API de WhatsApp Business)
async function sendWhatsAppNotification(contactData: unknown) {
  // Implementar envío de WhatsApp
} 

