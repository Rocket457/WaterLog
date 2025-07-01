// ===== GAMIFICATION FUNCTIONS =====

// Mostrar seção de gamificação
function showGamificationSection() {
    hideAllSections();
    const gamificationSection = document.getElementById('gamificationSection');
    const btnGamification = document.getElementById('btnGamification');
    
    if (gamificationSection) {
        gamificationSection.style.display = 'flex';
        gamificationSection.classList.add('show');
    }
    if (btnGamification) btnGamification.classList.add('active');
    
    loadGamificationData();
}

// Carregar dados de gamificação
async function loadGamificationData() {
    await Promise.all([
        loadUserPoints(),
        loadRankings()
    ]);
}

// Carregar pontos do usuário
async function loadUserPoints() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}/points`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar pontos');
        }
        
        const data = await response.json();
        
        const pointsDisplay = document.getElementById('userPointsDisplay');
        const pointsValue = document.getElementById('pointsValue');
        const userPoints = document.getElementById('userPoints');
        
        if (pointsDisplay) pointsDisplay.textContent = data.points || 0;
        if (pointsValue) pointsValue.textContent = data.points || 0;
        if (userPoints) userPoints.style.display = 'flex';
        
        renderPointsHistory(data.history || []);
    } catch (error) {
        console.error('Erro ao carregar pontos:', error);
        showToast('Erro ao carregar pontos', 'error');
    }
}

// Renderizar histórico de pontos
function renderPointsHistory(history) {
    const historyEl = document.getElementById('pointsHistory');
    if (!historyEl) return;
    
    historyEl.innerHTML = '';
    
    if (!history || history.length === 0) {
        historyEl.innerHTML = '<p style="text-align: center; color: #6a9955;">Nenhum ponto ganho ainda</p>';
        return;
    }
    
    history.slice(0, 10).forEach(point => {
        const pointEl = document.createElement('div');
        pointEl.className = 'point-item';
        pointEl.innerHTML = `
            <div class="point-info">
                <div class="point-reason">${point.reason}</div>
                <div class="point-date">${new Date(point.timestamp).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="point-amount">+${point.points}</div>
        `;
        historyEl.appendChild(pointEl);
    });
}

// Carregar rankings
async function loadRankings() {
    try {
        const [dailyResponse, weeklyResponse] = await Promise.all([
            fetch('/api/rankings/daily'),
            fetch('/api/rankings/weekly')
        ]);
        
        if (!dailyResponse.ok || !weeklyResponse.ok) {
            throw new Error('Erro ao carregar rankings');
        }
        
        const dailyRanking = await dailyResponse.json();
        const weeklyRanking = await weeklyResponse.json();
        
        renderDailyRanking(dailyRanking.rankings || []);
        renderWeeklyRanking(weeklyRanking.rankings || []);
    } catch (error) {
        console.error('Erro ao carregar rankings:', error);
        showToast('Erro ao carregar rankings', 'error');
    }
}

// Renderizar ranking diário
function renderDailyRanking(rankings) {
    const rankingList = document.getElementById('dailyRankingList');
    if (!rankingList) return;
    
    rankingList.innerHTML = '';
    
    if (!rankings || rankings.length === 0) {
        rankingList.innerHTML = '<p style="text-align: center; color: #6a9955;">Nenhum ranking disponível</p>';
        return;
    }
    
    rankings.slice(0, 10).forEach((ranking, index) => {
        const rankingEl = document.createElement('div');
        rankingEl.className = `ranking-item ${index < 3 ? ['first', 'second', 'third'][index] : ''}`;
        
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
        
        rankingEl.innerHTML = `
            <div class="ranking-position ${index < 3 ? ['first', 'second', 'third'][index] : ''}">
                <span class="ranking-medal">${medal}</span>
                <span class="ranking-user">${ranking.userName}</span>
            </div>
            <div class="ranking-stats">
                <div class="ranking-water">${ranking.totalWater}ml</div>
                <div class="ranking-points">${ranking.points} pts</div>
            </div>
        `;
        rankingList.appendChild(rankingEl);
    });
}

// Renderizar ranking semanal
function renderWeeklyRanking(rankings) {
    const rankingList = document.getElementById('weeklyRankingList');
    if (!rankingList) return;
    
    rankingList.innerHTML = '';
    
    if (!rankings || rankings.length === 0) {
        rankingList.innerHTML = '<p style="text-align: center; color: #6a9955;">Nenhum ranking disponível</p>';
        return;
    }
    
    rankings.slice(0, 10).forEach((ranking, index) => {
        const rankingEl = document.createElement('div');
        rankingEl.className = `ranking-item ${index < 3 ? ['first', 'second', 'third'][index] : ''}`;
        
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
        
        rankingEl.innerHTML = `
            <div class="ranking-position ${index < 3 ? ['first', 'second', 'third'][index] : ''}">
                <span class="ranking-medal">${medal}</span>
                <span class="ranking-user">${ranking.userName}</span>
            </div>
            <div class="ranking-stats">
                <div class="ranking-water">${ranking.totalWater}ml</div>
                <div class="ranking-points">${ranking.totalPoints} pts</div>
            </div>
        `;
        rankingList.appendChild(rankingEl);
    });
} 