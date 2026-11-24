/* G Planer – działanie offline.
 * Strona: najpierw internet (zawsze najnowsza wersja), bez internetu – kopia z pamięci.
 * Ikony i pliki aplikacji: z pamięci, odświeżane w tle.
 * Czcionki Google: z pamięci po pierwszym pobraniu.
 * GitHub (synchronizacja) i inne zewnętrzne adresy: nigdy nie są zapisywane.
 * Po zmianie TEGO pliku podbij CACHE_VERSION, żeby telefon pobrał nową wersję. */
const CACHE_VERSION = 'gplaner-v1';
const APP_CACHE = CACHE_VERSION + '-app';
const FONT_CACHE = 'gplaner-fonts';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/planer-mark.svg',
  './assets/ui-icons.svg',
  './assets/app-icons/apple-touch-icon.png',
  './assets/app-icons/favicon-32.png',
  './assets/app-icons/icon-192.png',
  './assets/app-icons/icon-512.png',
  './assets/icons/calendar.svg',
  './assets/icons/daily.svg',
  './assets/icons/general.svg',
  './assets/icons/home.svg',
  './assets/icons/list.svg',
  './assets/icons/matrix.svg',
  './assets/icons/notes.svg',
  './assets/icons/tasks.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => Promise.all(CORE.map(url =>
    cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== APP_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)); }

async function pageNetworkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await Promise.race([fetch(request), timeout(4000)]);
    if (response && response.ok) cache.put('./index.html', response.clone());
    return response;
  } catch (e) {
    return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return; // GitHub API itp. – zawsze na żywo
  if (request.mode === 'navigate') { event.respondWith(pageNetworkFirst(request)); return; }
  event.respondWith(staleWhileRevalidate(request, APP_CACHE));
});
