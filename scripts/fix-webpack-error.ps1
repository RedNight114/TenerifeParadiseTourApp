Write-Host "🔧 Iniciando corrección del error de webpack..." -ForegroundColor Green
Write-Host ""

# 1. Limpiar directorios de build
Write-Host "📁 Limpiando directorios de build..." -ForegroundColor Yellow
$dirsToClean = @('.next', 'node_modules\.cache', 'out', 'dist')

foreach ($dir in $dirsToClean) {
    $dirPath = Join-Path $PWD $dir
    if (Test-Path $dirPath) {
        try {
            Remove-Item $dirPath -Recurse -Force
            Write-Host "✅ $dir eliminado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Error eliminando $dir`: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️ $dir no existe" -ForegroundColor Gray
    }
}

# 2. Limpiar archivos de lock
Write-Host ""
Write-Host "🔒 Limpiando archivos de lock..." -ForegroundColor Yellow
$lockFiles = @('package-lock.json', 'yarn.lock', 'pnpm-lock.yaml')

foreach ($lockFile in $lockFiles) {
    $lockPath = Join-Path $PWD $lockFile
    if (Test-Path $lockPath) {
        try {
            Remove-Item $lockPath -Force
            Write-Host "✅ $lockFile eliminado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Error eliminando $lockFile`: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 3. Verificar package.json
Write-Host ""
Write-Host "📦 Verificando package.json..." -ForegroundColor Yellow
$packagePath = Join-Path $PWD 'package.json'
if (Test-Path $packagePath) {
    try {
        $packageJson = Get-Content $packagePath | ConvertFrom-Json
        
        # Verificar dependencias críticas
        $criticalDeps = @('next', 'react', 'react-dom')
        $missingDeps = @()
        
        foreach ($dep in $criticalDeps) {
            if (-not $packageJson.dependencies.$dep) {
                $missingDeps += $dep
            }
        }
        
        if ($missingDeps.Count -gt 0) {
            Write-Host "⚠️ Dependencias faltantes: $($missingDeps -join ', ')" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Todas las dependencias críticas están presentes" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Error leyendo package.json: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Reinstalar dependencias
Write-Host ""
Write-Host "📥 Reinstalando dependencias..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias reinstaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error reinstalando dependencias: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Verificar configuración de Next.js
Write-Host ""
Write-Host "⚙️ Verificando configuración de Next.js..." -ForegroundColor Yellow
$nextConfigPath = Join-Path $PWD 'next.config.mjs'
if (Test-Path $nextConfigPath) {
    Write-Host "✅ next.config.mjs presente" -ForegroundColor Green
    
    # Verificar contenido básico
    $configContent = Get-Content $nextConfigPath -Raw
    if ($configContent -match 'webpack' -and $configContent -match 'resolve\.fallback') {
        Write-Host "✅ Configuración de webpack detectada" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Configuración de webpack no encontrada" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ next.config.mjs no encontrado" -ForegroundColor Red
}

# 6. Verificar archivos críticos
Write-Host ""
Write-Host "🔍 Verificando archivos críticos..." -ForegroundColor Yellow
$criticalFiles = @(
    'app\layout.tsx',
    'components\hydration-safe.tsx',
    'lib\supabase-optimized.ts'
)

foreach ($file in $criticalFiles) {
    $filePath = Join-Path $PWD $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file presente" -ForegroundColor Green
    } else {
        Write-Host "❌ $file faltante" -ForegroundColor Red
    }
}

# 7. Limpiar logs
Write-Host ""
Write-Host "📝 Limpiando logs..." -ForegroundColor Yellow
$logFiles = @('npm-debug.log', 'yarn-error.log', 'pnpm-debug.log')

foreach ($logFile in $logFiles) {
    $logPath = Join-Path $PWD $logFile
    if (Test-Path $logPath) {
        try {
            Remove-Item $logPath -Force
            Write-Host "✅ $logFile eliminado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Error eliminando $logFile`: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 8. Verificar variables de entorno
Write-Host ""
Write-Host "🌍 Verificando variables de entorno..." -ForegroundColor Yellow
$envFiles = @('.env.local', '.env.development', '.env')

foreach ($envFile in $envFiles) {
    $envPath = Join-Path $PWD $envFile
    if (Test-Path $envPath) {
        Write-Host "✅ $envFile presente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $envFile no encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 RECOMENDACIONES POST-FIX:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "1. Reiniciar el servidor: npm run dev" -ForegroundColor White
Write-Host "2. Limpiar caché del navegador (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Probar en ventana de incógnito" -ForegroundColor White
Write-Host "4. Verificar que no hay errores de webpack" -ForegroundColor White
Write-Host "5. Comprobar que la hidratación funciona correctamente" -ForegroundColor White
Write-Host "6. Si el error persiste, revisar la consola del navegador" -ForegroundColor White

Write-Host ""
Write-Host "✅ Corrección completada. Ejecuta 'npm run dev' para reiniciar el servidor." -ForegroundColor Green 