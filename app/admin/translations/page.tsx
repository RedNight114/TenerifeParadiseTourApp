"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface TranslationItem {
  id: string
  serviceId: string
  locale: string
  title: string
  description: string
  status: 'pending' | 'auto' | 'verified' | 'outdated'
  contentHash: string
  autoTranslatedAt?: string
  verifiedAt?: string
  translationProvider?: string
  translationJobId?: string
  createdAt: string
  updatedAt: string
}

interface ServiceTranslation {
  service: {
    id: string
    title: string
    description: string
  }
  translations: TranslationItem[]
}

export function TranslationsAdmin() {
  const [translations, setTranslations] = useState<ServiceTranslation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')

  useEffect(() => {
    fetchTranslations()
  }, [])

  const fetchTranslations = async () => {
    try {
      setLoading(true)
      // Mock data for now - would fetch from API
      const mockData: ServiceTranslation[] = [
        {
          service: {
            id: '1',
            title: 'Blue Ocean Catamaran',
            description: 'Enjoy an unforgettable day on the Atlantic Ocean'
          },
          translations: [
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
            },
            {
              id: '3',
              serviceId: '1',
              locale: 'fr',
              title: 'Catamaran Océan Bleu',
              description: 'Profitez d\'une journée inoubliable sur l\'océan Atlantique',
              status: 'outdated',
              contentHash: 'old123',
              autoTranslatedAt: '2024-01-19T15:00:00Z',
              translationProvider: 'google',
              translationJobId: '1-fr-old123',
              createdAt: '2024-01-19T15:00:00Z',
              updatedAt: '2024-01-20T08:00:00Z'
            }
          ]
        }
      ]
      setTranslations(mockData)
    } catch (error) {
      console.error('Error fetching translations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTranslation = async (serviceId: string, locale: string) => {
    try {
      // Mock API call
      console.log(`Verifying translation for service ${serviceId} in ${locale}`)
      await fetchTranslations() // Refresh data
    } catch (error) {
      console.error('Error verifying translation:', error)
    }
  }

  const handleRegenerateTranslation = async (serviceId: string, locale: string) => {
    try {
      // Mock API call
      console.log(`Regenerating translation for service ${serviceId} in ${locale}`)
      await fetchTranslations() // Refresh data
    } catch (error) {
      console.error('Error regenerating translation:', error)
    }
  }

  const getStatusIcon = (status: TranslationItem['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'auto':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      case 'outdated':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TranslationItem['status']) => {
    const variants = {
      verified: 'default',
      auto: 'secondary',
      pending: 'outline',
      outdated: 'destructive'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const filteredTranslations = translations.filter(service => {
    if (selectedTab === 'all') return true
    return service.translations.some(t => t.status === selectedTab)
  })

  if (loading) {
    return <div className="p-6">Cargando traducciones...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestión de Traducciones</h1>
        <p className="text-gray-600">Revisa y verifica las traducciones automáticas</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="auto">Auto</TabsTrigger>
          <TabsTrigger value="verified">Verificadas</TabsTrigger>
          <TabsTrigger value="outdated">Desactualizadas</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="space-y-6">
            {filteredTranslations.map((service) => (
              <Card key={service.service.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{service.service.title}</span>
                    <Badge variant="outline">{service.translations.length} traducciones</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <strong>Original:</strong> {service.service.description}
                    </div>
                    
                    <div className="grid gap-4">
                      {service.translations.map((translation) => (
                        <div key={translation.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(translation.status)}
                              <span className="font-medium">{translation.locale.toUpperCase()}</span>
                              {getStatusBadge(translation.status)}
                            </div>
                            <div className="flex gap-2">
                              {translation.status === 'auto' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyTranslation(translation.serviceId, translation.locale)}
                                >
                                  Verificar
                                </Button>
                              )}
                              {translation.status === 'outdated' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRegenerateTranslation(translation.serviceId, translation.locale)}
                                >
                                  Regenerar
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <strong>Título:</strong> {translation.title}
                            </div>
                            <div>
                              <strong>Descripción:</strong> {translation.description}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            {translation.translationProvider && (
                              <span>Proveedor: {translation.translationProvider} • </span>
                            )}
                            {translation.autoTranslatedAt && (
                              <span>Auto-traducido: {new Date(translation.autoTranslatedAt).toLocaleString()} • </span>
                            )}
                            {translation.verifiedAt && (
                              <span>Verificado: {new Date(translation.verifiedAt).toLocaleString()} • </span>
                            )}
                            Actualizado: {new Date(translation.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
