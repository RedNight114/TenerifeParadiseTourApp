import { z } from "zod"

// Esquema para crear reservas
export const createReservationSchema = z.object({
  user_id: z.string().uuid("ID de usuario debe ser un UUID válido"),
  service_id: z.string().uuid("ID de servicio debe ser un UUID válido"),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD"),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/, "Hora debe estar en formato HH:MM").optional(),
  guests: z.number().int().positive("Número de huéspedes debe ser un número positivo"),
  total_amount: z.number().positive("Importe total debe ser un número positivo"),
  status: z.enum(["pendiente", "confirmado", "cancelado"]).default("pendiente"),
  payment_status: z.enum(["pendiente", "preautorizado", "pagado", "fallido"]).default("pendiente"),
  special_requests: z.string().max(500, "Solicitudes especiales no pueden exceder 500 caracteres").nullable().optional(),
  contact_name: z.string().min(1, "Nombre de contacto es requerido").max(100, "Nombre no puede exceder 100 caracteres"),
  contact_email: z.string().email("Email de contacto debe ser válido"),
  contact_phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Teléfono debe contener solo números, espacios, guiones y paréntesis").optional(),
})

// Esquema para crear pagos
export const createPaymentSchema = z.object({
  reservationId: z.string().uuid("ID de reserva debe ser un UUID válido"),
  amount: z.number().positive("Importe debe ser un número positivo"),
  description: z.string().min(1, "Descripción es requerida").max(200, "Descripción no puede exceder 200 caracteres"),
})

// Esquema para confirmar pagos
export const confirmPaymentSchema = z.object({
  reservationId: z.string().uuid("ID de reserva debe ser un UUID válido"),
})

// Esquema para parámetros de consulta de reservas
export const getReservationsQuerySchema = z.object({
  userId: z.string().uuid("ID de usuario debe ser un UUID válido"),
})

// Esquema para parámetros de upload
export const uploadQuerySchema = z.object({
  filename: z.string().min(1, "Nombre de archivo es requerido").max(255, "Nombre de archivo no puede exceder 255 caracteres"),
})

// Esquema para validar emails
export const emailSchema = z.string().email("Email debe ser válido")

// Esquema para validar UUIDs
export const uuidSchema = z.string().uuid("Debe ser un UUID válido")

// Esquema para validar fechas
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe estar en formato YYYY-MM-DD")

// Esquema para validar horas
export const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Hora debe estar en formato HH:MM")

// Esquema para validar números positivos
export const positiveNumberSchema = z.number().positive("Debe ser un número positivo")

// Esquema para validar strings con longitud máxima
export const maxLengthStringSchema = (maxLength: number) => 
  z.string().max(maxLength, `No puede exceder ${maxLength} caracteres`)

// Esquema para validar teléfonos
export const phoneSchema = z.string().regex(
  /^\+?[\d\s\-()]+$/,
  "Teléfono debe contener solo números, espacios, guiones y paréntesis"
)

// Esquema para validar códigos de estado
export const statusSchema = z.enum(["pendiente", "confirmado", "cancelado"])
export const paymentStatusSchema = z.enum(["pendiente", "preautorizado", "pagado", "fallido"])

// Función utilitaria para validar datos con manejo de errores
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ["Error de validación desconocido"] }
  }
}

// Función para validar datos de forma segura (no lanza excepciones)
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data)
  } catch {
    return null
  }
} 