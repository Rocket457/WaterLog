const CACHE_NAME = 'waterlog-v1.0.0';
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/socket.io/socket.io.js'
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna o cache se disponível, senão faz a requisição
        return response || fetch(event.request);
      })
  );
});

// Recebimento de mensagens push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  let notificationData = {
    title: 'WaterLog',
    body: 'Você tem uma nova notificação!',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cpath fill="%233794ff" d="M32 4C32 4 12 28 12 42c0 11 9 18 20 18s20-7 20-18C52 28 32 4 32 4z"/%3E%3Cellipse fill="%23b3e0ff" cx="32" cy="46" rx="10" ry="6"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cpath fill="%233794ff" d="M32 4C32 4 12 28 12 42c0 11 9 18 20 18s20-7 20-18C52 28 32 4 32 4z"/%3E%3Cellipse fill="%23b3e0ff" cx="32" cy="46" rx="10" ry="6"/%3E%3C/svg%3E',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.log('Erro ao parsear dados da notificação:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Recebimento de mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida no SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 