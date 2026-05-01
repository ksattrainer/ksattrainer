// 수만훈 PWA Service Worker
// 이 파일은 PWA 설치 가능 조건을 만족시키기 위해 필요합니다.

const CACHE_NAME = 'sumanhun-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 설치 시 - 정적 자산 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 활성화 시 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[SW] 활성화됨');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// fetch 시 - 캐시 우선 (PWA 자체 파일만)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GAS 사이트 요청은 항상 네트워크에서 가져옴 (캐시 안 함)
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleusercontent.com')) {
    return;
  }

  // 그 외 PWA 자체 파일은 캐시 우선
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('./index.html'))
  );
});
