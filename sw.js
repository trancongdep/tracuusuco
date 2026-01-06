// --- CẤU HÌNH PHIÊN BẢN ---
// KHI CÓ SỬA ĐỔI CODE WEB, HÃY TĂNG SỐ PHIÊN BẢN Ở DÒNG DƯỚI ĐỂ APP TỰ CẬP NHẬT
const CACHE_NAME = 'luoi-dien-cache-v1.19'; 

const urlsToCache = [
  './index.html',
  './manifest.json',
  // Các thư viện bên ngoài (Leaflet, FontAwesome) thường không cache được do chính sách CORS
  // nên ta chỉ cache file nội bộ. Trình duyệt sẽ tự lo phần còn lại.
];

// 1. Cài đặt Service Worker
self.addEventListener('install', event => {
  // Buộc SW mới kích hoạt ngay lập tức, bỏ qua trạng thái chờ
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Kích hoạt và Xóa Cache cũ (Cơ chế tự động cập nhật)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Nếu tên cache không trùng với phiên bản hiện tại -> Xóa nó đi
          if (cacheName !== CACHE_NAME) {
            console.log('Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // Chiếm quyền điều khiển các client ngay lập tức
        return self.clients.claim();
    })
  );
});

// 3. Chiến lược Network First (Ưu tiên mạng, mất mạng mới dùng Cache)
// Điều này đảm bảo dữ liệu Firebase và Code luôn mới nhất nếu có mạng.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
