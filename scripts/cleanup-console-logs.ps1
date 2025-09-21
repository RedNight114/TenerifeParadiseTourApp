# Script de PowerShell para eliminar console.log
Write-Host "🧹 Eliminando console.log de todos los archivos..." -ForegroundColor Green

$totalRemoved = 0

# Función para eliminar console.log de un archivo
function Remove-ConsoleLogs {
    param([string]$filePath)
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $removedCount = 0
        
        # Patrones para eliminar
        $patterns = @(
            'console\.log\(',
            'console\.warn\(',
            'console\.error\(',
            'console\.info\(',
            'console\.debug\('
        )
        
        foreach ($pattern in $patterns) {
            $beforeCount = ([regex]::Matches($content, $pattern)).Count
            if ($beforeCount -gt 0) {
                $regex = '\s*' + $pattern + '[^)]*\);?\s*\r?\n?'
                $content = $content -replace $regex, "`n"
                $removedCount += $beforeCount
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content $filePath $content -Encoding UTF8
            $fileName = Split-Path $filePath -Leaf
            Write-Host "  ✅ $fileName`: $removedCount console statements eliminados" -ForegroundColor Green
            return $removedCount
        }
        return 0
    }
    catch {
        Write-Host "  ❌ Error en $filePath`: $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Procesar archivos
$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -Path "components","hooks","lib","app" -Exclude "node_modules",".next","dist",".git"

foreach ($file in $files) {
    $removed = Remove-ConsoleLogs $file.FullName
    $totalRemoved += $removed
}

Write-Host ""
Write-Host "🧹 Limpieza completada!" -ForegroundColor Green
Write-Host "📊 Total de console statements eliminados: $totalRemoved" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: npm run lint" -ForegroundColor White
Write-Host "2. Verificar que se redujeron los warnings" -ForegroundColor White
Write-Host "3. Ejecutar: npm run build" -ForegroundColor White



