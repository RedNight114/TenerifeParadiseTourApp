import { describe, it, expect } from 'vitest'
import { GET as MapGet, POST as MapPost } from '@/app/api/map-data/tenerife/route'

function req(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe('CORS integración', () => {
  it('GET permite origen en whitelist', async () => {
    const response = await MapGet(req('http://test.local/api/map-data/tenerife?hotels=true', {
      method: 'GET',
      headers: { origin: 'http://localhost:3000' }
    }) as any)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
  })

  it('GET ajusta origen no permitido a dominio seguro', async () => {
    const response = await MapGet(req('http://test.local/api/map-data/tenerife', {
      method: 'GET',
      headers: { origin: 'https://evil.com' }
    }) as any)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://tu-dominio.com')
  })
})


