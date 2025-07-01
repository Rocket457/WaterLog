// Funções de UI

// Mostrar aplicativo
function showApp() {
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.classList.add('show');
    }
    if (userInfo) userInfo.style.display = 'flex';
    if (userName) userName.textContent = currentUser.name;
    
    // Conectar ao Socket.IO
    socket.emit('join_room', currentUser.id);
}

// Esconder aplicativo
function hideApp() {
    const loginContainer = document.getElementById('loginContainer');
    const userInfo = document.getElementById('userInfo');
    const currentRoomBanner = document.getElementById('currentRoomBanner');

    hideAllSections();

    if (loginContainer) loginContainer.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'none';
    if (currentRoomBanner) currentRoomBanner.style.display = 'none';
}

// Funções de modal
function showAddBottleModal() {
    const modal = document.getElementById('addBottleModal');
    if (modal) modal.style.display = 'block';
}

function showDrinkModal() {
    const modal = document.getElementById('drinkModal');
    if (modal) modal.style.display = 'block';
}

function showEmptyBottleModal() {
    const modal = document.getElementById('emptyBottleModal');
    if (modal) modal.style.display = 'block';
}

function showFillBottleModal() {
    const modal = document.getElementById('fillBottleModal');
    if (modal) modal.style.display = 'block';
}

function showEditRecordModal() {
    const modal = document.getElementById('editRecordModal');
    if (modal) modal.style.display = 'block';
}

function showEditGoalModal() {
    const modal = document.getElementById('editGoalModal');
    const input = document.getElementById('editGoalAmount');
    if (modal && input) {
        input.value = dailyGoal;
        modal.style.display = 'block';
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal && modal.id !== 'nameModal') {
            modal.style.display = 'none';
        }
    });
});

// Toast notifications
function showToast(message, type = 'info') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => showToast(message, type));
        return;
    }
    
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
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        if (toastIcon) {
            toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
        }

        toastMessage.textContent = message;
        
        const colors = {
            success: 'linear-gradient(45deg, #4CAF50, #45a049)',
            error: 'linear-gradient(45deg, #f44336, #da190b)',
            info: 'linear-gradient(45deg, #2196F3, #0b7dda)',
            warning: 'linear-gradient(45deg, #ff9800, #e68900)'
        };
        
        toastElement.style.background = colors[type] || colors.info;
        toastElement.classList.add('show');
        
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }, 100);
}

// Função para mostrar modal de confirmação
function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    messageElement.textContent = message;
    
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        closeModal('confirmationModal');
        onConfirm();
    });
    
    modal.style.display = 'block';
}

// Função para atualizar status de conexão
function updateConnectionStatus(status, text) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (!connectionStatus) return;
    
    const statusIcon = connectionStatus.querySelector('.status-icon');
    const statusText = connectionStatus.querySelector('.status-text');
    
    statusIcon.classList.remove('connected', 'disconnected', 'connecting');
    statusIcon.classList.add(status);
    statusText.textContent = text;
}


// Esconder todas as seções
function hideAllSections() {
    const appContainer = document.getElementById('appContainer');
    const dashboardSection = document.getElementById('dashboardSection');
    const roomsSection = document.getElementById('roomsSection');
    const gamificationSection = document.getElementById('gamificationSection');
    
    if (appContainer) {
        appContainer.style.display = 'none';
        appContainer.classList.remove('show');
    }
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
        dashboardSection.classList.remove('show');
    }
    if (roomsSection) {
        roomsSection.style.display = 'none';
        roomsSection.classList.remove('show');
    }
    if (gamificationSection) {
        gamificationSection.style.display = 'none';
        gamificationSection.classList.remove('show');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
}

function animateSections() {
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
} 