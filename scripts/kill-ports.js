#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔪 CERRANDO PROCESOS EN PUERTOS 3000, 3001, 3002');
console.log('================================================\n');

const ports = [3000, 3001, 3002];

function killProcessOnPort(port) {
  try {
    console.log(`🔍 Buscando procesos en puerto ${port}...`);
    
    // En Windows, usar netstat para encontrar procesos
    const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    
    if (netstatOutput.trim()) {
      console.log(`📋 Procesos encontrados en puerto ${port}:`);
      console.log(netstatOutput);
      
      // Extraer PIDs de la salida de netstat
      const lines = netstatOutput.split('\n').filter(line => line.trim());
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      });
      
      // Matar cada proceso
      pids.forEach(pid => {
        try {
          console.log(`💀 Matando proceso PID: ${pid}`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
          console.log(`✅ Proceso ${pid} terminado`);
        } catch (error) {
          console.log(`⚠️ Error al matar proceso ${pid}:`, error.message);
        }
      });
      
      return pids.size;
    } else {
      console.log(`✅ No hay procesos en puerto ${port}`);
      return 0;
    }
    
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log(`✅ No hay procesos en puerto ${port}`);
      return 0;
    } else {
      console.log(`❌ Error al buscar procesos en puerto ${port}:`, error.message);
      return 0;
    }
  }
}

function main() {
  let totalKilled = 0;
  
  ports.forEach(port => {
    console.log(`\n--- PUERTO ${port} ---`);
    const killed = killProcessOnPort(port);
    totalKilled += killed;
  });
  
  console.log('\n📊 RESUMEN:');
  console.log('===========');
  console.log(`Total de procesos terminados: ${totalKilled}`);
  
  if (totalKilled > 0) {
    console.log('\n🎉 ¡Puertos liberados!');
    console.log('Ahora puedes ejecutar: npm run dev');
  } else {
    console.log('\nℹ️ No se encontraron procesos para terminar');
  }
  
  console.log('\n🏁 Operación completada');
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = { killProcessOnPort }; 