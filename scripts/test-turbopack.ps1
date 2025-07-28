Write-Host "🧪 Probando Turbopack..." -ForegroundColor Yellow

# Hacer backup de la configuración actual
if (Test-Path "next.config.mjs") {
    Copy-Item "next.config.mjs" "next.config.backup.mjs"
    Write-Host "✅ Backup creado" -ForegroundColor Green
}

# Usar configuración de prueba
if (Test-Path "next.config.turbo.mjs") {
    Copy-Item "next.config.turbo.mjs" "next.config.mjs"
    Write-Host "✅ Configuración de prueba aplicada" -ForegroundColor Green
}

# Limpiar caché
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "✅ Caché limpiado" -ForegroundColor Green
}

# Probar Turbopack
Write-Host "🚀 Iniciando servidor con Turbopack..." -ForegroundColor Cyan
try {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev:turbo" -NoNewWindow -Wait -TimeoutSec 30
} catch {
    Write-Host "⏰ Timeout alcanzado o error" -ForegroundColor Yellow
}

# Restaurar configuración original
if (Test-Path "next.config.backup.mjs") {
    Copy-Item "next.config.backup.mjs" "next.config.mjs"
    Write-Host "✅ Configuración original restaurada" -ForegroundColor Green
}

Write-Host "✅ Prueba completada" -ForegroundColor Green