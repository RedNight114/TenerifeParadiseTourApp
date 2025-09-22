import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-unified'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      )
    }

    // 1. Verificar perfiles duplicados
    const { data: duplicates, error: duplicatesError } = await supabase
      .from('profiles')
      .select('email')
      .group('email')
      .having('count(*)', 'gt', 1)

    if (duplicatesError) {
      console.error('Error verificando duplicados:', duplicatesError)
    }

    // 2. Obtener todos los perfiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (allProfilesError) {
      return NextResponse.json(
        { error: 'Error obteniendo perfiles', details: allProfilesError.message },
        { status: 500 }
      )
    }

    // 3. Agrupar por email y encontrar duplicados
    const profilesByEmail = allProfiles?.reduce((acc: any, profile: any) => {
      if (!acc[profile.email]) {
        acc[profile.email] = []
      }
      acc[profile.email].push(profile)
      return acc
    }, {})

    const duplicateEmails = Object.keys(profilesByEmail || {}).filter(
      email => profilesByEmail[email].length > 1
    )

    // 4. Eliminar duplicados (mantener solo el más reciente)
    const profilesToDelete = []
    for (const email of duplicateEmails) {
      const profiles = profilesByEmail[email].sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      // Mantener el primero (más reciente) y marcar los demás para eliminar
      for (let i = 1; i < profiles.length; i++) {
        profilesToDelete.push(profiles[i].id)
      }
    }

    // 5. Eliminar perfiles duplicados
    let deletedCount = 0
    if (profilesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .in('id', profilesToDelete)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Error eliminando duplicados', details: deleteError.message },
          { status: 500 }
        )
      }
      deletedCount = profilesToDelete.length
    }

    // 6. Verificar perfiles de administradores
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')

    if (adminError) {
      return NextResponse.json(
        { error: 'Error obteniendo administradores', details: adminError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProfiles: allProfiles?.length || 0,
        duplicateEmails: duplicateEmails.length,
        deletedDuplicates: deletedCount,
        adminProfiles: adminProfiles?.length || 0
      },
      duplicateEmails,
      adminProfiles,
      message: `Se eliminaron ${deletedCount} perfiles duplicados`
    })

  } catch (error) {
    console.error('Error en /api/admin/fix-profiles:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
