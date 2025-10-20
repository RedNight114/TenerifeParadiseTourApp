// Lista blanca de orígenes permitidos
const WHITELIST = new Set<string>([
  'https://tu-dominio.com',
  'http://localhost:3000',
])

export function corsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = !!origin && WHITELIST.has(origin)
  return {
    'Vary': 'Origin',
    'Access-Control-Allow-Origin': isAllowed ? origin! : 'https://tu-dominio.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export function handleOptions(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')
    const headers = corsHeaders(origin)
    return new Response('ok', { status: 200, headers })
  }
  return null
}

export function isOriginAllowed(origin: string | null): boolean {
  return !!origin && WHITELIST.has(origin)
}


