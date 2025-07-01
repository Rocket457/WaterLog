// Configurações globais de conexão
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 segundos

// Detectar se está sendo acessado via DNS externo
const isExternalAccess = window.location.hostname === 'waterlog.servebeer.com';
const socketUrl = isExternalAccess ? 'http://waterlog.servebeer.com' : window.location.origin;

console.log('🔌 Conectando Socket.IO:', socketUrl);

const socket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    timeout: 20000,
    transports: ['websocket'],
    upgrade: true,
    rememberUpgrade: true,
    forceNew: true
});

// Expor socket globalmente para comandos do console
window.socket = socket;
window.socketUrl = socketUrl;


function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('✅ Socket.IO conectado!');
        console.log('📡 Socket ID:', socket.id);
        console.log('🌐 URL de conexão:', socketUrl);
        console.log('🔗 Status:', socket.connected);
        reconnectAttempts = 0;
        updateConnectionStatus('connected', 'Conectado');
        
        if (currentUser) {
            socket.emit('join_room', currentUser.id);
            showToast('Conectado ao servidor!', 'success');
        }
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Erro na conexão Socket.IO:', error);
        console.log('🔧 Tentando reconectar...');
        updateConnectionStatus('disconnected', 'Falha na conexão');
        showToast('Erro na reconexão. Tentando novamente...', 'warning');
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO desconectado:', reason);
        updateConnectionStatus('disconnected', 'Desconectado');
        
        if (reason === 'io server disconnect') {
            showToast('Desconectado do servidor. Tentando reconectar...', 'warning');
        } else if (reason === 'io client disconnect') {
            showToast('Desconectado do servidor', 'info');
        } else {
            showToast('Conexão perdida. Reconectando...', 'warning');
        }
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('Reconectado após', attemptNumber, 'tentativas');
        reconnectAttempts = 0;
        updateConnectionStatus('connected', 'Conectado');
        
        if (currentUser) {
            socket.emit('join_room', currentUser.id);
            showToast('Reconectado com sucesso!', 'success');
            loadUserData();
        }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Tentativa de reconexão:', attemptNumber);
        reconnectAttempts = attemptNumber;
        updateConnectionStatus('connecting', `Reconectando... (${attemptNumber}/${MAX_RECONNECT_ATTEMPTS})`);
        
        if (attemptNumber <= MAX_RECONNECT_ATTEMPTS) {
            showToast(`Tentativa de reconexão ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS}...`, 'info');
        }
    });

    socket.on('reconnect_failed', () => {
        console.log('Falha na reconexão');
        updateConnectionStatus('disconnected', 'Falha na conexão');
        showToast('Falha na reconexão. Verifique sua conexão com a internet.', 'error');
    });

    socket.on('reconnect_error', (error) => {
        console.log('Erro na reconexão:', error);
        updateConnectionStatus('connecting', 'Erro na conexão');
        showToast('Erro na reconexão. Tentando novamente...', 'warning');
    });

    socket.on('water_drunk', (data) => {
        showToast(data.message, 'info');
        loadNotifications();
        if (currentUser) {
            loadStats();
        }
    });

    socket.on('bottle_empty', (data) => {
        showToast(data.message, 'success');
        loadNotifications();
        if (currentUser) {
            loadStats();
        }
    });

    socket.on('bottle_filled', (data) => {
        showToast(data.message, 'info');
        loadNotifications();
    });

    socket.on('notifications_cleared', (data) => {
        console.log('Notificações limpas automaticamente:', data);
        showToast(`🧹 ${data.message} (${data.clearedCount} atividades removidas)`, 'info');
        loadNotifications();
    });

    socket.on('record_deleted', (data) => {
        showToast(data.message, 'info');
        loadNotifications();
        if (currentUser) {
            loadStats();
            loadUserRecords();
        }
    });

    socket.on('record_edited', (data) => {
        showToast(data.message, 'info');
        loadNotifications();
        if (currentUser) {
            loadStats();
            loadUserRecords();
        }
    });

    socket.on('admin_broadcast_toast', (data) => {
        console.log('📢 Toast recebido do admin:', data);
        showToast(data.message, data.type || 'info');
    });

    socket.on('test_response', (data) => {
        console.log('🧪 Resposta do teste recebida:', data);
        showToast('Teste de Socket.IO funcionando!', 'success');
    });

    socket.on('test_dns_response', (data) => {
        console.log('🌐 Resposta do teste DNS:', data);
        showToast(`DNS funcionando! Hostname: ${data.hostname}`, 'success');
    });

    // Eventos de salas e gamificação
    socket.on('room_created', (room) => {
        showToast(`Nova sala criada: ${room.name}`, 'info');
        if (rooms.length > 0) loadRooms();
    });
    
    socket.on('user_joined_room', (data) => {
        if (data.userId !== currentUser?.id) {
            showToast('Alguém entrou na sala', 'info');
        }
    });
    
    socket.on('user_left_room', (data) => {
        if (data.userId !== currentUser?.id) {
            showToast('Alguém saiu da sala', 'info');
        }
    });
    
    socket.on('user_connected', (data) => {
        if (data.userId !== currentUser?.id) {
            showToast('Alguém se conectou à sala', 'info');
        }
        if (typeof loadRooms === 'function') loadRooms();
    });
    
    socket.on('user_disconnected', (data) => {
        if (data.userId !== currentUser?.id) {
            showToast('Alguém se desconectou da sala', 'info');
        }
        if (typeof loadRooms === 'function') loadRooms();
    });
    
    socket.on('points_earned', (data) => {
        if (data.userId === currentUser?.id) {
            showToast(`🏆 Parabéns! Você ganhou ${data.points} pontos por ficar em ${data.position}º lugar!`, 'success');
            if (typeof loadUserPoints === 'function') loadUserPoints();
        } else {
            showToast(`🏆 ${data.userName} ganhou ${data.points} pontos!`, 'info');
        }
        if (typeof loadRankings === 'function') loadRankings();
    });
} 