/* Service Worker：讓簡報在現場網路不穩時也能打開，並在有新版時通知頁面提示重新整理。
 * BUILD_VERSION 由部署流程（.github/stamp_version.py）蓋章，每次部署內容都不同，瀏覽器才會偵測到新版。
 * install 不呼叫 skipWaiting：新版會停在 waiting，等使用者在頁面按「重新整理載入」才套用，簡報進行中不會被突然換頁。 */
const BUILD_VERSION = '__BUILD_VERSION__';
const CACHE = 'moda-akai-v-' + BUILD_VERSION;
const CDN_CACHE = 'moda-akai-cdn'; // 第三方函式庫與字型：跨版本保留，換版不清掉
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const V = '?v=' + BUILD_VERSION;

const PRECACHE = [
  './',
  'css/deck.css' + V,
  'js/motion.js' + V,
  'js/opening.js' + V,
  'js/deck.js' + V,
  'js/sw-register.js' + V,
  'favicon.svg',
  'apple-touch-icon.png',
  'manifest.webmanifest',
  'media/opening-poster.jpg',
  'images/shot-home.jpg',
  'images/shot-finder.jpg',
  'images/shot-tool.jpg',
  'images/shot-blog.jpg',
  'images/shot-mobile.jpg',
  'images/shot-prompt.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('moda-akai-v-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: BUILD_VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }

  // 影片不經過 Service Worker（瀏覽器用 Range 分段讀取，快取不好處理）
  if (req.headers.has('range') || /\.(mp4|webm)$/i.test(url.pathname)) return;

  // 第三方函式庫與字型：有快取先用、背景更新（現場沒網路時簡報仍能載入）
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CDN_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // 版本檔永遠向伺服器要最新的
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
    return;
  }

  // 頁面本身：網路優先（不吃瀏覽器 10 分鐘快取），離線才用留存的
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./')))
    );
    return;
  }

  // 其他同源檔案：網址帶版本號的內容不會變，有快取就直接用；沒有再下載並留存
  event.respondWith(caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }));
  }));
});
