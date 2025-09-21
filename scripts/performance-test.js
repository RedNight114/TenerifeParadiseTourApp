// Script de testing de rendimiento para endpoints de API
const https = require('https')
const http = require('http')
const { performance } = require('perf_hooks')

// Configuración
const BASE_URL = 'http://localhost:3000'
const CONCURRENT_REQUESTS = 10
const TOTAL_REQUESTS = 100
const TIMEOUT = 10000 // 10 segundos

// Endpoints a probar
const ENDPOINTS = [
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET'
  },
  {
    name: 'Métricas',
    path: '/api/metrics',
    method: 'GET',
    headers: { 'Authorization': 'Bearer test-token' }
  },
  {
    name: 'Sitemap',
    path: '/api/sitemap',
    method: 'GET'
  },
  {
    name: 'Robots',
    path: '/api/robots',
    method: 'GET'
  },
  {
    name: 'Contact',
    path: '/api/contact',
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message'
    })
  }
]

// Estadísticas de rendimiento
class PerformanceStats {
  constructor() {
    this.results = []
    this.summary = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0,
      p50: 0,
      p95: 0,
      p99: 0
    }
  }

  addResult(result) {
    this.results.push(result)
    this.summary.totalRequests++
    
    if (result.success) {
      this.summary.successfulRequests++
      this.summary.totalTime += result.responseTime
      this.summary.minTime = Math.min(this.summary.minTime, result.responseTime)
      this.summary.maxTime = Math.max(this.summary.maxTime, result.responseTime)
    } else {
      this.summary.failedRequests++
    }
  }

  calculatePercentiles() {
    const successfulTimes = this.results
      .filter(r => r.success)
      .map(r => r.responseTime)
      .sort((a, b) => a - b)

    if (successfulTimes.length === 0) return

    this.summary.avgTime = this.summary.totalTime / this.summary.successfulRequests
    this.summary.p50 = this.getPercentile(successfulTimes, 50)
    this.summary.p95 = this.getPercentile(successfulTimes, 95)
    this.summary.p99 = this.getPercentile(successfulTimes, 99)
  }

  getPercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[index] || 0
  }

  printSummary() {
    console.log('\n📊 RESUMEN DE RENDIMIENTO')
    console.log('=' .repeat(50))
    console.log(`Total de peticiones: ${this.summary.totalRequests}`)
    console.log(`Exitosas: ${this.summary.successfulRequests}`)
    console.log(`Fallidas: ${this.summary.failedRequests}`)
    console.log(`Tasa de éxito: ${((this.summary.successfulRequests / this.summary.totalRequests) * 100).toFixed(2)}%`)
    console.log('\n⏱️ TIEMPOS DE RESPUESTA')
    console.log(`Tiempo promedio: ${this.summary.avgTime.toFixed(2)}ms`)
    console.log(`Tiempo mínimo: ${this.summary.minTime.toFixed(2)}ms`)
    console.log(`Tiempo máximo: ${this.summary.maxTime.toFixed(2)}ms`)
    console.log(`P50 (mediana): ${this.summary.p50.toFixed(2)}ms`)
    console.log(`P95: ${this.summary.p95.toFixed(2)}ms`)
    console.log(`P99: ${this.summary.p99.toFixed(2)}ms`)
    
    // Evaluación de rendimiento
    console.log('\n🎯 EVALUACIÓN DE RENDIMIENTO')
    if (this.summary.avgTime < 200) {
      console.log('✅ EXCELENTE: Tiempo promedio < 200ms')
    } else if (this.summary.avgTime < 500) {
      console.log('🟡 BUENO: Tiempo promedio < 500ms')
    } else if (this.summary.avgTime < 1000) {
      console.log('🟠 ACEPTABLE: Tiempo promedio < 1s')
    } else {
      console.log('❌ NECESITA MEJORA: Tiempo promedio > 1s')
    }

    if (this.summary.p95 < 500) {
      console.log('✅ EXCELENTE: P95 < 500ms')
    } else if (this.summary.p95 < 1000) {
      console.log('🟡 BUENO: P95 < 1s')
    } else {
      console.log('❌ NECESITA MEJORA: P95 > 1s')
    }
  }
}

// Función para hacer una petición HTTP
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = performance.now()
    const url = new URL(endpoint.path, BASE_URL)
    
    // Agregar parámetros de consulta
    if (endpoint.params) {
      Object.entries(endpoint.params).forEach(([key, value]) => {
        url.searchParams.set(key, value.toString())
      })
    }

    const options = {
      method: endpoint.method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Performance-Test/1.0',
        ...endpoint.headers
      }
    }

    // Agregar body para POST requests
    if (endpoint.body) {
      options.headers['Content-Length'] = Buffer.byteLength(endpoint.body)
    }

    const req = http.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          responseTime,
          dataSize: data.length,
          headers: res.headers
        })
      })
    })

    req.on('error', (error) => {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      resolve({
        success: false,
        error: error.message,
        responseTime
      })
    })

    req.on('timeout', () => {
      req.destroy()
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      resolve({
        success: false,
        error: 'Timeout',
        responseTime
      })
    })

    // Escribir body si existe
    if (endpoint.body) {
      req.write(endpoint.body)
    }

    req.end()
  })
}

// Función para ejecutar test de carga
async function runLoadTest(endpoint) {
  console.log(`\n🚀 Probando: ${endpoint.name}`)
  console.log(`📡 Endpoint: ${endpoint.method} ${endpoint.path}`)
  
  const stats = new PerformanceStats()
  const promises = []
  
  // Crear promesas para peticiones concurrentes
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    promises.push(makeRequest(endpoint))
  }
  
  // Ejecutar peticiones en lotes para simular carga real
  const batchSize = CONCURRENT_REQUESTS
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch)
    
    batchResults.forEach(result => {
      stats.addResult(result)
    })
    
    // Pequeña pausa entre lotes
    if (i + batchSize < promises.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  stats.calculatePercentiles()
  stats.printSummary()
  
  return stats
}

// Función principal
async function main() {
  console.log('🧪 INICIANDO TESTS DE RENDIMIENTO DE API')
  console.log(`🌐 Servidor: ${BASE_URL}`)
  console.log(`📊 Configuración: ${CONCURRENT_REQUESTS} concurrentes, ${TOTAL_REQUESTS} total`)
  
  const allStats = []
  
  for (const endpoint of ENDPOINTS) {
    try {
      const stats = await runLoadTest(endpoint)
      allStats.push({ endpoint: endpoint.name, stats })
    } catch (error) {
      console.error(`❌ Error probando ${endpoint.name}:`, error.message)
    }
  }
  
  // Resumen general
  console.log('\n📈 RESUMEN GENERAL')
  console.log('=' .repeat(50))
  
  allStats.forEach(({ endpoint, stats }) => {
    console.log(`${endpoint}:`)
    console.log(`  Promedio: ${stats.summary.avgTime.toFixed(2)}ms`)
    console.log(`  P95: ${stats.summary.p95.toFixed(2)}ms`)
    console.log(`  Éxito: ${((stats.summary.successfulRequests / stats.summary.totalRequests) * 100).toFixed(2)}%`)
  })
  
  console.log('\n✅ Tests de rendimiento completados')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runLoadTest, PerformanceStats }
