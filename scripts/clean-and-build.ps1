# Script de limpieza y reconstrucción para Next.js
# Previene errores 404 en archivos estáticos

Write-Host "Limpiando proyecto..." -ForegroundColor Yellow

# Limpiar directorios de build
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "Directorio .next eliminado" -ForegroundColor Green
}

if (Test-Path "out") {
    Remove-Item -Recurse -Force "out" -ErrorAction SilentlyContinue
    Write-Host "Directorio out eliminado" -ForegroundColor Green
}

# Limpiar caché de npm
Write-Host "Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

# Limpiar node_modules (opcional, descomenta si hay problemas)
# if (Test-Path "node_modules") {
#     Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
#     Write-Host "node_modules eliminado" -ForegroundColor Green
#     Write-Host "Reinstalando dependencias..." -ForegroundColor Blue
#     npm install
# }

# Verificar dependencias
Write-Host "Verificando dependencias..." -ForegroundColor Blue
npm audit fix --force

# Build del proyecto
Write-Host "Iniciando build..." -ForegroundColor Green
npm run build

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Si sigues teniendo errores 404, ejecuta: npm run dev" -ForegroundColor Cyan
