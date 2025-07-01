// ===== PWA FUNCTIONS =====

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registrado:', swRegistration);
            
            swRegistration.addEventListener('updatefound', () => {
                const newWorker = swRegistration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showPWAUpdatePrompt();
                    }
                });
            });
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    }
}

// Solicitar permissão de notificação
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('✅ Permissão de notificação concedida');
            await subscribeToPushNotifications();
        } else {
            console.log('❌ Permissão de notificação negada');
        }
    }
}

// Inscrever para notificações push
async function subscribeToPushNotifications() {
    if (!swRegistration) return;
    
    try {
        const response = await fetch('/api/vapid-public-key');
        const { publicKey } = await response.json();
        
        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });
        
        if (currentUser) {
            await fetch('/api/push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    subscription
                })
            });
        }
        
        console.log('✅ Inscrito para notificações push');
    } catch (error) {
        console.error('❌ Erro ao inscrever para notificações push:', error);
    }
}

// Mostrar prompt de instalação do PWA
function showPWAInstallPrompt() {
    if (deferredPrompt) {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-install-prompt show';
        prompt.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">
                    <i class="fas fa-download"></i>
                </div>
                <div class="pwa-install-text">
                    <div class="pwa-install-title">Instalar WaterLog</div>
                    <div class="pwa-install-description">Instale o app para receber notificações e usar offline</div>
                </div>
            </div>
            <div class="pwa-install-actions">
                <button class="btn-secondary" onclick="dismissPWAInstall()">Agora não</button>
                <button class="btn-primary" onclick="installPWA()">Instalar</button>
            </div>
        `;
        document.body.appendChild(prompt);
    }
}

// Instalar PWA
async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA install outcome:', outcome);
        deferredPrompt = null;
        dismissPWAInstall();
    }
}

// Dispensar prompt de instalação
function dismissPWAInstall() {
    const prompt = document.querySelector('.pwa-install-prompt');
    if (prompt) {
        prompt.remove();
    }
}

// Mostrar prompt de atualização do PWA
function showPWAUpdatePrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'pwa-install-prompt show';
    prompt.innerHTML = `
        <div class="pwa-install-content">
            <div class="pwa-install-icon">
                <i class="fas fa-sync-alt"></i>
            </div>
            <div class="pwa-install-text">
                <div class="pwa-install-title">Nova versão disponível</div>
                <div class="pwa-install-description">Uma nova versão do WaterLog está disponível</div>
            </div>
        </div>
        <div class="pwa-install-actions">
            <button class="btn-primary" onclick="updatePWA()">Atualizar</button>
        </div>
    `;
    document.body.appendChild(prompt);
}

// Atualizar PWA
function updatePWA() {
    if (swRegistration && swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
    }
}

function setupPwaListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(showPWAInstallPrompt, 3000);
    });
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
} 