// Funções do Dashboard e Estatísticas

// Carregar estatísticas
async function loadStats() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/stats`);
        const stats = await response.json();
        
        document.getElementById('todayTotal').textContent = stats.todayTotal;
        document.getElementById('todayRecords').textContent = stats.todayRecords;
        document.getElementById('totalWaterDrunk').textContent = stats.totalWaterDrunk;
        
        const progress = Math.min((stats.todayTotal / dailyGoal) * 100, 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${stats.todayTotal} / ${dailyGoal}ml`;
    } catch (error) {
        showToast('Erro ao carregar estatísticas.', 'error');
    }
}

// Alternar entre dashboard e app
function showDashboard() {
    hideAllSections();
    const dashboardSection = document.getElementById('dashboardSection');
    const btnDashboard = document.getElementById('btnDashboard');
    
    if (dashboardSection) {
        dashboardSection.style.display = 'flex';
        dashboardSection.classList.add('show');
    }
    if (btnDashboard) btnDashboard.classList.add('active');
    
    renderBarChart();
}

// Função para voltar ao app principal (clicando no logo)
function showAppSection() {
    hideAllSections();
    const appContainer = document.getElementById('appContainer');
    const btnDashboard = document.getElementById('btnDashboard');
    
    if (appContainer) {
        appContainer.style.display = 'block';
        appContainer.classList.add('show');
    }
    if (btnDashboard) btnDashboard.classList.remove('active');
}

// Função para definir filtro do dashboard
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    renderBarChart();
}

// Função para buscar e renderizar o gráfico de barras
async function renderBarChart() {
    if (!window.Chart) {
        setTimeout(renderBarChart, 200);
        return;
    }
    const ctx = document.getElementById('barChart').getContext('2d');
    const usersResp = await fetch('/api/users');
    const users = await usersResp.json();
    const recordsResp = await fetch('/api/notifications');
    const notifications = await recordsResp.json();
    const waterRecords = notifications.filter(n => n.type === 'water_drunk');
    
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
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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
    
    const filteredRecords = waterRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate && recordDate < endDate;
    });
    
    const userData = {};
    filteredRecords.forEach(record => {
        if (!userData[record.userName]) userData[record.userName] = 0;
        const match = record.message.match(/(\d+)ml/);
        const amount = match ? parseInt(match[1]) : 0;
        userData[record.userName] += amount;
    });
    
    let userNames = [];
    let values = [];
    Object.entries(userData).forEach(([name, value]) => {
        if (value > 0) {
            userNames.push(name);
            values.push(value);
        }
    });
    
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
    
    loadStats();
}

function setupDashboardForms() {
    const editGoalForm = document.getElementById('editGoalForm');
    if (editGoalForm) {
        editGoalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveDailyGoal();
        });
    }
} 