/**
 * Utilidades para parsear datos del chat que podrían venir como JSON strings
 * Esto resuelve el problema de visualización en el dashboard de administración
 */

export interface ParsedConversationData {
  title: string
  description: string
  priority: string
  status: string
  category_name?: string
  user_full_name?: string
  user_email?: string
}

/**
 * Parsear datos de conversación que podrían venir como JSON strings
 */
export function parseConversationData(data: any): ParsedConversationData {
  // Función auxiliar para parsear campos JSON
  const parseField = (field: any): string => {
    if (!field) return ''
    
    // Si es un string que parece JSON, intentar parsearlo
    if (typeof field === 'string' && field.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(field)
        // Si el JSON tiene una estructura específica, extraer el valor
        if (parsed && typeof parsed === 'object') {
          // Buscar campos comunes en diferentes estructuras
          if (parsed.title) return parsed.title
          if (parsed.description) return parsed.description
          if (parsed.name) return parsed.name
          if (parsed.value) return parsed.value
          // Si no hay campos específicos, convertir todo el objeto a string
          return JSON.stringify(parsed)
        }
        return field
      } catch {
        // Si no se puede parsear, devolver el valor original
        return field
      }
    }
    
    return String(field)
  }

  // Parsear campos principales
  const title = parseField(data.title)
  const description = parseField(data.description)
  
  // Extraer título y descripción si están en un JSON anidado
  let finalTitle = title
  let finalDescription = description
  
  // Si el título es un JSON con estructura específica
  if (title.includes('"title"')) {
    try {
      const titleObj = JSON.parse(title)
      if (titleObj.title) finalTitle = titleObj.title
    } catch {
      // Ignorar errores de parsing
    }
  }
  
  // Si la descripción es un JSON con estructura específica
  if (description.includes('"description"')) {
    try {
      const descObj = JSON.parse(description)
      if (descObj.description) finalDescription = descObj.description
    } catch {
      // Ignorar errores de parsing
    }
  }

  return {
    title: finalTitle || 'Nueva consulta',
    description: finalDescription || 'Sin descripción',
    priority: data.priority || 'normal',
    status: data.status || 'active',
    category_name: data.category_name || 'General',
    user_full_name: data.user_full_name || data.user_name || 'Usuario',
    user_email: data.user_email || 'usuario@ejemplo.com'
  }
}

/**
 * Parsear múltiples conversaciones
 */
export function parseConversationsList(conversations: any[]): ParsedConversationData[] {
  return conversations.map(parseConversationData)
}

/**
 * Limpiar y normalizar datos de conversación para la base de datos
 */
export function normalizeConversationData(data: any) {
  return {
    title: typeof data.title === 'string' ? data.title : JSON.stringify(data.title),
    description: typeof data.description === 'string' ? data.description : JSON.stringify(data.description),
    priority: data.priority || 'normal',
    status: data.status || 'active',
    category_id: data.category_id,
    user_id: data.user_id
  }
}

/**
 * Verificar si un campo es un JSON string
 */
export function isJsonString(str: any): boolean {
  if (typeof str !== 'string') return false
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Extraer valor de un campo JSON si es posible
 */
export function extractJsonValue(field: any, key?: string): string {
  if (!isJsonString(field)) return String(field)
  
  try {
    const parsed = JSON.parse(field)
    if (key && parsed[key]) return parsed[key]
    if (parsed.title) return parsed.title
    if (parsed.description) return parsed.description
    if (parsed.name) return parsed.name
    return String(field)
  } catch {
    return String(field)
  }
}

