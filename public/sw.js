const CACHE_NAME = 'acopio-v1';
const OFFLINE_CACHE = 'acopio-offline-v1';
const API_CACHE = 'acopio-api-v1';

// Recursos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/garita',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
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
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
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
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
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
    
    // Fallback a cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline si existe
    const offlinePage = await cache.match('/');
    if (offlinePage) {
      return offlinePage;
    }
    
    throw error;
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
});

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
