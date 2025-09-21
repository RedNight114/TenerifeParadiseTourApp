/**
 * Service Worker para Tenerife Paradise Tours
 * Implementa caché inteligente y funcionalidad offline
 */

const CACHE_NAME = 'tenerife-paradise-tours-v1.0.0';
const STATIC_CACHE_NAME = 'tenerife-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'tenerife-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'tenerife-images-v1.0.0';

// Recursos estáticos críticos
const STATIC_ASSETS = [
  '/',
  '/services',
  '/about',
  '/contact',
  '/favicon.ico',
  '/manifest.json',
  '/images/placeholder.jpg',
  '/images/error.jpg'
];

// Recursos dinámicos que se cachean
const DYNAMIC_PATTERNS = [
  /^\/api\/services/,
  /^\/api\/categories/,
  /^\/api\/reservations/,
  /^\/services\/[^\/]+$/,
  /^\/booking\/[^\/]+$/
];

// Patrones de imágenes que se cachean
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|webp|avif)$/,
  /vercel-storage\.com/,
  /supabase\.co.*\.jpg/
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cachear recursos estáticos
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cachear recursos dinámicos críticos
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('🔄 Cacheando recursos dinámicos...');
        return Promise.resolve();
      }),
      
      // Cachear imágenes
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        console.log('🖼️ Cacheando imágenes...');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('✅ Service Worker: Instalación completada');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control de todos los clientes
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activación completada');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategia para recursos estáticos
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Estrategia para imágenes
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(request.url))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback para imágenes
          return caches.match('/images/placeholder.jpg');
        });
      })
    );
    return;
  }
  
  // Estrategia para APIs dinámicas
  if (DYNAMIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Devolver desde cache y actualizar en background
          fetch(request).then((freshResponse) => {
            if (freshResponse.status === 200) {
              const responseClone = freshResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          }).catch(() => {
            // Ignorar errores de actualización en background
          });
          
          return response;
        }
        
        // Si no está en cache, hacer fetch
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback para APIs
          return new Response(
            JSON.stringify({ 
              error: 'Sin conexión', 
              message: 'No se pudo conectar al servidor' 
            }),
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        });
      })
    );
    return;
  }
  
  // Estrategia por defecto: Network First
  event.respondWith(
    fetch(request).then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        // Fallback para páginas
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
        
        return new Response('Sin conexión', { status: 503 });
      });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => 
            caches.open(cacheName).then((cache) => 
              cache.keys().then((keys) => ({ name: cacheName, count: keys.length }))
            )
          )
        );
      }).then((sizes) => {
        event.ports[0].postMessage({ sizes });
      });
      break;
      
    case 'PRELOAD_RESOURCES':
      const { resources } = payload;
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return Promise.all(
          resources.map((resource) => 
            fetch(resource).then((response) => {
              if (response.status === 200) {
                cache.put(resource, response);
              }
            }).catch(() => {
              // Ignorar errores de precarga
            })
          )
        );
      });
      break;
  }
});

// Limpiar cache periódicamente
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
          // Limpiar entradas antiguas (más de 7 días)
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          
          keys.forEach((key) => {
            cache.match(key).then((response) => {
              if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                  const responseDate = new Date(dateHeader).getTime();
                  if (responseDate < weekAgo) {
                    cache.delete(key);
                  }
                }
              }
            });
          });
        });
      });
    });
  });
}, 24 * 60 * 60 * 1000); // Cada 24 horas

console.log('🔧 Service Worker: Cargado y listo');


