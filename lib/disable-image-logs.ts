// Archivo para deshabilitar completamente los logs de imágenes
// Esto evita el spam en la consola del navegador

// Deshabilitar console.log para imágenes
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

// Función para filtrar mensajes de imágenes
function shouldBlockImageLog(message: string): boolean {
  const blockedPatterns = [
    'Imagen precargada',
    'Precarga de imágenes completada',
    'Imagen individual cargada',
    'Procesando imagen',
    'Imagen ya está en el tamaño correcto',
    'Compresión exitosa',
    'Compresión limitada',
    'Iteración',
    'Timeout cargando imagen',
    'Error precargando imagen',
    'Error cargando imagen individual',
    'Error comprimiendo imagen',
    'Error en compresión múltiple',
    'Error en precarga inteligente'
  ];

  return blockedPatterns.some(pattern => 
    message.includes(pattern) || 
    message.toLowerCase().includes('imagen') ||
    message.toLowerCase().includes('precarga') ||
    message.toLowerCase().includes('compresión')
  );
}

// Sobrescribir console.log para bloquear logs de imágenes
console.log = function(...args: any[]) {
  const message = args[0]?.toString() || '';
  if (!shouldBlockImageLog(message)) {
    originalConsoleLog.apply(console, args);
  }
};

// Sobrescribir console.info para bloquear logs de imágenes
console.info = function(...args: any[]) {
  const message = args[0]?.toString() || '';
  if (!shouldBlockImageLog(message)) {
    originalConsoleInfo.apply(console, args);
  }
};

// Sobrescribir console.debug para bloquear logs de imágenes
console.debug = function(...args: any[]) {
  const message = args[0]?.toString() || '';
  if (!shouldBlockImageLog(message)) {
    originalConsoleDebug.apply(console, args);
  }
};

// Función para restaurar console original si es necesario
export function restoreConsole() {
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
  console.debug = originalConsoleDebug;
}

// Función para verificar si los logs están bloqueados
export function areImageLogsBlocked(): boolean {
  return console.log !== originalConsoleLog;
}

// Función para habilitar logs de imágenes específicos (solo para debugging)
export function enableImageLogs() {
  restoreConsole();
}

// Función para deshabilitar logs de imágenes
export function disableImageLogs() {
  // Los logs ya están deshabilitados por defecto
}

// Configuración automática
if (typeof window !== 'undefined') {
  // Solo en el navegador
}

export default {
  restoreConsole,
  areImageLogsBlocked,
  enableImageLogs,
  disableImageLogs
};








