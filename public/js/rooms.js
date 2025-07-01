// ===== ROOMS FUNCTIONS =====

// Mostrar seção de salas
function showRoomsSection() {
    hideAllSections();
    const roomsSection = document.getElementById('roomsSection');
    const btnRooms = document.getElementById('btnRooms');
    
    if (roomsSection) {
        roomsSection.style.display = 'flex';
        roomsSection.classList.add('show');
    }
    if (btnRooms) btnRooms.classList.add('active');
    
    loadRooms();
}

// Carregar salas
async function loadRooms() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/rooms`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar salas');
        }
        
        rooms = await response.json();
        renderRooms();
        updateCurrentRoomIndicator();
    } catch (error) {
        console.error('Erro ao carregar salas:', error);
        showToast('Erro ao carregar salas', 'error');
    }
}

// Carregar status da sala atual
async function loadCurrentRoomStatus() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/rooms`);
        
        if (response.ok) {
            const userRooms = await response.json();
            const connectedRoom = userRooms.find(room => room.isConnected);
            updateCurrentRoomIndicator(connectedRoom);
        }
    } catch (error) {
        console.error('Erro ao carregar status da sala atual:', error);
    }
}

// Atualizar indicador de sala atual no banner
function updateCurrentRoomIndicator(connectedRoom = null) {
    const currentRoomBanner = document.getElementById('currentRoomBanner');
    const bannerRoomName = document.getElementById('bannerRoomName');
    
    if (!currentRoomBanner || !bannerRoomName) return;
    
    if (!connectedRoom && rooms) {
        connectedRoom = rooms.find(room => room.isConnected);
    }
    
    if (connectedRoom) {
        bannerRoomName.textContent = connectedRoom.name;
        currentRoomBanner.style.display = 'block';
    } else {
        currentRoomBanner.style.display = 'none';
    }
}

// Renderizar salas
function renderRooms() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;
    
    roomsGrid.innerHTML = '';
    
    if (!rooms || rooms.length === 0) {
        roomsGrid.innerHTML = `
            <div class="room-card" style="grid-column: 1 / -1; text-align: center;">
                <div class="room-name">Nenhuma sala criada</div>
                <div class="room-description">Seja o primeiro a criar uma sala!</div>
                <button class="btn-primary" onclick="showCreateRoomModal()">
                    <i class="fas fa-plus"></i> Criar Primeira Sala
                </button>
            </div>
        `;
        return;
    }
    
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = `room-card ${room.isConnected ? 'connected' : ''}`;
        roomCard.onclick = () => showRoomDetails(room);
        
        const createdAt = new Date(room.createdAt).toLocaleDateString('pt-BR');
        const connectionStatus = room.isConnected ? 'Conectado' : 'Desconectado';
        const connectionClass = room.isConnected ? 'connected' : 'disconnected';
        
        roomCard.innerHTML = `
            <div class="room-header">
                <div>
                    <div class="room-name">${room.name}</div>
                    <div class="room-status ${room.isPublic ? 'public' : 'private'}">
                        ${room.isPublic ? 'Pública' : 'Privada'}
                    </div>
                </div>
                <div class="room-connection-status ${connectionClass}">
                    <i class="fas fa-circle"></i>
                    ${connectionStatus}
                </div>
            </div>
            <div class="room-description">${room.description || 'Sem descrição'}</div>
            <div class="room-stats">
                <div class="room-members-count">
                    <i class="fas fa-users"></i>
                    ${room.connectedMembers}/${room.members.length} conectados
                </div>
                <div class="room-created">
                    <i class="fas fa-calendar"></i>
                    ${createdAt}
                </div>
            </div>
        `;
        roomsGrid.appendChild(roomCard);
    });
}

