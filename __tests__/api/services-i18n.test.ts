import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/supabase-unified', () => {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockImplementation((_sel: string, _opts?: any) => chain),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }
  return {
    getSupabaseClient: vi.fn(async () => chain),
    __chain: chain
  }
})

describe('GET /api/services con locale', () => {
  let route: any
  let chain: any

  beforeEach(async () => {
    vi.resetModules()
    process.env.I18N_ENABLED = 'true'
    const mod = await import('@/app/api/services/route')
    route = mod
    const supabaseUnified = await import('@/lib/supabase-unified') as any
    chain = (supabaseUnified as any).__chain
    chain.from.mockClear()
    chain.select.mockClear()
    chain.order.mockClear()
    chain.range.mockClear()
    chain.in.mockClear()
    chain.eq.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve items traducidos si existen verified y cae a auto', async () => {
    chain.select.mockImplementationOnce((_sel: string, _opts?: any) => {
      chain.__result = { data: [{ id: 's1', title: 'Fuente', description: 'Desc fuente' }], error: null, count: 1 }
      return chain
    })
    ;(chain as any).order.mockImplementation(() => chain)
    ;(chain as any).range.mockImplementation(() => chain.__result)

    // Segunda select sobre service_translations
    chain.select.mockImplementationOnce((_sel: string) => {
      chain.__trs = { data: [
        { service_id: 's1', title: 'Verificado', description: 'Desc verificada', slug: 'slug-ver', status: 'verified' }
      ], error: null }
      return {
        in: () => ({ eq: () => chain.__trs })
      }
    })

    const url = new URL('http://localhost/api/services?limit=1&locale=de')
    const res = await route.GET({ url: url.toString(), headers: new Headers() } as any)
    const json = await res.json()
    expect(json.items[0].title).toBe('Verificado')
    expect(json.items[0].translation_status).toBe('verified')
    expect(json.items[0].locale).toBe('de')
  })

  it('ETag incluye locale', async () => {
    chain.select.mockImplementationOnce((_sel: string, _opts?: any) => {
      chain.__result = { data: [{ id: '1' }, { id: '2' }], error: null, count: 2 }
      return chain
    })
    ;(chain as any).order.mockImplementation(() => chain)
    ;(chain as any).range.mockImplementation(() => chain.__result)

    chain.select.mockImplementationOnce((_sel: string) => ({ in: () => ({ eq: () => ({ data: [], error: null }) }) }))

    const url = new URL('http://localhost/api/services?locale=en')
    const res = await route.GET({ url: url.toString(), headers: new Headers() } as any)
    const etag = res.headers.get('ETag')
    expect(etag).toBeTruthy()
    const res304 = await route.GET({ url: url.toString(), headers: new Headers({ 'If-None-Match': etag! }) } as any)
    expect(res304.status).toBe(304)
  })
})


