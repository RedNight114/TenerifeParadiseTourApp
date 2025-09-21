import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const client = await getSupabaseClient()
      if (!client) {
        return NextResponse.redirect(new URL('/auth/login?error=connection', request.url))
      }

      const { data, error } = await client.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(new URL('/auth/login?error=callback', request.url))
      }

      if (data.session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login?error=callback', request.url))
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
}

