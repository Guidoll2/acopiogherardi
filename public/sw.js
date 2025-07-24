const CACHE_NAME = 'acopio-v2-offline-nav';
const OFFLINE_CACHE = 'acopio-offline-v2-nav';
const API_CACHE = 'acopio-api-v2-nav';

// Recursos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/dashboard/cereals',
  '/dashboard/clients',
  '/dashboard/drivers',
  '/dashboard/silos',
  '/dashboard/operations',
  '/dashboard/calendar',
  '/dashboard/offline-settings',
  '/dashboard/profile',
  '/dashboard/system-admin',
  '/garita',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Rutas dinámicas comunes a pre-cachear
const DYNAMIC_ROUTES = [
  '/dashboard/cereals/new',
  '/dashboard/clients/new',
  '/dashboard/drivers/new',
  '/dashboard/silos/new',
  '/dashboard/operations/new'
];

// Patrones de API para cachear
const API_CACHE_PATTERNS = [
  '/api/operations',
  '/api/clients',
  '/api/drivers',
  '/api/silos',
  '/api/cereals',
  '/api/companies',
  '/api/users'
];

// URLs que siempre deben ir a la red primero
const NETWORK_FIRST_PATTERNS = [
  '/api/auth/',
  '/api/setup-admin'
];

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cachear assets estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Pre-cachear rutas dinámicas comunes
      caches.open(OFFLINE_CACHE).then(async (cache) => {
        console.log('📦 Service Worker: Pre-caching dynamic routes');
        // Intentar cachear rutas dinámicas si están disponibles
        for (const route of DYNAMIC_ROUTES) {
          try {
            const response = await fetch(route);
            if (response.ok) {
              await cache.put(route, response);
              console.log('✅ Pre-cached:', route);
            }
          } catch (error) {
            console.log('⚠️ Could not pre-cache:', route);
          }
        }
      })
    ])
  );
  
  // Activar inmediatamente el nuevo service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches antiguos
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== API_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control de todas las páginas inmediatamente
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategia para diferentes tipos de requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Verificar si es un request de API
function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

// Verificar si es un asset estático
function isStaticAsset(pathname) {
  return pathname.includes('/_next/') || 
         pathname.includes('/static/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.ttf') ||
         pathname.endsWith('.eot') ||
         pathname.endsWith('.map') ||
         pathname.includes('/__next/') ||
         pathname.includes('/chunks/');
}

// Manejar requests de API
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Requests que siempre van a la red primero (auth, etc.)
  if (NETWORK_FIRST_PATTERNS.some(pattern => url.pathname.startsWith(pattern))) {
    return handleNetworkFirst(request);
  }
  
  // Para APIs de datos, usar estrategia network-first con fallback a cache
  if (API_CACHE_PATTERNS.some(pattern => url.pathname.startsWith(pattern))) {
    return handleNetworkFirstWithCache(request);
  }
  
  // Por defecto, intentar red
  return fetch(request);
}

// Estrategia Network First para requests críticos
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('🔌 Network failed for:', request.url);
    throw error;
  }
}

// Estrategia Network First con cache para APIs de datos
async function handleNetworkFirstWithCache(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request);
    
    // Si es exitoso y es un GET, cachear la respuesta
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔌 Network failed, trying cache for:', request.url);
    
    // Si falla la red, intentar cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📱 Serving from cache:', request.url);
      
      // Agregar header para indicar que viene del cache
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'cache');
      return response;
    }
    
    // Si no hay cache, devolver error offline
    return new Response(
      JSON.stringify({
        error: 'Sin conexión y sin datos en cache',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'service-worker-offline'
        }
      }
    );
  }
}

// Manejar assets estáticos
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Cache first para assets estáticos
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('🔌 Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Manejar páginas
async function handlePageRequest(request) {
  const cache = await caches.open(OFFLINE_CACHE);
  const url = new URL(request.url);
  
  try {
    // Intentar red primero para páginas
    const response = await fetch(request);
    
    // Cachear páginas exitosas
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🔌 Page request failed, trying cache:', request.url);
    
    // Fallback a cache exacto
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📱 Serving exact match from cache:', request.url);
      return cachedResponse;
    }
    
    // Fallback inteligente para rutas dinámicas del dashboard
    if (url.pathname.startsWith('/dashboard/')) {
      // Para rutas como /dashboard/cereals/[id], fallback a /dashboard/cereals
      const baseRoute = '/' + url.pathname.split('/').slice(1, 3).join('/');
      const baseResponse = await cache.match(baseRoute);
      if (baseResponse) {
        console.log('📱 Serving base route fallback:', baseRoute);
        return baseResponse;
      }
      
      // Último fallback: dashboard principal
      const dashboardResponse = await cache.match('/dashboard');
      if (dashboardResponse) {
        console.log('📱 Serving dashboard fallback for:', url.pathname);
        return dashboardResponse;
      }
    }
    
    // Fallback a página offline si existe (página principal)
    const offlinePage = await cache.match('/');
    if (offlinePage) {
      console.log('📱 Serving offline fallback for:', url.pathname);
      return offlinePage;
    }
    
    // Si todo falla, retornar página de error offline
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin Conexión - Acopio GH</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 30px; }
          .btn { background: #16a34a; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
          .btn:hover { background: #15803d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1>Sin Conexión</h1>
          <p>Esta página no está disponible offline. Verifica tu conexión a internet e intenta nuevamente.</p>
          <a href="/" class="btn">Ir al Inicio</a>
          <br><br>
          <a href="/dashboard" class="btn">Ir al Dashboard</a>
        </div>
        <script>
          // Auto-refresh cuando vuelva la conexión
          window.addEventListener('online', () => {
            window.location.reload();
          });
        </script>
      </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'X-Served-By': 'service-worker-offline-fallback'
      }
    });
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_API_DATA') {
    // Cachear datos importantes enviados desde el cliente
    cacheApiData(event.data.url, event.data.data);
  }
  
  if (event.data && event.data.type === 'CACHE_PAGE_VISIT') {
    // Cachear páginas que el usuario visita para navegación offline
    cachePageVisit(event.data.url);
  }
});

// Función para cachear páginas visitadas
async function cachePageVisit(url) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response.clone());
      console.log('📦 Cached visited page:', url);
    }
  } catch (error) {
    console.log('⚠️ Could not cache visited page:', url);
  }
}

// Función para cachear datos de API enviados desde el cliente
async function cacheApiData(url, data) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'X-Cached-At': new Date().toISOString()
    }
  });
  
  await cache.put(url, response);
  console.log('📦 Cached API data for:', url);
}

// Evento para sincronización en background (cuando vuelve la conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(performBackgroundSync());
  }
});

// Función de sincronización en background
async function performBackgroundSync() {
  try {
    // Enviar mensaje al cliente para que ejecute la sincronización
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

console.log('🎯 Service Worker loaded and ready!');
