import { NextRequest, NextResponse } from 'next/server'
import { createTranslationProvider, TranslationQueue } from '@/lib/translation/queue'
import { I18N_ENABLED } from '@/app/config/i18n'

// Singleton para la cola de traducción
let translationQueue: TranslationQueue | null = null

function getTranslationQueue(): TranslationQueue {
  if (!translationQueue) {
    const provider = process.env.TRANSLATION_PROVIDER as 'deepl' | 'google' | 'azure'
    const apiKey = process.env.TRANSLATION_API_KEY
    
    if (!provider || !apiKey) {
      throw new Error('Translation provider or API key not configured')
    }

    const translationProvider = createTranslationProvider(provider, apiKey)
    translationQueue = new TranslationQueue(translationProvider)
  }
  
  return translationQueue
}

// GET /api/translations - Listar traducciones
export async function GET(request: NextRequest) {
  try {
    if (!I18N_ENABLED) {
      return NextResponse.json({ error: 'Translation is disabled' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const locale = searchParams.get('locale')
    const status = searchParams.get('status')

    // Mock data - would query Supabase
    const mockTranslations = [
      {
        id: '1',
        serviceId: '1',
        locale: 'en',
        title: 'Blue Ocean Catamaran',
        description: 'Enjoy an unforgettable day on the Atlantic Ocean',
        status: 'verified',
        contentHash: 'abc123',
        verifiedAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        serviceId: '1',
        locale: 'de',
        title: 'Blaues Ozean Katamaran',
        description: 'Genießen Sie einen unvergesslichen Tag auf dem Atlantischen Ozean',
        status: 'auto',
        contentHash: 'abc123',
        autoTranslatedAt: '2024-01-20T09:30:00Z',
        translationProvider: 'deepl',
        translationJobId: '1-de-abc123',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T09:30:00Z'
      }
    ]

    let filteredTranslations = mockTranslations

    if (serviceId) {
      filteredTranslations = filteredTranslations.filter(t => t.serviceId === serviceId)
    }
    if (locale) {
      filteredTranslations = filteredTranslations.filter(t => t.locale === locale)
    }
    if (status) {
      filteredTranslations = filteredTranslations.filter(t => t.status === status)
    }

    return NextResponse.json({ translations: filteredTranslations })
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/translations - Crear job de traducción
export async function POST(request: NextRequest) {
  try {
    if (!I18N_ENABLED) {
      return NextResponse.json({ error: 'Translation is disabled' }, { status: 400 })
    }

    const body = await request.json()
    const { serviceId, locale, title, description } = body

    if (!serviceId || !locale || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, locale, title, description' },
        { status: 400 }
      )
    }

    const queue = getTranslationQueue()
    
    // Calculate content hash
    const contentHash = await calculateContentHash(title, description)
    
    // Enqueue translation job
    const jobId = await queue.enqueueTranslation(serviceId, locale, contentHash, title)
    
    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Translation job enqueued successfully' 
    })
  } catch (error) {
    console.error('Error creating translation job:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/translations/verify - Verificar traducción
export async function PUT(request: NextRequest) {
  try {
    if (!I18N_ENABLED) {
      return NextResponse.json({ error: 'Translation is disabled' }, { status: 400 })
    }

    const body = await request.json()
    const { serviceId, locale } = body

    if (!serviceId || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, locale' },
        { status: 400 }
      )
    }

    // Mock API call - would call Supabase function
    console.log(`Verifying translation for service ${serviceId} in ${locale}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Translation verified successfully' 
    })
  } catch (error) {
    console.error('Error verifying translation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Helper function to calculate content hash
async function calculateContentHash(title: string, description: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(title + '|' + description)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
