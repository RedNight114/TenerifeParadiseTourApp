import { NextResponse } from "next/server"
import { vercelBlobConfig } from "@/lib/vercel-blob-config"

export async function GET() {
  try {
    const isConfigured = vercelBlobConfig.isConfigured()
    
    return NextResponse.json({
      configured: isConfigured,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
return NextResponse.json({
      configured: false,
      error: "Error al verificar la configuración",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
} 
