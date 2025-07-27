import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { uploadQuerySchema, validateData } from "@/lib/validation-schemas"
import { createValidationErrorResponse } from "@/lib/api-validation"
import { withUploadRateLimit } from "@/lib/rate-limiting"
import { vercelBlobConfig } from "@/lib/vercel-blob-config"

// POST - Upload de archivos con rate limiting específico
export const POST = withUploadRateLimit(async (request: NextRequest) => {
  try {
    // Verificar configuración de Vercel Blob
    if (!vercelBlobConfig.isConfigured()) {
      console.error("BLOB_READ_WRITE_TOKEN no está configurado")
      return NextResponse.json({ 
        error: "Vercel Blob no está configurado correctamente. Contacta al administrador." 
      }, { status: 500 })
    }

    console.log("✅ Configuración de Vercel Blob verificada")

    // Parsear FormData
    let formData
    try {
      formData = await request.formData()
      console.log("✅ FormData parseado correctamente")
    } catch (error) {
      console.error("Error parseando FormData:", error)
      return NextResponse.json({ 
        error: "Error al procesar el formulario. Asegúrate de enviar un archivo válido." 
      }, { status: 400 })
    }

    const file = formData.get('file') as File

    if (!file) {
      console.error("No se encontró archivo en FormData")
      console.log("Campos disponibles:", Array.from(formData.keys()))
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("📁 Archivo recibido:", file.name, "Tamaño:", file.size, "Tipo:", file.type)

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.error("Tipo de archivo no válido:", file.type)
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("Archivo demasiado grande:", file.size)
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 413 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const uniqueFilename = `uploads/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    console.log("🔄 Subiendo archivo como:", uniqueFilename)

    // Convertir File a Buffer para Vercel Blob
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const blob = await put(uniqueFilename, buffer, {
      access: "public",
    })

    console.log("✅ Archivo subido exitosamente:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: uniqueFilename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error("Error interno en upload:", error)
    
    // Manejar errores específicos de Vercel Blob
    if (error instanceof Error) {
      if (error.message.includes('Failed to retrieve the client token')) {
        return NextResponse.json({ 
          error: "Error de configuración: Token de Vercel Blob no disponible. Contacta al administrador." 
        }, { status: 500 })
      }
      if (error.message.includes('unauthorized')) {
        return NextResponse.json({ 
          error: "Token de Vercel Blob inválido o expirado. Contacta al administrador." 
        }, { status: 401 })
      }
      if (error.message.includes('quota exceeded')) {
        return NextResponse.json({ 
          error: "Límite de almacenamiento de Vercel Blob excedido. Contacta al administrador." 
        }, { status: 507 })
      }
    }
    
    return NextResponse.json({ 
      error: "Error uploading file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
})
