// Configuración de Vercel Blob
export const vercelBlobConfig = {
  // Verificar si el token está configurado (servidor)
  isConfigured: () => {
    return !!process.env.BLOB_READ_WRITE_TOKEN
  },

  // Obtener el token (solo en el servidor)
  getToken: () => {
    if (typeof window !== 'undefined') {
      throw new Error('getToken solo puede ser llamado en el servidor')
    }
    return process.env.BLOB_READ_WRITE_TOKEN
  },

  // Verificar configuración del cliente
  isClientConfigured: () => {
    // En el cliente, verificar la variable pública
    if (typeof window !== 'undefined') {
      return !!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN
    }
    // En el servidor, también verificar la variable pública
    return !!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN
  },

  // Obtener token del cliente (para uso en el navegador)
  getClientToken: () => {
    return process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN
  },

  // Función de debug para verificar configuración
  debugConfig: () => {
    if (typeof window !== 'undefined') {
      console.log('BLOB_TOKEN (client):', process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN?.substring(0, 10) || 'N/A')
    } else {
      console.log('BLOB_TOKEN (server):', process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) || 'N/A')
    }
  }
}

// Función para validar la configuración completa
export const validateBlobConfig = () => {
  const errors: string[] = []

  if (!vercelBlobConfig.isConfigured()) {
    errors.push('BLOB_READ_WRITE_TOKEN no está configurado en el servidor')
  }

  if (!vercelBlobConfig.isClientConfigured()) {
    errors.push('NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN no está configurado para el cliente')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Función para obtener mensaje de error amigable
export const getBlobErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('failed to retrieve the client token')) {
      return 'Error de configuración: Token de Vercel Blob no disponible. Por favor, verifica la configuración de las variables de entorno.'
    }
    
    if (message.includes('blob_read_write_token')) {
      return 'Token de Vercel Blob no configurado. Contacta al administrador del sistema.'
    }
    
    if (message.includes('unauthorized')) {
      return 'Token de Vercel Blob inválido o expirado. Contacta al administrador.'
    }
    
    if (message.includes('quota exceeded')) {
      return 'Límite de almacenamiento de Vercel Blob excedido. Contacta al administrador.'
    }
  }
  
  return 'Error desconocido al subir la imagen. Inténtalo de nuevo.'
} 
