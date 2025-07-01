// Configurações globais
let currentUser = null;
let bottles = [];
let notifications = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 segundos
let currentFilter = 'day'; // Filtro atual do dashboard
let dailyGoal = 2000; // Meta diária padrão (ml)

// Detectar se está sendo acessado via DNS externo
const isExternalAccess = window.location.hostname === 'waterlog.servebeer.com';
const socketUrl = isExternalAccess ? 'http://waterlog.servebeer.com' : window.location.origin;

console.log('🔌 Conectando Socket.IO:', socketUrl);

const socket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    timeout: 20000,
    transports: ['websocket'], // Usar apenas WebSocket para melhor performance
    upgrade: true, // Permitir upgrade de polling para WebSocket
    rememberUpgrade: true, // Lembrar da preferência de transporte
    forceNew: true // Forçar nova conexão
});

// Expor socket globalmente para comandos do console
window.socket = socket;
window.socketUrl = socketUrl;

// Elementos DOM
const loginContainer = document.getElementById('loginContainer');
const appContainer = document.getElementById('appContainer');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const bottlesGrid = document.getElementById('bottlesGrid');
const notificationsList = document.getElementById('notificationsList');
const connectionStatus = document.getElementById('connectionStatus');

// Verificar se há usuário logado
function checkLoggedInUser() {
    const savedUser = localStorage.getItem('WaterLog_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showApp();
            loadUserData();
        } catch (error) {
            console.error('Erro ao carregar usuário salvo:', error);
            localStorage.removeItem('WaterLog_user');
        }
    }
}

// Mostrar aplicativo
function showApp() {
    loginContainer.style.display = 'none';
    appContainer.style.display = 'block';
    userInfo.style.display = 'flex';
    userName.textContent = currentUser.name;
    
    // Conectar ao Socket.IO
    socket.emit('join_room', currentUser.id);
}

// Esconder aplicativo
function hideApp() {
    loginContainer.style.display = 'flex';
    appContainer.style.display = 'none';
    userInfo.style.display = 'none';
    currentUser = null;
    localStorage.removeItem('WaterLog_user');
}

// Logout
function logout() {
    hideApp();
    showToast('Logout realizado com sucesso!', 'info');
}


