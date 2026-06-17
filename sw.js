/**
 * sw.js — Service Worker Winas Translation
 * Strategi: cache-first untuk shell (HTML/CSS/JS), network-only untuk API.
 */

const CACHE = 'winas-v1';

// File yang di-cache saat install (app shell)
const SHELL = [
  './',
  './styles.css',
  './layout.css',
  './reader.css',
  './overlays.css',
  './data.js',
  './tweaks-panel.jsx',
  './components.jsx',
  './sections-top.jsx',
  './sections-continue.jsx',
  './sections-bottom.jsx',
  './sections-reader.jsx',
  './sections-library.jsx',
  './sections-overlays.jsx',
  './sections-guard.jsx',
  './app.jsx',
  './manifest.json',
  // Aset karakter
  './assets/ryou.png',
  './assets/himori.png',
];

// ── Install: cache shell ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: hapus cache lama ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-only untuk API, cache-first untuk yang lain ──
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Lewati request non-GET
  if (request.method !== 'GET') return;

  // API calls & CDN (React, Babel, fonts): langsung ke network
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname !== location.hostname
  ) return;

  // Cache-first untuk static assets
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        // Simpan salinan ke cache kalau respons OK
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      }).catch(() => cached); // fallback ke cache kalau offline
    })
  );
});
