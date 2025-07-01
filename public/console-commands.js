// 🎮 Comandos do Console do Navegador - WaterLog
// Cole este código no console do navegador (F12) para usar os comandos

// Função para mostrar usuários logados
async function showUsers() {
    try {
        const response = await fetch('/api/console/users');
        const data = await response.json();
        
        console.log('👥 USUÁRIOS LOGADOS:');
        console.log('='.repeat(50));
        
        if (data.total === 0) {
            console.log('❌ Nenhum usuário logado no momento');
        } else {
            data.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.userName} (ID: ${user.userId})`);
                console.log(`   📱 Socket: ${user.socketId}`);
                console.log(`   ⏰ Conectado em: ${user.connectedTime}`);
                console.log('');
            });
            
            console.log(`📊 Total: ${data.total} usuário(s) logado(s)`);
        }
        console.log('='.repeat(50));
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
    }
}

// Função para mostrar estatísticas
async function showStats() {
    try {
        const response = await fetch('/api/console/stats');
        const data = await response.json();
        
        console.log('📈 ESTATÍSTICAS GERAIS:');
        console.log('='.repeat(50));
        console.log(`👤 Total de usuários cadastrados: ${data.totalUsers}`);
        console.log(`🍶 Total de garrafas: ${data.totalBottles}`);
        console.log(`💧 Total de registros de água: ${data.totalWaterRecords}`);
        console.log(`🔔 Total de notificações: ${data.totalNotifications}`);
        console.log(`🟢 Usuários online: ${data.onlineUsers}`);
        console.log(`⏱️ Tempo de atividade: ${Math.floor(data.serverUptime / 60)} minutos`);
        console.log(`🚀 Servidor iniciado: ${new Date(data.serverStartTime).toLocaleString('pt-BR')}`);
        console.log('='.repeat(50));
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
    }
}

// Função para mostrar todas as informações
async function showInfo() {
    try {
        const response = await fetch('/api/console/info');
        const data = await response.json();
        
        console.log('🔍 INFORMAÇÕES COMPLETAS:');
        console.log('='.repeat(50));
        
        // Estatísticas
        console.log('📊 ESTATÍSTICAS:');
        console.log(`👤 Usuários cadastrados: ${data.stats.totalUsers}`);
        console.log(`🍶 Garrafas: ${data.stats.totalBottles}`);
        console.log(`💧 Registros de água: ${data.stats.totalWaterRecords}`);
        console.log(`🔔 Notificações: ${data.stats.totalNotifications}`);
        console.log(`⏱️ Tempo de atividade: ${Math.floor(data.stats.serverUptime / 60)} minutos`);
        console.log('');
        
        // Usuários online
        console.log('👥 USUÁRIOS ONLINE:');
        if (data.onlineUsers.length === 0) {
            console.log('❌ Nenhum usuário online');
        } else {
            data.onlineUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.userName} (ID: ${user.userId})`);
                console.log(`   📱 Socket: ${user.socketId}`);
                console.log(`   ⏰ Conectado: ${user.connectedTime}`);
            });
        }
        console.log('='.repeat(50));
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar informações:', error);
    }
}

// Função para mostrar ajuda
function showHelp() {
    console.log('🛠️ COMANDOS DISPONÍVEIS NO CONSOLE:');
    console.log('='.repeat(50));
    console.log('showUsers()  - Mostrar usuários logados');
    console.log('showStats()  - Mostrar estatísticas gerais');
    console.log('showInfo()   - Mostrar todas as informações');
    console.log('showHelp()   - Mostrar esta ajuda');
    console.log('broadcastToast("mensagem", "tipo") - Enviar toast para todos');
    console.log('testSocketIO() - Testar conexão Socket.IO');
    console.log('testWebSocketDNS() - Testar WebSocket com DNS externo');
    console.log('reconnectSocket() - Forçar reconexão do Socket.IO');
    console.log('='.repeat(50));
    console.log('💡 Dica: Digite o nome da função seguido de () para executar');
    console.log('💡 Exemplo: broadcastToast("Olá todos!", "success")');
}

// Função para monitorar usuários em tempo real
function startMonitoring() {
    console.log('🔍 Iniciando monitoramento em tempo real...');
    console.log('💡 Pressione Ctrl+C para parar');
    
    const interval = setInterval(() => {
        showUsers();
    }, 5000); // Atualiza a cada 5 segundos
    
    // Retorna função para parar o monitoramento
    return () => {
        clearInterval(interval);
        console.log('⏹️ Monitoramento parado');
    };
}

