import { describe, it, expect } from 'vitest'
import { corsHeaders, isOriginAllowed } from '@/app/api/_utils/cors'

describe('cors util', () => {
  it('permite origen en whitelist', () => {
    const origin = 'http://localhost:3000'
    const headers = corsHeaders(origin)
    expect(headers['Access-Control-Allow-Origin']).toBe(origin)
    expect(isOriginAllowed(origin)).toBe(true)
  })

  it('deniega origen no permitido', () => {
    const origin = 'https://malicioso.com'
    const headers = corsHeaders(origin)
    expect(headers['Access-Control-Allow-Origin']).toBe('https://tu-dominio.com')
    expect(isOriginAllowed(origin)).toBe(false)
  })
})


