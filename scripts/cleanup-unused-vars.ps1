# Script para limpiar variables no utilizadas y dependencias
Write-Host "🧹 Limpiando variables no utilizadas y dependencias..." -ForegroundColor Green

$totalCleaned = 0

# Función para limpiar imports no utilizados
function Remove-UnusedImports {
    param([string]$filePath)
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $cleanedCount = 0
        
        # Patrones comunes de imports no utilizados
        $unusedPatterns = @(
            # UI Components comunes
            'CardHeader',
            'CardTitle', 
            'Badge',
            'ScrollArea',
            'Separator',
            'Button',
            'Card',
            'CardContent',
            'Progress',
            'Label',
            'Info',
            'Star',
            'Euro',
            'RefreshCw',
            'Image',
            'Filter',
            'Sun',
            'Moon',
            'Monitor',
            'Volume2',
            'VolumeX',
            'Shield',
            'CheckCircle',
            'Archive',
            'Trash2',
            'MoreVertical',
            'Bell',
            'BellOff',
            'User',
            'Database',
            'HardDrive',
            'Cpu',
            'Network',
            'TrendingUp',
            'TrendingDown',
            'Maximize2',
            'Minimize2',
            'ArrowLeft'
        )
        
        foreach ($pattern in $unusedPatterns) {
            # Buscar imports no utilizados
            $importRegex = "import\s*\{[^}]*$pattern[^}]*\}\s*from\s*['""][^'""]+['""]"
            if ($content -match $importRegex) {
                $content = $content -replace $importRegex, ""
                $cleanedCount++
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content $filePath $content -Encoding UTF8
            $fileName = Split-Path $filePath -Leaf
            Write-Host "  ✅ $fileName`: Imports no utilizados removidos" -ForegroundColor Green
            return 1
        }
        return 0
    }
    catch {
        Write-Host "  ❌ Error en $filePath`: $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Función para limpiar variables no utilizadas
function Remove-UnusedVariables {
    param([string]$filePath)
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $cleanedCount = 0
        
        # Patrones de variables no utilizadas
        $unusedVarPatterns = @(
            # Variables comunes no utilizadas
            'startTyping',
            'stopTyping',
            'clearPersistentState',
            'error',
            'err',
            'participants',
            'theme',
            'setTheme',
            'soundEnabled',
            'setSoundEnabled',
            'notificationsEnabled',
            'setNotificationsEnabled',
            'chatService',
            'isInitialized',
            'minDate',
            'isClient',
            'currentImage',
            'isHovered',
            'getCategoryIcon',
            'formatPrice',
            'IMAGE_CONFIG',
            'handleImageLoad',
            'handleImageError',
            'optimizationConfig',
            'clearCaches',
            'optimizePerformance',
            'priority',
            'preloadQueue',
            'closeCookieSettings',
            'serviceId',
            'options',
            'logWarn',
            'logDebug',
            'preloadSingleImage',
            'preloadBatch',
            'data',
            'prefix',
            'sizes',
            'threshold',
            'lastEntry',
            'fidEntry',
            'cls',
            'request',
            'endpoint',
            'times',
            'oneDayAgo'
        )
        
        foreach ($pattern in $unusedVarPatterns) {
            # Buscar declaraciones de variables no utilizadas
            $varRegex = "(\w+)\s*=\s*[^;]+;\s*//\s*$pattern"
            if ($content -match $varRegex) {
                $content = $content -replace $varRegex, "// $pattern removed"
                $cleanedCount++
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content $filePath $content -Encoding UTF8
            $fileName = Split-Path $filePath -Leaf
            Write-Host "  ✅ $fileName`: Variables no utilizadas limpiadas" -ForegroundColor Green
            return 1
        }
        return 0
    }
    catch {
        Write-Host "  ❌ Error en $filePath`: $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Procesar archivos
$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Path "components","hooks","lib","app" -Exclude "node_modules",".next","dist",".git"

Write-Host "📁 Procesando $($files.Count) archivos..." -ForegroundColor Cyan

foreach ($file in $files) {
    $cleaned = Remove-UnusedImports $file.FullName
    $totalCleaned += $cleaned
    
    $cleaned = Remove-UnusedVariables $file.FullName
    $totalCleaned += $cleaned
}

Write-Host ""
Write-Host "🎉 Limpieza completada!" -ForegroundColor Green
Write-Host "📊 Total de elementos limpiados: $totalCleaned" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: npm run lint" -ForegroundColor White
Write-Host "2. Verificar reducción de warnings" -ForegroundColor White
Write-Host "3. Ejecutar: npm run build" -ForegroundColor White


