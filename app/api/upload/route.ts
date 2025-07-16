import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { uploadQuerySchema, validateData } from "@/lib/validation-schemas"
import { createValidationErrorResponse } from "@/lib/api-validation"
import { withUploadRateLimit } from "@/lib/rate-limiting"

// POST - Upload de archivos con rate limiting específico
export const POST = withUploadRateLimit(async (request: NextRequest) => {
  try {
    // Validar query parameters
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    const queryValidation = validateData(uploadQuerySchema, { filename })
    
    if (!queryValidation.success) {
      console.error("Error de validación en upload:", queryValidation.errors)
      return createValidationErrorResponse(queryValidation.errors)
    }

    const validatedQuery = queryValidation.data

    console.log("Subiendo archivo:", validatedQuery.filename)

    // Validar que el body no esté vacío
    if (!request.body) {
      console.error("Body de request vacío")
      return NextResponse.json({ error: "No file content provided" }, { status: 400 })
    }

    // Validar tamaño del archivo (máximo 10MB)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      console.error("Archivo demasiado grande:", contentLength)
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 413 })
    }

    const blob = await put(validatedQuery.filename, request.body, {
      access: "public",
    })

    console.log("Archivo subido exitosamente:", blob.url)

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error interno en upload:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
})
