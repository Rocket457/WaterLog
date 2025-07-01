// Funções de Notificações

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
    const notificationsList = document.getElementById('notificationsList');
    if(!notificationsList) return;
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