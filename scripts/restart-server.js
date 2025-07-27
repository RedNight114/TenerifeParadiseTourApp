const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 REINICIANDO SERVIDOR DE DESARROLLO');
console.log('=====================================\n');

// Función para ejecutar comandos
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Ejecutando: ${command}`);
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ejecutando ${command}:`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️  Advertencia: ${stderr}`);
      }
      if (stdout) {
        console.log(`✅ Resultado: ${stdout.trim()}`);
      }
      resolve(stdout);
    });
  });
}

// Función para verificar si el puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve(false); // Puerto no en uso
      } else {
        resolve(true); // Puerto en uso
      }
    });
  });
}

// Función para matar procesos en un puerto
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        console.log(`✅ Puerto ${port} no está en uso`);
        resolve();
        return;
      }
      
      // Extraer PID del proceso
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          pids.add(match[1]);
        }
      });
      
      if (pids.size === 0) {
        console.log(`✅ No se encontraron procesos en el puerto ${port}`);
        resolve();
        return;
      }
      
      console.log(`🔍 Encontrados ${pids.size} proceso(s) en el puerto ${port}`);
      
      // Matar cada proceso
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolveKill) => {
          console.log(`🔄 Matando proceso PID: ${pid}`);
          exec(`taskkill /F /PID ${pid}`, (error) => {
            if (error) {
              console.warn(`⚠️  No se pudo matar el proceso ${pid}: ${error.message}`);
            } else {
              console.log(`✅ Proceso ${pid} terminado`);
            }
            resolveKill();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        console.log(`✅ Todos los procesos en el puerto ${port} han sido terminados`);
        resolve();
      });
    });
  });
}

async function restartServer() {
  try {
    console.log('🔍 Verificando estado actual...');
    
    // Verificar si el puerto 3000 está en uso
    const portInUse = await checkPort(3000);
    if (portInUse) {
      console.log('⚠️  Puerto 3000 está en uso, terminando procesos...');
      await killProcessOnPort(3000);
      
      // Esperar un momento para que los procesos se terminen completamente
      console.log('⏳ Esperando que los procesos se terminen...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('✅ Puerto 3000 no está en uso');
    }
    
    // Limpiar caché de Next.js
    console.log('🧹 Limpiando caché de Next.js...');
    try {
      await runCommand('rmdir /s /q .next');
      console.log('✅ Caché de Next.js limpiado');
    } catch (error) {
      console.log('ℹ️  No se encontró caché para limpiar');
    }
    
    // Verificar que el archivo corregido existe
    const routeFile = path.join(__dirname, '..', 'app', 'api', 'payment', 'create', 'route.ts');
    if (!fs.existsSync(routeFile)) {
      throw new Error('Archivo de ruta de pago no encontrado');
    }
    
    console.log('✅ Archivo de ruta de pago encontrado');
    
    // Verificar que las variables de entorno estén configuradas
    const envFile = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envFile)) {
      throw new Error('Archivo .env no encontrado');
    }
    
    console.log('✅ Archivo .env encontrado');
    
    // Iniciar el servidor de desarrollo
    console.log('🚀 Iniciando servidor de desarrollo...');
    console.log('📝 El servidor se iniciará en segundo plano');
    console.log('🌐 URL: http://localhost:3000');
    console.log('📊 Para ver los logs, revisa la consola del navegador o los logs del servidor\n');
    
    // Iniciar el servidor en segundo plano
    const serverProcess = exec('npm run dev', { 
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    });
    
    // Dar tiempo para que el servidor se inicie
    console.log('⏳ Esperando que el servidor se inicie...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar que el servidor esté funcionando
    const serverRunning = await checkPort(3000);
    if (serverRunning) {
      console.log('✅ Servidor iniciado exitosamente en el puerto 3000');
      console.log('🎯 El servidor está listo para procesar pagos con la configuración corregida');
    } else {
      console.log('⚠️  El servidor podría no haberse iniciado correctamente');
      console.log('💡 Verifica manualmente ejecutando: npm run dev');
    }
    
    console.log('\n🎯 INSTRUCCIONES:');
    console.log('==================');
    console.log('1. Abre http://localhost:3000 en tu navegador');
    console.log('2. Intenta crear una nueva reserva');
    console.log('3. El sistema de pago debería funcionar sin errores de firma');
    console.log('4. Si hay problemas, revisa los logs del servidor');
    
  } catch (error) {
    console.error('❌ Error reiniciando el servidor:', error.message);
    console.log('\n💡 SOLUCIÓN MANUAL:');
    console.log('1. Detén manualmente el servidor (Ctrl+C)');
    console.log('2. Ejecuta: npm run dev');
    console.log('3. Prueba el sistema de pago');
  }
}

// Ejecutar el reinicio
restartServer(); 