// Função para reconectar usuário existente
async function reconnectUser(email) {
    try {
        // Buscar usuário existente por email
        const response = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
        
        if (response.ok) {
            const existingUser = await response.json();
            currentUser = existingUser;
            localStorage.setItem('WaterLog_user', JSON.stringify(existingUser));
            showApp();
            loadUserData();
            showToast(`Reconectado com sucesso, ${existingUser.name}!`, 'success');
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro ao reconectar:', error);
        return false;
    }
}

// Carregar dados do usuário
async function loadUserData() {
    if (!currentUser) return;
    
    await Promise.all([
        loadBottles(),
        loadStats(),
        loadNotifications(),
        loadUserRecords()
    ]);
}

// Carregar garrafas
async function loadBottles() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/bottles`);
        bottles = await response.json();
        renderBottles();
        updateBottleSelects();
    } catch (error) {
        showToast('Erro ao carregar garrafas.', 'error');
    }
}

// Renderizar garrafas
function renderBottles() {
    bottlesGrid.innerHTML = '';
    
    if (bottles.length === 0) {
        bottlesGrid.innerHTML = `
            <div class="bottle-card" style="grid-column: 1 / -1; text-align: center;">
                <div class="bottle-icon">
                    <i class="fas fa-plus-circle"></i>
                </div>
                <div class="bottle-name">Nenhuma garrafa cadastrada</div>
                <div class="bottle-capacity">Adicione sua primeira garrafa!</div>
                <button class="bottle-btn" onclick="showAddBottleModal()">
                    <i class="fas fa-plus"></i> Adicionar Garrafa
                </button>
            </div>
        `;
        return;
    }
    
    bottles.forEach(bottle => {
        const bottleCard = document.createElement('div');
        bottleCard.className = 'bottle-card';
        bottleCard.innerHTML = `
            <div class="bottle-icon">
                <i class="fas fa-wine-bottle"></i>
            </div>
            <div class="bottle-name">${bottle.name}</div>
            <div class="bottle-capacity">${bottle.capacity}ml</div>
            <div class="bottle-actions">
                <button class="bottle-btn" onclick="drinkFromBottle('${bottle.id}', ${bottle.capacity})">
                    <i class="fas fa-glass-water"></i> Beber
                </button>
                <button class="bottle-btn" onclick="fillBottle('${bottle.id}')">
                    <i class="fas fa-faucet"></i> Encher
                </button>
            </div>
        `;
        bottlesGrid.appendChild(bottleCard);
    });
}

// Atualizar selects de garrafas
function updateBottleSelects() {
    const drinkBottle = document.getElementById('drinkBottle');
    const emptyBottle = document.getElementById('emptyBottle');
    const fillBottle = document.getElementById('fillBottle');
    
    const bottleOptions = bottles.map(bottle => 
        `<option value="${bottle.id}">${bottle.name} (${bottle.capacity}ml)</option>`
    ).join('');
    
    if (drinkBottle) {
        drinkBottle.innerHTML = '<option value="">Selecione uma garrafa</option>' + bottleOptions;
    }
    if (emptyBottle) {
        emptyBottle.innerHTML = '<option value="">Selecione uma garrafa</option>' + bottleOptions;
    }
    if (fillBottle) {
        fillBottle.innerHTML = '<option value="">Selecione uma garrafa</option>' + bottleOptions;
    }
}

// Carregar estatísticas
async function loadStats() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/stats`);
        const stats = await response.json();
        
        document.getElementById('todayTotal').textContent = stats.todayTotal;
        document.getElementById('todayRecords').textContent = stats.todayRecords;
        document.getElementById('totalWaterDrunk').textContent = stats.totalWaterDrunk;
        
        // Atualizar barra de progresso com meta personalizada
        const progress = Math.min((stats.todayTotal / dailyGoal) * 100, 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${stats.todayTotal} / ${dailyGoal}ml`;
    } catch (error) {
        showToast('Erro ao carregar estatísticas.', 'error');
    }
}

// Carregar notificações
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications');
        notifications = await response.json();
        renderNotifications();
    } catch (error) {
        showToast('Erro ao carregar notificações.', 'error');
    }
}

// Renderizar notificações
function renderNotifications() {
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notification-item">
                <i class="fas fa-info-circle notification-icon"></i>
                <div class="notification-message">Nenhuma atividade recente</div>
            </div>
        `;
        return;
    }
    
    notifications.slice(0, 10).forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        let icon = 'fas fa-info-circle';
        if (notification.type === 'water_drunk') {
            icon = 'fas fa-glass-water';
        } else if (notification.type === 'bottle_empty') {
            icon = 'fas fa-bottle-water';
        } else if (notification.type === 'bottle_filled') {
            icon = 'fas fa-faucet';
        }
        
        const time = new Date(notification.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        notificationItem.innerHTML = `
            <i class="${icon} notification-icon"></i>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${time}</div>
        `;
        notificationsList.appendChild(notificationItem);
    });
}

// Nova função para abrir o modal de beber já com a garrafa selecionada
function drinkFromBottle(bottleId, capacity) {
    showDrinkModal();
    const select = document.getElementById('drinkBottle');
    if (select) {
        select.value = bottleId;
    }
}

// Função para abrir o modal de encher garrafa
function fillBottle(bottleId) {
    showFillBottleModal();
    const select = document.getElementById('fillBottle');
    if (select) {
        select.value = bottleId;
    }
}

