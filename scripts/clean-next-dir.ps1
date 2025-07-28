Write-Host "Limpiando directorio .next..." -ForegroundColor Yellow

$nextDir = Join-Path $PWD '.next'

if (Test-Path $nextDir) {
    try {
        # Detener cualquier proceso que pueda estar usando archivos en .next
        Write-Host "Deteniendo procesos que usan .next..." -ForegroundColor Yellow
        
        # Forzar eliminación recursiva
        Remove-Item $nextDir -Recurse -Force -ErrorAction Stop
        Write-Host "Directorio .next eliminado completamente" -ForegroundColor Green
    } catch {
        Write-Host "Error eliminando .next: $($_.Exception.Message)" -ForegroundColor Red
        
        # Intentar método alternativo
        Write-Host "Intentando método alternativo..." -ForegroundColor Yellow
        try {
            # Usar robocopy para eliminar
            $tempDir = Join-Path $PWD 'temp_delete'
            robocopy $tempDir $nextDir /MIR /NFL /NDL /NJH /NJS /NC /NS /NP
            Remove-Item $nextDir -Recurse -Force
            Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Directorio .next eliminado con método alternativo" -ForegroundColor Green
        } catch {
            Write-Host "No se pudo eliminar .next. Por favor, eliminalo manualmente." -ForegroundColor Red
        }
    }
} else {
    Write-Host "Directorio .next no existe" -ForegroundColor Gray
}

Write-Host "Limpieza completada" -ForegroundColor Green 