// Mostrar modal de criar sala
function showCreateRoomModal() {
    const modal = document.getElementById('createRoomModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Mostrar detalhes da sala
function showRoomDetails(room) {
    const modal = document.getElementById('roomDetailsModal');
    const nameEl = document.getElementById('roomDetailsName');
    const descEl = document.getElementById('roomDetailsDescription');
    const membersCountEl = document.getElementById('roomMembersCount');
    const createdAtEl = document.getElementById('roomCreatedAt');
    const membersListEl = document.getElementById('roomMembersList');
    const joinBtn = document.getElementById('joinRoomBtn');
    
    if (!modal || !nameEl || !descEl || !membersCountEl || !createdAtEl || !membersListEl || !joinBtn) {
        console.error('Elementos do modal de detalhes da sala não encontrados');
        return;
    }
    
    nameEl.textContent = room.name;
    descEl.textContent = room.description || 'Sem descrição';
    membersCountEl.textContent = room.members.length;
    createdAtEl.textContent = new Date(room.createdAt).toLocaleDateString('pt-BR');
    
    // Renderizar membros
    membersListEl.innerHTML = '';
    room.members.forEach(memberId => {
        // Buscar informações do usuário via API
        fetch(`/api/users/${memberId}`)
            .then(response => response.json())
            .then(user => {
                const memberEl = document.createElement('div');
                memberEl.className = 'room-member';
                memberEl.innerHTML = `
                    <div class="member-name">${user.name}</div>
                    <div class="member-status online">Online</div>
                `;
                membersListEl.appendChild(memberEl);
            })
            .catch(error => {
                console.error('Erro ao carregar usuário:', error);
                const memberEl = document.createElement('div');
                memberEl.className = 'room-member';
                memberEl.innerHTML = `
                    <div class="member-name">Usuário ${memberId}</div>
                    <div class="member-status offline">Offline</div>
                `;
                membersListEl.appendChild(memberEl);
            });
    });
    
    // Configurar botões
    const isMember = room.members.includes(currentUser.id);
    const isConnected = room.isConnected;
    
    if (isMember) {
        joinBtn.textContent = isConnected ? 'Desconectar' : 'Conectar';
        joinBtn.className = isConnected ? 'btn-secondary' : 'btn-primary';
        joinBtn.onclick = () => isConnected ? disconnectFromRoom(room.id) : connectToRoom(room.id);
    } else {
        joinBtn.textContent = 'Entrar na Sala';
        joinBtn.className = 'btn-primary';
        joinBtn.onclick = () => joinRoom(room.id);
    }
    
    modal.style.display = 'block';
}

// Criar sala
async function createRoom(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const roomData = {
        name: formData.get('name'),
        description: formData.get('description'),
        maxMembers: parseInt(formData.get('maxMembers')),
        isPublic: formData.get('isPublic') === 'on',
        createdBy: currentUser.id
    };
    
    try {
        const response = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roomData)
        });
        
        if (response.ok) {
            await response.json();
            closeModal('createRoomModal');
            showToast('Sala criada com sucesso!', 'success');
            loadRooms();
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao criar sala', 'error');
    }
}

// Entrar na sala
async function joinRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            closeModal('roomDetailsModal');
            showToast('Entrou na sala com sucesso!', 'success');
            loadRooms();
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao entrar na sala', 'error');
    }
}

// Sair da sala
async function leaveRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            closeModal('roomDetailsModal');
            showToast('Saiu da sala com sucesso!', 'success');
            await loadCurrentRoomStatus();
            if (document.getElementById('roomsSection').style.display !== 'none') {
                loadRooms();
            }
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao sair da sala', 'error');
    }
}

// Conectar a uma sala
async function connectToRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            closeModal('roomDetailsModal');
            showToast('Conectado à sala com sucesso!', 'success');
            await loadCurrentRoomStatus();
            if (document.getElementById('roomsSection').style.display !== 'none') {
                loadRooms();
            }
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar à sala', 'error');
    }
}

// Desconectar de uma sala
async function disconnectFromRoom(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        if (response.ok) {
            closeModal('roomDetailsModal');
            showToast('Desconectado da sala com sucesso!', 'success');
            await loadCurrentRoomStatus();
            if (document.getElementById('roomsSection').style.display !== 'none') {
                loadRooms();
            }
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Erro ao desconectar da sala', 'error');
    }
}

// Sair da sala atual
async function leaveCurrentRoom() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/rooms`);
        if (response.ok) {
            const userRooms = await response.json();
            const connectedRoom = userRooms.find(room => room.isConnected);
            
            if (!connectedRoom) {
                showToast('Você não está conectado a nenhuma sala', 'info');
                return;
            }
            
            await leaveRoom(connectedRoom.id);
            showToast(`Saiu da sala "${connectedRoom.name}"`, 'success');
        }
    } catch (error) {
        showToast('Erro ao sair da sala', 'error');
    }
}


function setupRoomForms() {
    const createRoomForm = document.getElementById('createRoomForm');
    if (createRoomForm) {
        createRoomForm.addEventListener('submit', createRoom);
    }
} 