// Funções de modal
function showAddBottleModal() {
    const modal = document.getElementById('addBottleModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showDrinkModal() {
    const modal = document.getElementById('drinkModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showEmptyBottleModal() {
    const modal = document.getElementById('emptyBottleModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showFillBottleModal() {
    const modal = document.getElementById('fillBottleModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Toast notifications
function showToast(message, type = 'info') {
    // Verificar se o DOM está pronto
    if (document.readyState === 'loading') {
        console.warn('DOM ainda não carregado, aguardando...');
        document.addEventListener('DOMContentLoaded', () => {
            showToast(message, type);
        });
        return;
    }
    
    // Aguardar um pouco mais para garantir que todos os elementos estejam disponíveis
    setTimeout(() => {
        const toastElement = document.getElementById('toast');
        if (!toastElement) {
            console.warn('Elemento toast não encontrado');
            return;
        }
        
        const toastContent = toastElement.querySelector('.toast-content');
        const toastIcon = toastElement.querySelector('.toast-icon');
        const toastMessage = toastElement.querySelector('.toast-message');
        
        if (!toastContent|| !toastMessage) {
            console.warn('Elementos do toast não encontrados');
            return;
        }
        
        // Definir ícone baseado no tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        if (toastIcon) {

            toastIcon.className = icons[type] || icons.info;
            
        }

        toastMessage.textContent = message;
        
        // Definir cor baseada no tipo
        const colors = {
            success: 'linear-gradient(45deg, #4CAF50, #45a049)',
            error: 'linear-gradient(45deg, #f44336, #da190b)',
            info: 'linear-gradient(45deg, #2196F3, #0b7dda)',
            warning: 'linear-gradient(45deg, #ff9800, #e68900)'
        };
        
        toastElement.style.background = colors[type] || colors.info;
        
        // Mostrar toast
        toastElement.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }, 100); // Pequeno delay para garantir que o DOM esteja completamente carregado
}

// Socket.IO - Notificações em tempo real
socket.on('connect', () => {
    console.log('✅ Socket.IO conectado!');
    console.log('📡 Socket ID:', socket.id);
    console.log('🌐 URL de conexão:', socketUrl);
    console.log('🔗 Status:', socket.connected);
    reconnectAttempts = 0;
    updateConnectionStatus('connected', 'Conectado');
    
    if (currentUser) {
        // Reconectar à sala do usuário
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
        // Desconexão iniciada pelo servidor
        showToast('Desconectado do servidor. Tentando reconectar...', 'warning');
    } else if (reason === 'io client disconnect') {
        // Desconexão iniciada pelo cliente
        showToast('Desconectado do servidor', 'info');
    } else {
        // Desconexão por erro de rede
        showToast('Conexão perdida. Reconectando...', 'warning');
    }
});

socket.on('reconnect', (attemptNumber) => {
    console.log('Reconectado após', attemptNumber, 'tentativas');
    reconnectAttempts = 0;
    updateConnectionStatus('connected', 'Conectado');
    
    if (currentUser) {
        // Reconectar à sala do usuário
        socket.emit('join_room', currentUser.id);
        showToast('Reconectado com sucesso!', 'success');
        
        // Recarregar dados
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
    loadNotifications(); // Recarregar lista de notificações
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

// Listener para broadcast de admin - adicionado imediatamente
socket.on('admin_broadcast_toast', (data) => {
    console.log('📢 Toast recebido do admin:', data);
    showToast(data.message, data.type || 'info');
});

// Listener para teste do Socket.IO
socket.on('test_response', (data) => {
    console.log('🧪 Resposta do teste recebida:', data);
    showToast('Teste de Socket.IO funcionando!', 'success');
});

// Listener para teste DNS
socket.on('test_dns_response', (data) => {
    console.log('🌐 Resposta do teste DNS:', data);
    showToast(`DNS funcionando! Hostname: ${data.hostname}`, 'success');
});

// Carregar registros do usuário
async function loadUserRecords() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/records`);
        const records = await response.json();
        renderUserRecords(records);
    } catch (error) {
        showToast('Erro ao carregar registros.', 'error');
    }
}

// Renderizar registros do usuário
function renderUserRecords(records) {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';
    
    if (records.length === 0) {
        recordsList.innerHTML = `
            <div class="record-item" style="text-align: center; justify-content: center;">
                <div class="record-info">
                    <div class="record-amount">Nenhum registro encontrado</div>
                    <div class="record-details">Faça seu primeiro registro de água!</div>
                </div>
            </div>
        `;
        return;
    }
    
    records.slice(0, 20).forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        const time = new Date(record.timestamp).toLocaleString('pt-BR', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        recordItem.innerHTML = `
            <div class="record-info">
                <div class="record-amount">${record.amount}ml</div>
                <div class="record-details">${record.bottleName}</div>
                <div class="record-time">${time}</div>
            </div>
            <div class="record-actions">
                <button class="record-btn edit" onclick="editRecord('${record.id}', ${record.amount})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="record-btn delete" onclick="deleteRecord('${record.id}')">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </div>
        `;
        recordsList.appendChild(recordItem);
    });
}

// Editar registro
function editRecord(recordId, currentAmount) {
    document.getElementById('editRecordId').value = recordId;
    document.getElementById('editRecordAmount').value = currentAmount;
    showEditRecordModal();
}

// Mostrar modal de edição
function showEditRecordModal() {
    const modal = document.getElementById('editRecordModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Deletar registro
async function deleteRecord(recordId) {
    showConfirmationModal(
        'Tem certeza que deseja deletar este registro?',
        () => performDeleteRecord(recordId)
    );
}

// Função para executar a deleção após confirmação
async function performDeleteRecord(recordId) {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/records/${recordId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Registro deletado com sucesso!', 'success');
            loadUserRecords();
            loadStats();
            loadNotifications();
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao deletar registro.', 'error');
    }
}

// Função para mostrar modal de confirmação
function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    messageElement.textContent = message;
    
    // Remover event listeners anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Adicionar novo event listener
    newConfirmBtn.addEventListener('click', () => {
        closeModal('confirmationModal');
        onConfirm();
    });
    
    modal.style.display = 'block';
}

// Drink form
const drinkForm = document.getElementById('drinkForm');
if (drinkForm) {
    drinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bottleId = document.getElementById('drinkBottle').value;
        const percent = parseInt(document.getElementById('drinkPercent').value);
        if (!bottleId || !percent) {
            showToast('Selecione a garrafa e a porcentagem!', 'error');
            return;
        }
        const bottle = bottles.find(b => b.id === bottleId);
        if (!bottle) {
            showToast('Garrafa não encontrada!', 'error');
            return;
        }
        const amount = Math.round(bottle.capacity * (percent / 100));
        try {
            const response = await fetch(`/api/users/${currentUser.id}/drink`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bottleId, amount })
            });
            if (response.ok) {
                showToast('Consumo registrado!', 'success');
                closeModal('drinkModal');
                loadStats();
                loadNotifications();
                loadUserRecords();
            } else {
                const error = await response.json();
                showToast(error.error, 'error');
            }
        } catch (error) {
            showToast('Erro ao registrar consumo.', 'error');
        }
    });
}

// Edit record form
const editRecordForm = document.getElementById('editRecordForm');
if (editRecordForm) {
    editRecordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const recordId = document.getElementById('editRecordId').value;
        const amount = parseInt(document.getElementById('editRecordAmount').value);
        
        if (!amount || amount <= 0) {
            showToast('Quantidade inválida!', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/users/${currentUser.id}/records/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            
            if (response.ok) {
                showToast('Registro editado com sucesso!', 'success');
                closeModal('editRecordModal');
                loadUserRecords();
                loadStats();
                loadNotifications();
            } else {
                const error = await response.json();
                showToast(error.error, 'error');
            }
        } catch (error) {
            showToast('Erro ao editar registro.', 'error');
        }
    });
}

// Inicialização
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
        logo.addEventListener('click', () => {
            if (document.getElementById('dashboardSection').style.display === 'flex') {
                showAppSection();
            }
        });
    }
    
    // Verificar usuário logado primeiro
    const savedUser = localStorage.getItem('WaterLog_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showApp();
            loadUserData();
            showToast(`Bem-vindo de volta, ${currentUser.name}!`, 'success');
        } catch (error) {
            console.error('Erro ao carregar usuário salvo:', error);
            localStorage.removeItem('WaterLog_user');
            showToast('Erro ao carregar sessão. Faça login novamente.', 'error');
        }
    }
    
    // Adicionar event listeners para formulários
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const name = formData.get('name');
            const email = formData.get('email');
            
            try {
                // Primeiro, tentar reconectar usuário existente
                const reconnected = await reconnectUser(email);
                
                if (!reconnected) {
                    // Se não encontrou usuário, criar novo
                    const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email })
                    });
                    
                    if (response.ok) {
                        const user = await response.json();
                        currentUser = user;
                        localStorage.setItem('WaterLog_user', JSON.stringify(user));
                        showApp();
                        loadUserData();
                        showToast(`Bem-vindo, ${user.name}!`, 'success');
                    } else {
                        const error = await response.json();
                        showToast(error.error, 'error');
                    }
                }
            } catch (error) {
                showToast('Erro ao fazer login. Tente novamente.', 'error');
            }
        });
    }
    
    // Event listener para adicionar garrafa
    const addBottleForm = document.getElementById('addBottleForm');
    if (addBottleForm) {
        addBottleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const capacity = formData.get('capacity');
            
            try {
                const response = await fetch(`/api/users/${currentUser.id}/bottles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, capacity })
                });
                
                if (response.ok) {
                    closeModal('addBottleModal');
                    e.target.reset();
                    loadBottles();
                    showToast('Garrafa adicionada com sucesso!', 'success');
                } else {
                    const error = await response.json();
                    showToast(error.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao adicionar garrafa.', 'error');
            }
        });
    }
    
    // Event listener para esvaziar garrafa
    const emptyBottleForm = document.getElementById('emptyBottleForm');
    if (emptyBottleForm) {
        emptyBottleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const bottleId = formData.get('bottleId');
            
            try {
                const response = await fetch(`/api/users/${currentUser.id}/bottles/${bottleId}/empty`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    closeModal('emptyBottleModal');
                    e.target.reset();
                    showToast('Garrafa marcada como vazia!', 'success');
                    loadStats();
                    loadNotifications();
                } else {
                    const error = await response.json();
                    showToast(error.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao marcar garrafa como vazia.', 'error');
            }
        });
    }
    
    // Event listener para encher garrafa
    const fillBottleForm = document.getElementById('fillBottleForm');
    if (fillBottleForm) {
        fillBottleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const bottleId = formData.get('bottleId');
            
            try {
                const response = await fetch(`/api/users/${currentUser.id}/bottles/${bottleId}/fill`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    closeModal('fillBottleModal');
                    e.target.reset();
                    showToast('Garrafa marcada como cheia!', 'success');
                } else {
                    const error = await response.json();
                    showToast(error.error, 'error');
                }
            } catch (error) {
                showToast('Erro ao marcar garrafa como cheia.', 'error');
            }
        });
    }
    
    // Event listener para editar meta diária
    const editGoalForm = document.getElementById('editGoalForm');
    if (editGoalForm) {
        editGoalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveDailyGoal();
        });
    }
    
    // Adicionar animações de entrada
    const elements = document.querySelectorAll('.stats-card, .water-progress, .bottles-section, .quick-actions, .notifications-section');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Atualizar dados a cada 30 segundos
