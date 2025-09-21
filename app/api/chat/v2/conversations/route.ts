/**
 * API v2 para conversaciones del chat - Versión simplificada
 */

import { NextRequest, NextResponse } from 'next/server'

// Configurar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        total: 0,
        message: 'API simplificada - funcionalidad de chat en desarrollo'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: { id: 'temp-' + Date.now(), title: 'Nueva conversación' },
      message: 'API simplificada - funcionalidad de chat en desarrollo'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
