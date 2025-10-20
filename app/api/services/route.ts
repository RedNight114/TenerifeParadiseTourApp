import { NextRequest, NextResponse } from 'next/server'
import { parsePaginationParams, toPostgrestCount } from '@/app/api/_utils/pagination'
import { generateEtagFromIds, isNotModified } from '@/app/api/_utils/etag'
import { I18N_ENABLED } from '@/app/config/i18n'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = parsePaginationParams(searchParams)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { limit, offset, cursor, sort, order, count, legacy } = parsed.value

    // Locale opcional para lecturas traducidas en PR-B
    const localeParam = (searchParams.get('locale') || '').toLowerCase()
    const locale = localeParam.split('-')[0]

    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()

    const shouldAsc = order === 'asc'
    const countMode = toPostgrestCount(count)

    let query = supabase
      .from('services')
      .select('*', { count: countMode as any })

    if (cursor) {
      if (sort === 'created_at') {
        query = shouldAsc ? query.gt('created_at', cursor) : query.lt('created_at', cursor)
      } else {
        query = shouldAsc ? query.gt('id', cursor) : query.lt('id', cursor)
      }
      const { data, error, count: total } = await query
        .order(sort, { ascending: shouldAsc })
        .limit(limit)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (legacy) {
        return NextResponse.json(data || [])
      }

      const ids = (data || []).map((i: any) => i.id + (I18N_ENABLED && locale ? `:${locale}` : ''))
      const etag = generateEtagFromIds(ids)
      if (isNotModified(request as any, etag)) {
        return new NextResponse(null, { status: 304, headers: { ETag: etag } })
      }

      const nextCursor = (data && data.length === limit) ? String((data[data.length - 1] as any)[sort]) : null
      return NextResponse.json({
        items: await mapWithTranslations(supabase, data || [], locale),
        page: {
          limit,
          nextCursor,
          count,
          total: count === 'exact' ? (typeof total === 'number' ? total : null) : null
        }
      }, { headers: { ETag: etag } })
    }

    const { data, error, count: total } = await query
      .order(sort, { ascending: shouldAsc })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (legacy) {
      return NextResponse.json(data || [])
    }

    const ids = (data || []).map((i: any) => i.id + (I18N_ENABLED && locale ? `:${locale}` : ''))
    const etag = generateEtagFromIds(ids)
    if (isNotModified(request as any, etag)) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } })
    }

    return NextResponse.json({
      items: await mapWithTranslations(supabase, data || [], locale),
      page: {
        limit,
        offset,
        count,
        total: count === 'exact' ? (typeof total === 'number' ? total : null) : null
      }
    }, { headers: { ETag: etag } })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { getSupabaseClient } = await import("@/lib/supabase-unified")
    const supabase = await getSupabaseClient()
    
    // Usar la función create_service_simple que valida los datos
    const { data, error } = await supabase.rpc('create_service_simple', {
      service_data: body
    })

    if (error) {
      console.error('Error creando servicio:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.success) {
      return NextResponse.json({ error: data?.error || 'Error creando servicio' }, { status: 400 })
    }

    // Obtener el servicio creado para devolverlo
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', data.service_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ service, message: data.message })
  } catch (error) {
    console.error('Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

async function mapWithTranslations(supabase: any, items: any[], locale?: string) {
  if (!I18N_ENABLED || !locale || !items.length) return items
  const ids = items.map((i: any) => i.id)
  const { data: translations, error } = await supabase
    .from('service_translations')
    .select('service_id, title, description, slug, status')
    .in('service_id', ids)
    .eq('locale', locale)

  if (error || !translations?.length) return items

  const byService: Record<string, { verified?: any; auto?: any }> = {}
  for (const t of translations) {
    const bucket = byService[t.service_id] || (byService[t.service_id] = {})
    if (t.status === 'verified' && !bucket.verified) bucket.verified = t
    else if (t.status === 'auto' && !bucket.auto) bucket.auto = t
  }

  return items.map((s: any) => {
    const pick = byService[s.id]?.verified || byService[s.id]?.auto
    if (!pick) return s
    return {
      ...s,
      title: pick.title ?? s.title,
      description: pick.description ?? s.description,
      slug_localized: pick.slug || null,
      translation_status: byService[s.id]?.verified ? 'verified' : 'auto',
      locale,
    }
  })
}