setInterval(() => {
    if (currentUser) {
        loadStats();
        loadNotifications();
    }
}, 30000);

// Função para atualizar status de conexão
function updateConnectionStatus(status, text) {
    if (!connectionStatus) return;
    
    const statusIcon = connectionStatus.querySelector('.status-icon');
    const statusText = connectionStatus.querySelector('.status-text');
    
    // Remover classes anteriores
    statusIcon.classList.remove('connected', 'disconnected', 'connecting');
    
    // Adicionar classe apropriada
    statusIcon.classList.add(status);
    statusText.textContent = text;
}

// Chart.js CDN
if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
}

// Alternar entre dashboard e app
function showDashboard() {
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'flex';
    document.getElementById('btnDashboard').classList.add('active');
    renderBarChart();
}

// Função para voltar ao app principal (clicando no logo)
function showAppSection() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('appContainer').style.display = '';
    document.getElementById('btnDashboard').classList.remove('active');
}

// Função para definir filtro do dashboard
function setFilter(filter) {
    currentFilter = filter;
    // Atualizar botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    // Re-renderizar gráfico
    renderBarChart();
}

// Função para buscar e renderizar o gráfico de barras
async function renderBarChart() {
    // Aguarda Chart.js carregar
    if (!window.Chart) {
        setTimeout(renderBarChart, 200);
        return;
    }
    const ctx = document.getElementById('barChart').getContext('2d');
    // Buscar todos os usuários
    const usersResp = await fetch('/api/users');
    const users = await usersResp.json();
    // Buscar todos os registros de água
    const recordsResp = await fetch('/api/notifications');
    const notifications = await recordsResp.json();
    // Filtrar apenas notificações de consumo de água
    const waterRecords = notifications.filter(n => n.type === 'water_drunk');
    
    // Calcular período baseado no filtro
    const now = new Date();
    let startDate, endDate, periodLabel;
    
    switch(currentFilter) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            periodLabel = 'Hoje';
            break;
        case 'week':
            const dayOfWeek = now.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Segunda = 0
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            periodLabel = 'Esta Semana';
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            periodLabel = 'Este Mês';
            break;
    }
    
    // Filtrar registros pelo período
    const filteredRecords = waterRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate && recordDate < endDate;
    });
    
    // Agrupar por usuário
    const userData = {};
    filteredRecords.forEach(record => {
        if (!userData[record.userName]) userData[record.userName] = 0;
        // Extrair quantidade do texto
        const match = record.message.match(/(\d+)ml/);
        const amount = match ? parseInt(match[1]) : 0;
        userData[record.userName] += amount;
    });
    
    // Apenas nomes que beberam no período
    let userNames = [];
    let values = [];
    Object.entries(userData).forEach(([name, value]) => {
        if (value > 0) {
            userNames.push(name);
            values.push(value);
        }
    });
    
    // Destruir gráfico anterior se existir
    if (window.barChartInstance) window.barChartInstance.destroy();
    window.barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: userNames,
            datasets: [{
                label: `Consumo de água (${periodLabel})`,
                data: values,
                backgroundColor: '#4facfe',
                borderRadius: 8,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `Ranking de Consumo - ${periodLabel}`,
                    color: '#4facfe',
                    font: { size: 20 }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#d4d4d4', font: { weight: 'bold' } },
                    grid: { color: '#23272e' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#d4d4d4' },
                    grid: { color: '#23272e' }
                }
            }
        }
    });
}

// Função para mostrar modal de editar meta
function showEditGoalModal() {
    const modal = document.getElementById('editGoalModal');
    const input = document.getElementById('editGoalAmount');
    if (modal && input) {
        input.value = dailyGoal;
        modal.style.display = 'block';
    }
}

// Função para salvar meta diária
async function saveDailyGoal() {
    const input = document.getElementById('editGoalAmount');
    const newGoal = parseInt(input.value);
    
    if (newGoal < 500 || newGoal > 10000) {
        showToast('Meta deve estar entre 500ml e 10000ml', 'error');
        return;
    }
    
    dailyGoal = newGoal;
    localStorage.setItem('WaterLog_dailyGoal', dailyGoal.toString());
    
    closeModal('editGoalModal');
    showToast(`Meta diária atualizada para ${dailyGoal}ml!`, 'success');
    
    // Atualizar estatísticas com nova meta
    loadStats();
} 