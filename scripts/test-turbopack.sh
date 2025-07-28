#!/bin/bash
echo "🧪 Probando Turbopack..."

# Hacer backup de la configuración actual
cp next.config.mjs next.config.backup.mjs

# Usar configuración de prueba
cp next.config.turbo.mjs next.config.mjs

# Limpiar caché
rm -rf .next

# Probar Turbopack
echo "🚀 Iniciando servidor con Turbopack..."
timeout 30s npm run dev:turbo || echo "⏰ Timeout alcanzado"

# Restaurar configuración original
cp next.config.backup.mjs next.config.mjs

echo "✅ Prueba completada"