// Função para buscar usuário específico
async function findUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
            const user = await response.json();
            console.log('👤 USUÁRIO ENCONTRADO:');
            console.log('='.repeat(30));
            console.log(`Nome: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`ID: ${user.id}`);
            console.log(`Criado em: ${new Date(user.createdAt).toLocaleString('pt-BR')}`);
            console.log(`Total de água: ${user.totalWaterDrunk}ml`);
            console.log('='.repeat(30));
            return user;
        } else {
            console.log('❌ Usuário não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
    }
}

// Função para mostrar top bebedores
async function showTopDrinkers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const sortedUsers = users
            .sort((a, b) => b.totalWaterDrunk - a.totalWaterDrunk)
            .slice(0, 5);
        
        console.log('🏆 TOP 5 BEBEDORES:');
        console.log('='.repeat(40));
        sortedUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            console.log(`${medal} ${index + 1}. ${user.name}: ${user.totalWaterDrunk}ml`);
        });
        console.log('='.repeat(40));
        
        return sortedUsers;
    } catch (error) {
        console.error('❌ Erro ao buscar top bebedores:', error);
    }
}

// Função para disparar toast para todos os usuários
async function broadcastToast(message, type = 'info') {
    try {
        const response = await fetch('/api/console/broadcast-toast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, type })
        });
        if (response.ok) {
            console.log(`✅ Toast enviado para todos: "${message}"`);
        } else {
            const data = await response.json();
            console.error('❌ Erro ao enviar toast:', data.error);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar toast:', error);
    }
}

// Função para testar Socket.IO
function testSocketIO() {
    console.log('🔌 Testando Socket.IO...');
    
    // Verificar se o socket existe
    if (typeof io === 'undefined') {
        console.error('❌ Socket.IO não está carregado!');
        return;
    }
    
    // Verificar se há uma conexão ativa
    if (!window.socket || !window.socket.connected) {
        console.error('❌ Socket não está conectado!');
        return;
    }
    
    console.log('✅ Socket.IO está funcionando!');
    console.log('📡 ID do Socket:', window.socket.id);
    console.log('🔗 Status da conexão:', window.socket.connected);
    
    // Testar envio de evento
    window.socket.emit('test_event', { message: 'Teste do console' });
    console.log('📤 Evento de teste enviado');
    
    return {
        socketId: window.socket.id,
        connected: window.socket.connected,
        io: typeof io !== 'undefined'
    };
}

// Função para testar conectividade externa
async function testExternalAccess() {
    console.log('🌐 Testando conectividade externa...');
    
    try {
        // Testar se consegue acessar APIs externas
        const response = await fetch('https://httpbin.org/ip');
        const data = await response.json();
        console.log('✅ Conectividade externa OK');
        console.log('🌍 IP público detectado:', data.origin);
        
        // Testar se o servidor está acessível
        const serverResponse = await fetch('/api/console/users');
        if (serverResponse.ok) {
            console.log('✅ Servidor local acessível');
        } else {
            console.log('❌ Servidor local não acessível');
        }
        
        return {
            externalAccess: true,
            publicIP: data.origin,
            serverAccess: serverResponse.ok
        };
    } catch (error) {
        console.error('❌ Erro na conectividade externa:', error);
        return {
            externalAccess: false,
            error: error.message
        };
    }
}

// Função para forçar reconexão do Socket.IO
function reconnectSocket() {
    console.log('🔄 Forçando reconexão do Socket.IO...');
    
    if (window.socket) {
        window.socket.disconnect();
        console.log('🔌 Socket desconectado');
        
        setTimeout(() => {
            window.socket.connect();
            console.log('🔌 Tentando reconectar...');
        }, 1000);
    } else {
        console.log('❌ Socket não encontrado');
    }
}

// Função para testar WebSocket com DNS externo
function testWebSocketDNS() {
    console.log('🌐 Testando WebSocket com DNS externo...');
    
    // Verificar configuração atual
    console.log('📍 Hostname atual:', window.location.hostname);
    console.log('🔗 URL completa:', window.location.href);
    console.log('🌍 Origin:', window.location.origin);
    
    // Verificar se o Socket.IO está configurado corretamente
    if (window.socket) {
        console.log('✅ Socket.IO encontrado');
        console.log('📡 Socket ID:', window.socket.id);
        console.log('🔗 Conectado:', window.socket.connected);
        console.log('🌐 URL de conexão:', window.socketUrl || 'Não definida');
        
        // Testar conexão
        if (window.socket.connected) {
            console.log('✅ WebSocket conectado!');
            window.socket.emit('test_dns', { 
                hostname: window.location.hostname,
                timestamp: new Date().toISOString()
            });
            console.log('📤 Evento de teste enviado');
        } else {
            console.log('❌ WebSocket não conectado');
            console.log('💡 Tente: reconnectSocket()');
        }
    } else {
        console.log('❌ Socket.IO não encontrado');
        console.log('💡 Recarregue a página (Ctrl+F5)');
    }
    
    // Testar resolução DNS
    fetch('/api/console/users')
        .then(response => {
            if (response.ok) {
                console.log('✅ API HTTP funcionando');
            } else {
                console.log('❌ API HTTP com erro:', response.status);
            }
        })
        .catch(error => {
            console.log('❌ Erro na API HTTP:', error.message);
        });
}

// Função para limpar todos os registros de água do usuário logado
async function clearWaterLog() {
    try {
        if (!window.currentUser || !window.currentUser.id) {
            console.error('❌ Nenhum usuário logado. Faça login primeiro.');
            return;
        }
        // Buscar todos os registros do usuário
        const response = await fetch(`/api/users/${window.currentUser.id}/records`);
        if (!response.ok) {
            console.error('❌ Erro ao buscar registros do usuário.');
            return;
        }
        const records = await response.json();
        if (!Array.isArray(records) || records.length === 0) {
            console.log('ℹ️ Nenhum registro de água para deletar.');
            return;
        }
        let deleted = 0;
        for (const record of records) {
            const delResp = await fetch(`/api/users/${window.currentUser.id}/records/${record.id}`, { method: 'DELETE' });
            if (delResp.ok) deleted++;
        }
        console.log(`🧹 ${deleted} registro(s) de água deletado(s) com sucesso!`);
        // Atualizar UI se funções globais existirem
        if (typeof loadUserRecords === 'function') loadUserRecords();
        if (typeof loadStats === 'function') loadStats();
        if (typeof loadNotifications === 'function') loadNotifications();
    } catch (error) {
        console.error('❌ Erro ao limpar registros de água:', error);
    }
}

// Função para limpar todos os registros de água de todos os usuários (admin)
async function clearAllWaterLogs() {
    try {
        const usersResp = await fetch('/api/users');
        if (!usersResp.ok) {
            console.error('❌ Erro ao buscar usuários.');
            return;
        }
        const users = await usersResp.json();
        let totalDeleted = 0;
        for (const user of users) {
            const recordsResp = await fetch(`/api/users/${user.id}/records`);
            if (!recordsResp.ok) continue;
            const records = await recordsResp.json();
            if (!Array.isArray(records) || records.length === 0) continue;
            for (const record of records) {
                const delResp = await fetch(`/api/users/${user.id}/records/${record.id}`, { method: 'DELETE' });
                if (delResp.ok) totalDeleted++;
            }
        }
        console.log(`🧹 ${totalDeleted} registro(s) de água deletado(s) de todos os usuários!`);
        if (typeof loadUserRecords === 'function') loadUserRecords();
        if (typeof loadStats === 'function') loadStats();
        if (typeof loadNotifications === 'function') loadNotifications();
    } catch (error) {
        console.error('❌ Erro ao limpar registros de todos:', error);
    }
}

// Mostrar mensagem de boas-vindas
console.log('🎮 Console do WaterLog carregado!');
console.log('💡 Digite showHelp() para ver os comandos disponíveis');
console.log('🌐 Servidor: http://waterlog.servebeer.com');

// Expor funções globalmente
window.WaterLog = {
    showUsers,
    showStats,
    showInfo,
    showHelp,
    startMonitoring,
    findUser,
    showTopDrinkers,
    broadcastToast
};

// Expor funções diretamente no escopo global para facilitar o uso no console
window.showUsers = showUsers;
window.showStats = showStats;
window.showInfo = showInfo;
window.showHelp = showHelp;
window.startMonitoring = startMonitoring;
window.findUser = findUser;
window.showTopDrinkers = showTopDrinkers;
window.broadcastToast = broadcastToast;
window.testSocketIO = testSocketIO;
window.testExternalAccess = testExternalAccess;
window.testWebSocketDNS = testWebSocketDNS;
window.reconnectSocket = reconnectSocket;
window.clearWaterLog = clearWaterLog;
window.clearAllWaterLogs = clearAllWaterLogs;

// Sincronizar window.currentUser com a variável global do app
if (typeof currentUser !== 'undefined') {
    window.currentUser = currentUser;
} 