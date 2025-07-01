// Funções relacionadas a Garrafas

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
    const bottlesGrid = document.getElementById('bottlesGrid');
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

function setupBottleForms() {
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
                    headers: { 'Content-Type': 'application/json' },
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
} 