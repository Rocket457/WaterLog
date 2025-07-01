// Funções de Registros de Consumo

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

function setupRecordForms() {
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
} 