const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo problemas de SSR con sonner...\n');

// Archivos que usan sonner
const filesToFix = [
  'components/admin/services-management-simple.tsx',
  'components/stripe/ServicePayment.tsx',
  'components/admin/PendingReservations.tsx',
  'components/stripe/CheckoutForm.tsx',
  'components/admin/integrated-age-pricing.tsx',
  'components/auth/login-redirect.tsx'
];

let fixedCount = 0;

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Reemplazar import de sonner
      if (content.includes("import { toast } from 'sonner'")) {
        content = content.replace(
          "import { toast } from 'sonner'",
          `// Importación dinámica de sonner para evitar problemas de SSR
let toast: any = null
if (typeof window !== 'undefined') {
  import('sonner').then(({ toast: toastImport }) => {
    toast = toastImport
  })
}

// Función helper para manejar toasts de manera segura
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (typeof window !== 'undefined' && toast) {
    toast[type](message)
  } else {
    // Fallback para SSR - solo log en consola
    console.log(\`\${type.toUpperCase()}: \${message}\`)
  }
}`
        );
        modified = true;
      }

      // Reemplazar llamadas a toast.error
      if (content.includes('toast.error(')) {
        content = content.replace(/toast\.error\(/g, "showToast('error', ");
        modified = true;
      }

      // Reemplazar llamadas a toast.success
      if (content.includes('toast.success(')) {
        content = content.replace(/toast\.success\(/g, "showToast('success', ");
        modified = true;
      }

      // Reemplazar llamadas a toast.info
      if (content.includes('toast.info(')) {
        content = content.replace(/toast\.info\(/g, "showToast('info', ");
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✅ ${file} - Corregido`);
        fixedCount++;
      } else {
        console.log(`ℹ️ ${file} - No necesita corrección`);
      }

    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
    }
  } else {
    console.log(`❌ ${file} - Archivo no encontrado`);
  }
});

console.log(`\n🎉 Proceso completado. ${fixedCount} archivos corregidos.`);
