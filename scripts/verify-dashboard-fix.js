const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando corrección del dashboard...\n');

// Verificar que el archivo problemático fue eliminado
const problematicFile = 'components/admin/services-management.tsx';
if (fs.existsSync(problematicFile)) {
  console.log('❌ El archivo problemático aún existe:', problematicFile);
} else {
  console.log('✅ Archivo problemático eliminado correctamente');
}

// Verificar que el archivo simplificado existe
const simpleFile = 'components/admin/services-management-simple.tsx';
if (fs.existsSync(simpleFile)) {
  console.log('✅ Archivo simplificado existe:', simpleFile);
} else {
  console.log('❌ Archivo simplificado no encontrado:', simpleFile);
}

// Verificar que el dashboard usa el archivo correcto
const dashboardFile = 'app/admin/dashboard/page.tsx';
if (fs.existsSync(dashboardFile)) {
  const content = fs.readFileSync(dashboardFile, 'utf8');
  if (content.includes('services-management-simple')) {
    console.log('✅ Dashboard usa el componente simplificado');
  } else {
    console.log('❌ Dashboard no usa el componente simplificado');
  }
} else {
  console.log('❌ Dashboard no encontrado');
}

// Verificar otros componentes simplificados
const components = [
  'components/admin/reservations-management-simple.tsx',
  'components/chat/admin-chat-dashboard-simple.tsx',
  'components/admin/audit-dashboard-simple.tsx'
];

components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log('✅ Componente simplificado existe:', component);
  } else {
    console.log('❌ Componente simplificado no encontrado:', component);
  }
});

console.log('\n🎯 Verificación completada');
console.log('📝 Si todos los elementos están ✅, el dashboard debería funcionar sin errores');
