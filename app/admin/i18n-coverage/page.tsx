"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, AlertCircle, CheckCircle, Globe } from 'lucide-react'
import { 
  getAllLocaleCoverage, 
  generateCoverageReport, 
  calculateNamespaceCoverage,
  I18N_NAMESPACES 
} from '@/lib/i18n/coverage'

interface CoverageMetrics {
  namespace: string
  locale: string
  totalKeys: number
  translatedKeys: number
  coveragePercentage: number
  missingKeys: string[]
  outdatedKeys: string[]
}

interface LocaleCoverage {
  locale: string
  totalNamespaces: number
  coveredNamespaces: number
  overallCoverage: number
  namespaces: CoverageMetrics[]
}

export function CoverageDashboard() {
  const [coverageData, setCoverageData] = useState<LocaleCoverage[]>([])
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState<string>('en')

  useEffect(() => {
    loadCoverageData()
  }, [])

  const loadCoverageData = async () => {
    try {
      setLoading(true)
      const coverage = getAllLocaleCoverage()
      const coverageReport = generateCoverageReport()
      
      setCoverageData(coverage)
      setReport(coverageReport)
    } catch (error) {
      console.error('Error loading coverage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCoverageBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'default'
    if (percentage >= 70) return 'secondary'
    return 'destructive'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando métricas de cobertura...</span>
        </div>
      </div>
    )
  }

  const selectedLocaleData = coverageData.find(locale => locale.locale === selectedLocale)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Cobertura i18n</h1>
        <p className="text-gray-600">Métricas de traducción por locale y namespace</p>
      </div>

      {/* Resumen general */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locales Totales</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalLocales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.averageCoverage.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Locale</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.bestLocale.toUpperCase()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Necesita Mejora</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.worstLocale.toUpperCase()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recomendaciones */}
      {report && report.recommendations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedLocale} onValueChange={setSelectedLocale}>
        <TabsList>
          {coverageData.map(locale => (
            <TabsTrigger key={locale.locale} value={locale.locale}>
              {locale.locale.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedLocale} className="mt-6">
          {selectedLocaleData && (
            <div className="space-y-6">
              {/* Resumen del locale seleccionado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Cobertura General - {selectedLocale.toUpperCase()}</span>
                    <Badge variant={getCoverageBadgeVariant(selectedLocaleData.overallCoverage)}>
                      {selectedLocaleData.overallCoverage.toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso general</span>
                        <span>{selectedLocaleData.overallCoverage.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedLocaleData.overallCoverage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Namespaces cubiertos:</span> {selectedLocaleData.coveredNamespaces}/{selectedLocaleData.totalNamespaces}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span> 
                        <Badge 
                          variant={getCoverageBadgeVariant(selectedLocaleData.overallCoverage)} 
                          className="ml-2"
                        >
                          {selectedLocaleData.overallCoverage >= 90 ? 'Completo' : 
                           selectedLocaleData.overallCoverage >= 70 ? 'En progreso' : 'Necesita trabajo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalle por namespace */}
              <div className="grid gap-4">
                {selectedLocaleData.namespaces.map(namespace => (
                  <Card key={namespace.namespace}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{namespace.namespace}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getCoverageBadgeVariant(namespace.coveragePercentage)}>
                            {namespace.coveragePercentage.toFixed(1)}%
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {namespace.translatedKeys}/{namespace.totalKeys}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress value={namespace.coveragePercentage} className="h-2" />
                        
                        {namespace.missingKeys.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-red-600 mb-2">Claves faltantes:</h4>
                            <div className="flex flex-wrap gap-1">
                              {namespace.missingKeys.map(key => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {namespace.outdatedKeys.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-600 mb-2">Claves desactualizadas:</h4>
                            <div className="flex flex-wrap gap-1">
                              {namespace.outdatedKeys.map(key => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={loadCoverageData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar métricas
        </Button>
      </div>
    </div>
  )
}
