// Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://tenerifeparadisetoursexcursions.com",
  "https://www.tenerifeparadisetoursexcursions.com"
]

// Función para obtener los headers CORS seguros
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Si no hay origin (por ejemplo, en webhooks), permitir
  if (!origin) {
    return {
      "Access-Control-Allow-Origin": "https://tenerifeparadisetoursexcursions.com",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    }
  }

  // Verificar si el origen está en la lista de permitidos
  const isAllowed = ALLOWED_ORIGINS.includes(origin)
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://tenerifeparadisetoursexcursions.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  }
}

// Función para manejar preflight requests
export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)
    
    return new Response("ok", { 
      headers: corsHeaders,
      status: 200 
    })
  }
  
  return null
} 