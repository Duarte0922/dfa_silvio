const CACHE_NAME = 'dfa-vidros-v1';
const ASSETS = [
  'vidracaria-app.html',
  'manifest.json',
  'icons/icon-cliente-192.png',
  'icons/icon-cliente-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Só intercepta pedidos GET pro próprio domínio (o shell do app).
  // Firebase (websocket), Nominatim e OSRM (outro domínio) passam direto
  // pra rede, sem cache — pra nunca servir dado de pedido desatualizado.
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
