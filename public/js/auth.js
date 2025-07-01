// Funções de Autenticação e Sessão

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

// Logout
function logout() {
    hideApp();
    currentUser = null;
    localStorage.removeItem('WaterLog_user');
    showToast('Logout realizado com sucesso!', 'info');
}

// Função para reconectar usuário existente
async function reconnectUser(email) {
    try {
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
        loadUserRecords(),
        loadCurrentRoomStatus()
    ]);
}

function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const name = formData.get('name');
            const email = formData.get('email');
            
            try {
                const reconnected = await reconnectUser(email);
                
                if (!reconnected) {
                    const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
} 