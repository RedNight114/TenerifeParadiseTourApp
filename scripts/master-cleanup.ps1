# Script maestro para limpieza completa del proyecto
Write-Host "INICIANDO LIMPIEZA COMPLETA DEL PROYECTO" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Magenta
Write-Host ""

# Paso 1: Corregir errores críticos
Write-Host "PASO 1: Corrigiendo errores críticos..." -ForegroundColor Yellow
& "$PSScriptRoot\fix-critical-errors.ps1"

Write-Host ""
Write-Host "Esperando 2 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Paso 2: Limpiar variables no utilizadas
Write-Host ""
Write-Host "PASO 2: Limpiando variables no utilizadas..." -ForegroundColor Yellow
& "$PSScriptRoot\cleanup-unused-vars.ps1"

Write-Host ""
Write-Host "Esperando 2 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Paso 3: Verificar estado actual
Write-Host ""
Write-Host "PASO 3: Verificando estado actual..." -ForegroundColor Yellow
Write-Host "Ejecutando npm run lint..." -ForegroundColor Cyan

try {
    $lintResult = npm run lint 2>&1
    Write-Host "Linting completado" -ForegroundColor Green
    
    # Extraer estadísticas del resultado
    if ($lintResult -match "(\d+) problems \((\d+) errors, (\d+) warnings\)") {
        $totalProblems = $matches[1]
        $totalErrors = $matches[2]
        $totalWarnings = $matches[3]
        
        Write-Host ""
        Write-Host "ESTADISTICAS FINALES:" -ForegroundColor Green
        Write-Host "   Total problemas: $totalProblems" -ForegroundColor White
        Write-Host "   Errores: $totalErrors" -ForegroundColor Red
        Write-Host "   Warnings: $totalWarnings" -ForegroundColor Yellow
        Write-Host ""
        
        # Calcular mejora
        $initialProblems = 975
        $improvement = $initialProblems - $totalProblems
        $improvementPercent = [math]::Round(($improvement / $initialProblems) * 100, 1)
        
        Write-Host "MEJORA ALCANZADA:" -ForegroundColor Green
        Write-Host "   Problemas resueltos: $improvement" -ForegroundColor White
        Write-Host "   Mejora: $improvementPercent%" -ForegroundColor White
        Write-Host ""
        
        if ($totalErrors -eq 0) {
            Write-Host "EXCELENTE! No hay errores críticos" -ForegroundColor Green
            Write-Host "   El proyecto debería poder hacer build" -ForegroundColor White
        } else {
            Write-Host "Aún hay $totalErrors errores por resolver manualmente" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "No se pudieron extraer las estadísticas del linting" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error ejecutando linting: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROXIMOS PASOS RECOMENDADOS:" -ForegroundColor Yellow
Write-Host "1. Revisar errores restantes manualmente si los hay" -ForegroundColor White
Write-Host "2. Ejecutar: npm run build" -ForegroundColor White
Write-Host "3. Probar funcionalidad básica" -ForegroundColor White
Write-Host "4. Ejecutar tests si existen" -ForegroundColor White
Write-Host ""
Write-Host "OBJETIVO: Reducir problemas de 975 a menos de 200" -ForegroundColor Magenta
Write-Host ""
Write-Host "LIMPIEZA COMPLETADA!" -ForegroundColor Green
