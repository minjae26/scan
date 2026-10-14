/* 분류스캔 앱 실행 파일 (서비스 워커)
 * - 화면 파일은 항상 최신 버전을 먼저 받아옴 → GitHub에 올리면 모든 휴대폰에 자동 반영
 * - 인터넷이 잠깐 끊겨도 마지막 화면은 열리도록 저장해 둠
 * - 구글 시트와 주고받는 데이터(스캔 기록)는 저장하지 않음
 */
const CACHE = 'sortscan-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // 같은 사이트의 화면 파일만 처리 (구글 시트 요청·외부 라이브러리는 그대로 통과)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
