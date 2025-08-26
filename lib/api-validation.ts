import { NextRequest, NextResponse } from "next/server"
import { z, ZodSchema } from "zod"
import { validateData } from "./validation-schemas"

// Tipos para el middleware de validación
export interface ValidationConfig {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

// Función para crear un middleware de validación
export function withValidation(config: ValidationConfig) {
  return function(handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>) {
    return async function(request: NextRequest): Promise<NextResponse> {
      try {
        const validatedData: any = {}

        // Validar body si se especifica
        if (config.body) {
          const body = await request.json().catch(() => ({}))
          const bodyValidation = validateData(config.body, body)
          
          if (!bodyValidation.success) {
            return NextResponse.json({
              error: "Datos de entrada inválidos",
              details: bodyValidation.errors
            }, { status: 400 })
          }
          
          validatedData.body = bodyValidation.data
        }

        // Validar query parameters si se especifica
        if (config.query) {
          const { searchParams } = new URL(request.url)
          const queryParams: Record<string, string> = {}
          
          searchParams.forEach((value, key) => {
            queryParams[key] = value
          })
          
          const queryValidation = validateData(config.query, queryParams)
          
          if (!queryValidation.success) {
            return NextResponse.json({
              error: "Parámetros de consulta inválidos",
              details: queryValidation.errors
            }, { status: 400 })
          }
          
          validatedData.query = queryValidation.data
        }

        // Validar path parameters si se especifica
        if (config.params) {
          // Para Next.js App Router, los params vienen en el handler
          // Esta validación se puede hacer en el handler específico
        }

        // Llamar al handler con los datos validados
        return await handler(request, validatedData)
      } catch (error) {
return NextResponse.json({
          error: "Error interno del servidor"
        }, { status: 500 })
      }
    }
  }
}

// Función para validar solo el body
export function validateBody<T>(schema: ZodSchema<T>) {
  return async function(request: NextRequest): Promise<T> {
    const body = await request.json().catch(() => ({}))
    const validation = validateData(schema, body)
    
    if (!validation.success) {
      throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
    }
    
    return validation.data
  }
}

// Función para validar solo query parameters
export function validateQuery<T>(schema: ZodSchema<T>) {
  return function(request: NextRequest): T {
    const { searchParams } = new URL(request.url)
    const queryParams: Record<string, string> = {}
    
    searchParams.forEach((value, key) => {
      queryParams[key] = value
    })
    
    const validation = validateData(schema, queryParams)
    
    if (!validation.success) {
      throw new Error(`Validación de query fallida: ${validation.errors.join(', ')}`)
    }
    
    return validation.data
  }
}

// Función para crear respuesta de error de validación
export function createValidationErrorResponse(errors: string[]) {
  return NextResponse.json({
    error: "Datos de entrada inválidos",
    details: errors
  }, { status: 400 })
}

// Función para sanitizar strings (remover caracteres peligrosos)
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

// Función para sanitizar objeto completo
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
} 
