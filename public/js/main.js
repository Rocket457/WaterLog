// =================================
// ARQUIVO PRINCIPAL - main.js
// =================================

// Configurações globais
let currentUser = null;
let bottles = [];
let notifications = [];
let rooms = [];
let rankings = [];
let reconnectAttempts = 0;
let currentFilter = 'day'; // Filtro atual do dashboard
let dailyGoal = 2000; // Meta diária padrão (ml)
let swRegistration = null; // Service Worker registration
let deferredPrompt = null; // PWA install prompt

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Definir status inicial de conexão
    updateConnectionStatus('connecting', 'Conectando...');
    
    // Carregar meta diária salva
    const savedGoal = localStorage.getItem('WaterLog_dailyGoal');
    if (savedGoal) {
        dailyGoal = parseInt(savedGoal);
    }
    
    // Adicionar evento de clique ao logo para voltar ao app
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', showAppSection);
    }
    
    // Iniciar verificação de usuário logado
    checkLoggedInUser();

    // Configurar todos os formulários da aplicação
    setupAuthForms();
    setupBottleForms();
    setupRecordForms();
    setupRoomForms();
    setupDashboardForms();
    
    // Iniciar listeners do Socket.IO
    setupSocketListeners();

    // Iniciar listeners do PWA
    setupPwaListeners();

    // Iniciar PWA
    registerServiceWorker();

    // Adicionar animações de entrada
    animateSections();

    // Carregar Chart.js
    loadChartJs();
});

// Atualizar dados periodicamente
setInterval(() => {
    if (currentUser) {
        loadStats();
        loadNotifications();
    }
}, 30000);


// Injetar Chart.js dinamicamente
function loadChartJs() {
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        document.head.appendChild(script);
    }
} 