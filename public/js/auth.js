// Funções de Autenticação e Sessão

// Verificar se há usuário logado
function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            // Verificar se o usuário tem nome definido
            if (!currentUser.name || currentUser.name.trim() === '') {
                showApp();
                showNameModal();
                showToast('Complete seu perfil definindo seu nome', 'info');
            } else {
                showApp();
                loadUserData();
            }
        } catch (error) {
            console.error('Erro ao carregar usuário salvo:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Logout
function logout() {
    // Limpar dados do usuário
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Esconder aplicativo
    hideApp();
    
    // Limpar dados das seções
    if (window.socket) {
        socket.disconnect();
    }
    
    // Limpar listas e dados
    const bottlesGrid = document.getElementById('bottlesGrid');
    const recordsList = document.getElementById('recordsList');
    const notificationsList = document.getElementById('notificationsList');
    
    if (bottlesGrid) bottlesGrid.innerHTML = '';
    if (recordsList) recordsList.innerHTML = '';
    if (notificationsList) notificationsList.innerHTML = '';
    
    showToast('Logout realizado com sucesso!', 'info');
}

// Função para reconectar usuário existente
async function reconnectUser(email) {
    try {
        const response = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
        
        if (response.ok) {
            const existingUser = await response.json();
            currentUser = existingUser;
            localStorage.setItem('currentUser', JSON.stringify(existingUser));
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
            const email = formData.get('email');
            const password = formData.get('password');
            
            if (!email || !password) {
                showToast('Preencha todos os campos', 'error');
                return;
            }
            
            try {
                // Tentar fazer login primeiro
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (loginResponse.ok) {
                    const user = await loginResponse.json();
                    currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // Verificar se o usuário tem nome definido
                    if (!user.name || user.name.trim() === '') {
                        showApp();
                        showNameModal();
                        showToast('Complete seu perfil definindo seu nome', 'info');
                    } else {
                        showToast('Login realizado com sucesso!', 'success');
                        showApp();
                    }
                    return;
                }
                
                // Se login falhou, tentar cadastrar
                const registerResponse = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (registerResponse.ok) {
                    showToast('Usuário cadastrado com sucesso! Defina seu nome...', 'success');
                    // Fazer login automaticamente após cadastro
                    const finalLoginResponse = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    if (finalLoginResponse.ok) {
                        const user = await finalLoginResponse.json();
                        currentUser = user;
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        showApp();
                        showNameModal();
                    }
                } else {
                    const error = await registerResponse.json();
                    showToast(error.error, 'error');
                }
            } catch (err) {
                showToast('Erro ao conectar. Tente novamente.', 'error');
            }
        });
    }
}

// Funções de Perfil
function showProfileModal() {
    if (!currentUser) {
        showToast('Usuário não encontrado', 'error');
        return;
    }
    
    // Preencher o formulário com dados atuais
    const nameInput = document.getElementById('profileName');
    const passwordInput = document.getElementById('profilePassword');
    const confirmPasswordInput = document.getElementById('profileConfirmPassword');
    
    if (nameInput) nameInput.value = currentUser.name || '';
    if (passwordInput) passwordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    
    showModal('profileModal');
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            const name = formData.get('name');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            // Validações
            if (!name.trim()) {
                showToast('Nome é obrigatório', 'error');
                return;
            }
            
            if (password && password !== confirmPassword) {
                showToast('As senhas não coincidem', 'error');
                return;
            }
            
            if (password && password.length < 3) {
                showToast('A senha deve ter pelo menos 3 caracteres', 'error');
                return;
            }
            
            try {
                const updateData = {
                    name: name.trim()
                };
                
                if (password) {
                    updateData.password = password;
                }
                
                const response = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
                
                if (response.ok) {
                    const updatedUser = await response.json();
                    
                    // Se a senha foi alterada, fazer logout para forçar novo login
                    if (password) {
                        closeModal('profileModal');
                        showToast('Senha alterada com sucesso! Faça login novamente.', 'success');
                        
                        // Aguardar um pouco antes de fazer logout
                        setTimeout(() => {
                            logout();
                        }, 1500);
                        return;
                    }
                    
                    // Se apenas nome foi alterado, atualizar normalmente
                    currentUser = updatedUser;
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    
                    // Atualizar nome no header
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = updatedUser.name;
                    }
                    
                    closeModal('profileModal');
                    showToast('Perfil atualizado com sucesso!', 'success');
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar perfil', 'error');
                }
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error);
                showToast('Erro ao conectar. Tente novamente.', 'error');
            }
        });
    }
}

// Função para mostrar modal de nome (quando criar conta nova)
function showNameModal() {
    showModal('nameModal');
}

// Configurar formulário de nome
function setupNameForm() {
    const nameForm = document.getElementById('nameForm');
    if (nameForm) {
        nameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(nameForm);
            const name = formData.get('name');
            
            if (!name.trim()) {
                showToast('Nome é obrigatório para continuar', 'error');
                return;
            }
            
            if (name.trim().length < 2) {
                showToast('Nome deve ter pelo menos 2 caracteres', 'error');
                return;
            }
            
            try {
                // Atualizar o nome do usuário atual
                const response = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim() })
                });
                
                if (response.ok) {
                    const updatedUser = await response.json();
                    
                    // Atualizar usuário atual
                    currentUser = updatedUser;
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    
                    // Atualizar nome no header
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = updatedUser.name;
                    }
                    
                    closeModal('nameModal');
                    showToast(`Bem-vindo, ${updatedUser.name}!`, 'success');
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao definir nome', 'error');
                }
            } catch (error) {
                console.error('Erro ao definir nome:', error);
                showToast('Erro ao conectar. Tente novamente.', 'error');
            }
        });
    }
}