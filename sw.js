// Guarda la app en el teléfono para que abra sin señal.
const CACHE = 'hacienda-v1';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // las llamadas a Google van directo
  // Primero la red (para recibir mejoras), si no hay señal, lo guardado
  // (con señal débil no esperamos más de 4 segundos)
  const red = Promise.race([fetch(e.request), new Promise((_, no) => setTimeout(() => no(new Error('lento')), 4000))]);
  e.respondWith(
    red.then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
