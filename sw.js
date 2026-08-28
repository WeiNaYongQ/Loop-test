/* ═══════════ sw.js — service worker: offline cache of the app shell ═══════════
   ⚠️ DEV RULE: whenever you change ANY file, bump the version below
   (loop-v1 → loop-v2). Otherwise users keep seeing the old cached copy. */

const CACHE = 'loop-v2';

const ASSETS = [
  './', './index.html', './stats.html',
  './css/base.css', './css/app.css', './css/site.css', './css/stats.css', './css/theme.css',
  './js/storage.js', './js/habits.js', './js/fx.js', './js/timer.js', './js/extras.js',
  './js/app.js', './js/stats.js', './js/report.js', './js/settings.js', './js/pwa.js',
  './manifest.json', './icons/icon.svg', './css/mobile.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(new URL(e.request.url).origin !== location.origin) return;   // let fonts etc. hit the network

  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
