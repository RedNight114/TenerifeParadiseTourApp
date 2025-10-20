import { describe, it, expect, vi } from 'vitest'
import { POST as MapPost } from '@/app/api/map-data/tenerife/route'

vi.mock('@supabase/supabase-js', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    createClient: () => ({
      auth: {
        getUser: async () => ({ data: { user: null } })
      },
      from: () => ({ select: () => ({ maybeSingle: async () => ({ data: null }) }) })
    })
  }
})

function req(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe('admin POST exige sesión', () => {
  it('retorna 401 cuando no hay sesión', async () => {
    const response = await MapPost(req('http://test.local/api/map-data/tenerife', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
      body: JSON.stringify({ type: 'hotel', id: '1' })
    }) as any)
    expect(response.status).toBe(401)
  })
})


