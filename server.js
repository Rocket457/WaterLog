const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { Server } = require('socket.io');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'],
  allowEIO3: true
});

const PORT = 999;
const HOST = '0.0.0.0'; // Aceita conexões de qualquer IP

// Configuração do Web Push
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:waterlog@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados JSON
const DB_FILE = 'database.json';

// Função para carregar dados do banco
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar banco de dados:', error);
  }
  
  // Estrutura inicial do banco
  return {
    users: [],
    bottles: [],
    waterRecords: [],
    notifications: []
  };
}

// Função para salvar dados no banco
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar banco de dados:', error);
  }
}

// Função para limpar notificações antigas
function clearOldNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia atual
  
  const oldNotifications = db.notifications.filter(notification => {
    const notificationDate = new Date(notification.timestamp);
    return notificationDate < today;
  });
  
  if (oldNotifications.length > 0) {
    db.notifications = db.notifications.filter(notification => {
      const notificationDate = new Date(notification.timestamp);
      return notificationDate >= today;
    });
    
    saveDatabase(db);
    
    console.log(`🧹 Limpeza automática: ${oldNotifications.length} notificações antigas removidas`);
    
    // Notificar todos os clientes sobre a limpeza
    io.emit('notifications_cleared', {
      message: 'Atividades antigas foram limpas automaticamente',
      clearedCount: oldNotifications.length
    });
  }
}

// Função para agendar limpeza diária à meia-noite
function scheduleDailyCleanup() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Meia-noite
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Agendar primeira limpeza para meia-noite
  setTimeout(() => {
    clearOldNotifications();
    
    // Agendar limpeza diária (24 horas)
    setInterval(clearOldNotifications, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log(`⏰ Agendador configurado: limpeza automática à meia-noite`);
  console.log(`   Próxima limpeza em: ${tomorrow.toLocaleString('pt-BR')}`);
}

// Carregar banco inicial
let db = loadDatabase();

// Rastrear usuários conectados
let connectedUsers = new Map(); // socketId -> { userId, userName, connectedAt }

// Iniciar agendador de limpeza
scheduleDailyCleanup();

// Sistema de console interativo
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para mostrar usuários logados
function showLoggedUsers() {
  console.log('\n👥 USUÁRIOS LOGADOS:');
  console.log('='.repeat(50));
  
  if (connectedUsers.size === 0) {
    console.log('❌ Nenhum usuário logado no momento');
  } else {
    let index = 1;
    connectedUsers.forEach((userData, socketId) => {
      const connectedTime = new Date(userData.connectedAt).toLocaleTimeString('pt-BR');
      console.log(`${index}. ${userData.userName} (ID: ${userData.userId})`);
      console.log(`   📱 Socket: ${socketId}`);
      console.log(`   ⏰ Conectado em: ${connectedTime}`);
      console.log('');
      index++;
    });
    
    console.log(`📊 Total: ${connectedUsers.size} usuário(s) logado(s)`);
  }
  console.log('='.repeat(50));
}

// Função para mostrar estatísticas gerais
function showGeneralStats() {
  console.log('\n📈 ESTATÍSTICAS GERAIS:');
  console.log('='.repeat(50));
  console.log(`👤 Total de usuários cadastrados: ${db.users.length}`);
  console.log(`🍶 Total de garrafas: ${db.bottles.length}`);
  console.log(`💧 Total de registros de água: ${db.waterRecords.length}`);
  console.log(`🔔 Total de notificações: ${db.notifications.length}`);
  console.log(`🟢 Usuários online: ${connectedUsers.size}`);
  console.log('='.repeat(50));
}

// Função para mostrar ajuda dos comandos
function showHelp() {
  console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
  console.log('='.repeat(50));
  console.log('users     - Mostrar usuários logados');
  console.log('stats     - Mostrar estatísticas gerais');
  console.log('help      - Mostrar esta ajuda');
  console.log('clear     - Limpar console');
  console.log('quit      - Sair do console (servidor continua rodando)');
  console.log('='.repeat(50));
}

// Função para processar comandos do console
function processConsoleCommand(command) {
  const cmd = command.trim().toLowerCase();
  
  switch (cmd) {
    case 'users':
      showLoggedUsers();
      break;
    case 'stats':
      showGeneralStats();
      break;
    case 'help':
      showHelp();
      break;
    case 'clear':
      console.clear();
      break;
    case 'quit':
      console.log('👋 Saindo do console interativo...');
      rl.close();
      return;
    case '':
      // Comando vazio, não fazer nada
      break;
    default:
      console.log(`❌ Comando não reconhecido: "${command}"`);
      console.log('💡 Digite "help" para ver os comandos disponíveis');
  }
  
  // Continuar aguardando comandos
  rl.question('\n🔧 Digite um comando (ou "help" para ajuda): ', processConsoleCommand);
}

// Iniciar console interativo após 2 segundos
setTimeout(() => {
  console.log('\n🎮 Console interativo ativado!');
  console.log('💡 Digite "help" para ver os comandos disponíveis');
  rl.question('\n🔧 Digite um comando (ou "help" para ajuda): ', processConsoleCommand);
}, 2000);

// Rotas da API

// API para console do navegador - Usuários logados
app.get('/api/console/users', (req, res) => {
  const usersList = Array.from(connectedUsers.entries()).map(([socketId, userData]) => ({
    socketId,
    userId: userData.userId,
    userName: userData.userName,
    connectedAt: userData.connectedAt,
    connectedTime: new Date(userData.connectedAt).toLocaleTimeString('pt-BR')
  }));
  
  res.json({
    total: connectedUsers.size,
    users: usersList
  });
});

// API para console do navegador - Estatísticas gerais
app.get('/api/console/stats', (req, res) => {
  res.json({
    totalUsers: db.users.length,
    totalBottles: db.bottles.length,
    totalWaterRecords: db.waterRecords.length,
    totalNotifications: db.notifications.length,
    onlineUsers: connectedUsers.size,
    serverUptime: process.uptime(),
    serverStartTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
  });
});

// API para console do navegador - Todas as informações
app.get('/api/console/info', (req, res) => {
  const usersList = Array.from(connectedUsers.entries()).map(([socketId, userData]) => ({
    socketId,
    userId: userData.userId,
    userName: userData.userName,
    connectedAt: userData.connectedAt,
    connectedTime: new Date(userData.connectedAt).toLocaleTimeString('pt-BR')
  }));
  
  res.json({
    stats: {
      totalUsers: db.users.length,
      totalBottles: db.bottles.length,
      totalWaterRecords: db.waterRecords.length,
      totalNotifications: db.notifications.length,
      onlineUsers: connectedUsers.size,
      serverUptime: process.uptime(),
      serverStartTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
    },
    onlineUsers: usersList
  });
});

// Listar todos os usuários
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

// Buscar usuário por email
app.get('/api/users/email/:email', (req, res) => {
  const { email } = req.params;
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json(user);
});

// Buscar usuário por ID
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json(user);
});

// Buscar usuário por ID
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json(user);
});

// Criar novo usuário
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  
  // Verificar se usuário já existe
  const existingUser = db.users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    createdAt: new Date().toISOString(),
    totalWaterDrunk: 0,
    dailyGoal: 2000, // Valor padrão para meta diária
    bottles: []
  };
  
  db.users.push(newUser);
  saveDatabase(db);
  
  res.status(201).json(newUser);
});

// Listar garrafas de um usuário
app.get('/api/users/:userId/bottles', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const userBottles = db.bottles.filter(bottle => bottle.userId === userId);
  res.json(userBottles);
});

// Criar nova garrafa
app.post('/api/users/:userId/bottles', (req, res) => {
  const { userId } = req.params;
  const { name, capacity } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Nome e capacidade são obrigatórios' });
  }
  
  const newBottle = {
    id: Date.now().toString(),
    userId,
    name,
    capacity: parseInt(capacity),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  db.bottles.push(newBottle);
  saveDatabase(db);
  
  res.status(201).json(newBottle);
});

// Registrar consumo de água
app.post('/api/users/:userId/drink', (req, res) => {
  const { userId } = req.params;
  const { bottleId, amount } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const bottle = db.bottles.find(b => b.id === bottleId && b.userId === userId);
  if (!bottle) {
    return res.status(404).json({ error: 'Garrafa não encontrada' });
  }
  
  const waterRecord = {
    id: Date.now().toString(),
    userId,
    bottleId,
    amount: parseInt(amount),
    timestamp: new Date().toISOString()
  };
  
  db.waterRecords.push(waterRecord);
  
  // Atualizar total de água bebida pelo usuário
  user.totalWaterDrunk += parseInt(amount);
  
  saveDatabase(db);
  
  // Enviar notificação para todos os usuários
  const notification = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    message: `${user.name} bebeu ${amount}ml de água!`,
    timestamp: new Date().toISOString(),
    type: 'water_drunk'
  };
  
  db.notifications.push(notification);
  saveDatabase(db);
  
  // Emitir notificação via Socket.IO
  io.emit('water_drunk', {
    user: user.name,
    amount: amount,
    message: `${user.name} bebeu ${amount}ml de água!`
  });
  
  res.status(201).json(waterRecord);
});

// Marcar garrafa como vazia
app.post('/api/users/:userId/bottles/:bottleId/empty', (req, res) => {
  const { userId, bottleId } = req.params;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const bottle = db.bottles.find(b => b.id === bottleId && b.userId === userId);
  if (!bottle) {
    return res.status(404).json({ error: 'Garrafa não encontrada' });
  }
  
  // Registrar que a garrafa foi esvaziada
  const waterRecord = {
    id: Date.now().toString(),
    userId,
    bottleId,
    amount: bottle.capacity,
    timestamp: new Date().toISOString(),
    isFullBottle: true
  };
  
  db.waterRecords.push(waterRecord);
  
  // Atualizar total de água bebida pelo usuário
  user.totalWaterDrunk += bottle.capacity;
  
  saveDatabase(db);
  
  // Enviar notificação para todos os usuários
  const notification = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    message: `${user.name} esvaziou uma garrafa de ${bottle.capacity}ml!`,
    timestamp: new Date().toISOString(),
    type: 'bottle_empty'
  };
  
  db.notifications.push(notification);
  saveDatabase(db);
  
  // Emitir notificação via Socket.IO
  io.emit('bottle_empty', {
    user: user.name,
    bottleName: bottle.name,
    capacity: bottle.capacity,
    message: `${user.name} esvaziou uma garrafa de ${bottle.capacity}ml!`
  });
  
  res.json({ message: 'Garrafa marcada como vazia', waterRecord });
});

// Encher garrafa de água
app.post('/api/users/:userId/bottles/:bottleId/fill', (req, res) => {
  const { userId, bottleId } = req.params;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const bottle = db.bottles.find(b => b.id === bottleId && b.userId === userId);
  if (!bottle) {
    return res.status(404).json({ error: 'Garrafa não encontrada' });
  }
  
  // Enviar notificação para todos os usuários
  const notification = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    message: `${user.name} encheu uma garrafa de ${bottle.capacity}ml!`,
    timestamp: new Date().toISOString(),
    type: 'bottle_filled'
  };
  
  db.notifications.push(notification);
  saveDatabase(db);
  
  // Emitir notificação via Socket.IO
  io.emit('bottle_filled', {
    user: user.name,
    bottleName: bottle.name,
    capacity: bottle.capacity,
    message: `${user.name} encheu uma garrafa de ${bottle.capacity}ml!`
  });
  
  res.json({ message: 'Garrafa marcada como cheia', bottle });
});

// Obter estatísticas do usuário
app.get('/api/users/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const userRecords = db.waterRecords.filter(record => record.userId === userId);
  const today = new Date().toDateString();
  const todayRecords = userRecords.filter(record => 
    new Date(record.timestamp).toDateString() === today
  );
  
  const todayTotal = todayRecords.reduce((sum, record) => sum + record.amount, 0);
  
  const stats = {
    totalWaterDrunk: user.totalWaterDrunk,
    todayTotal,
    totalRecords: userRecords.length,
    todayRecords: todayRecords.length
  };
  
  res.json(stats);
});

// Obter notificações recentes
app.get('/api/notifications', (req, res) => {
  const recentNotifications = db.notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);
  
  res.json(recentNotifications);
});

// Obter registros de água do usuário
app.get('/api/users/:userId/records', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const userRecords = db.waterRecords
    .filter(record => record.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Adicionar informações da garrafa para cada registro
  const recordsWithBottleInfo = userRecords.map(record => {
    const bottle = db.bottles.find(b => b.id === record.bottleId);
    return {
      ...record,
      bottleName: bottle ? bottle.name : 'Garrafa não encontrada'
    };
  });
  
  res.json(recordsWithBottleInfo);
});

// Deletar registro de água (apenas do próprio usuário)
app.delete('/api/users/:userId/records/:recordId', (req, res) => {
  const { userId, recordId } = req.params;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const recordIndex = db.waterRecords.findIndex(record => 
    record.id === recordId && record.userId === userId
  );
  
  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Registro não encontrado ou não autorizado' });
  }
  
  const record = db.waterRecords[recordIndex];
  
  // Remover o registro
  db.waterRecords.splice(recordIndex, 1);
  
  // Atualizar total de água bebida pelo usuário
  user.totalWaterDrunk -= record.amount;
  
  saveDatabase(db);
  
  // Enviar notificação
  const notification = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    message: `${user.name} removeu um registro de ${record.amount}ml`,
    timestamp: new Date().toISOString(),
    type: 'record_deleted'
  };
  
  db.notifications.push(notification);
  saveDatabase(db);
  
  // Emitir notificação via Socket.IO
  io.emit('record_deleted', {
    user: user.name,
    amount: record.amount,
    message: `${user.name} removeu um registro de ${record.amount}ml`
  });
  
  res.json({ message: 'Registro deletado com sucesso' });
});

// Editar registro de água (apenas do próprio usuário)
app.put('/api/users/:userId/records/:recordId', (req, res) => {
  const { userId, recordId } = req.params;
  const { amount } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const record = db.waterRecords.find(r => 
    r.id === recordId && r.userId === userId
  );
  
  if (!record) {
    return res.status(404).json({ error: 'Registro não encontrado ou não autorizado' });
  }
  
  const oldAmount = record.amount;
  const newAmount = parseInt(amount);
  
  if (!newAmount || newAmount <= 0) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }
  
  // Atualizar o registro
  record.amount = newAmount;
  record.timestamp = new Date().toISOString();
  
  // Atualizar total de água bebida pelo usuário
  user.totalWaterDrunk = user.totalWaterDrunk - oldAmount + newAmount;
  
  saveDatabase(db);
  
  // Enviar notificação
  const notification = {
    id: Date.now().toString(),
    userId,
    userName: user.name,
    message: `${user.name} editou um registro de ${oldAmount}ml para ${newAmount}ml`,
    timestamp: new Date().toISOString(),
    type: 'record_edited'
  };
  
  db.notifications.push(notification);
  saveDatabase(db);
  
  // Emitir notificação via Socket.IO
  io.emit('record_edited', {
    user: user.name,
    oldAmount,
    newAmount,
    message: `${user.name} editou um registro de ${oldAmount}ml para ${newAmount}ml`
  });
  
  res.json({ message: 'Registro editado com sucesso', record });
});

// API para console do navegador - Disparar toast para todos
app.post('/api/console/broadcast-toast', (req, res) => {
  const { message, type } = req.body;
  console.log('📢 Broadcast request recebido:', { message, type });
  
  if (!message) {
    console.log('❌ Erro: Mensagem obrigatória');
    return res.status(400).json({ error: 'Mensagem obrigatória' });
  }
  
  console.log(`📡 Emitindo evento 'admin_broadcast_toast' para ${io.engine.clientsCount} clientes`);
  io.emit('admin_broadcast_toast', { message, type: type || 'info' });
  console.log('✅ Evento emitido com sucesso');
  
  res.json({ ok: true, clientsCount: io.engine.clientsCount });
});

// API para obter chave pública do VAPID
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// API para salvar subscription de notificação push
app.post('/api/push-subscription', (req, res) => {
  const { userId, subscription } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  user.pushSubscription = subscription;
  saveDatabase(db);
  
  console.log(`📱 Subscription salva para ${user.name}`);
  res.json({ message: 'Subscription salva com sucesso' });
});

// API para enviar notificação push
app.post('/api/send-push-notification', (req, res) => {
  const { userId, title, body, data } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user || !user.pushSubscription) {
    return res.status(404).json({ error: 'Usuário não encontrado ou sem subscription' });
  }
  
  const payload = JSON.stringify({
    title: title || 'WaterLog',
    body: body || 'Você tem uma nova notificação!',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cpath fill="%233794ff" d="M32 4C32 4 12 28 12 42c0 11 9 18 20 18s20-7 20-18C52 28 32 4 32 4z"/%3E%3Cellipse fill="%23b3e0ff" cx="32" cy="46" rx="10" ry="6"/%3E%3C/svg%3E',
    data: data || { url: '/' }
  });
  
  webpush.sendNotification(user.pushSubscription, payload)
    .then(() => {
      console.log(`📱 Notificação push enviada para ${user.name}`);
      res.json({ message: 'Notificação enviada com sucesso' });
    })
    .catch((error) => {
      console.error('Erro ao enviar notificação push:', error);
      res.status(500).json({ error: 'Erro ao enviar notificação' });
    });
});

// API para salas
app.get('/api/rooms', (req, res) => {
  res.json(db.rooms || []);
});

app.post('/api/rooms', (req, res) => {
  const { name, description, maxMembers, isPublic, createdBy } = req.body;
  
  if (!name || !createdBy) {
    return res.status(400).json({ error: 'Nome da sala e criador são obrigatórios' });
  }
  
  const room = {
    id: `room_${Date.now()}`,
    name,
    description: description || '',
    maxMembers: maxMembers || 50,
    isPublic: isPublic !== false,
    createdAt: new Date().toISOString(),
    members: [createdBy],
    createdBy
  };
  
  if (!db.rooms) db.rooms = [];
  db.rooms.push(room);
  saveDatabase(db);
  
  // Notificar todos os usuários sobre a nova sala
  io.emit('room_created', room);
  
  res.json(room);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = db.rooms?.find(r => r.id === roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  res.json(room);
});

app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  
  const room = db.rooms?.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  if (room.members.includes(userId)) {
    return res.status(400).json({ error: 'Usuário já está na sala' });
  }
  
  if (room.members.length >= room.maxMembers) {
    return res.status(400).json({ error: 'Sala está cheia' });
  }
  
  room.members.push(userId);
  
  // Atualizar usuário
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.currentRoom = roomId;
  }
  
  saveDatabase(db);
  
  // Notificar membros da sala
  io.to(roomId).emit('user_joined_room', { userId, roomId });
  
  res.json({ message: 'Entrou na sala com sucesso' });
});

app.post('/api/rooms/:roomId/leave', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  
  const room = db.rooms?.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  const memberIndex = room.members.indexOf(userId);
  if (memberIndex === -1) {
    return res.status(400).json({ error: 'Usuário não está na sala' });
  }
  
  room.members.splice(memberIndex, 1);
  
  // Atualizar usuário
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.currentRoom = null;
  }
  
  saveDatabase(db);
  
  // Notificar membros da sala
  io.to(roomId).emit('user_left_room', { userId, roomId });
  
  res.json({ message: 'Saiu da sala com sucesso' });
});

// Conectar a uma sala (estar ativo nela)
app.post('/api/rooms/:roomId/connect', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  
  const room = db.rooms?.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  if (!room.members.includes(userId)) {
    return res.status(400).json({ error: 'Você precisa ser membro da sala para se conectar' });
  }
  
  // Atualizar usuário - desconectar de qualquer sala anterior
  const user = db.users.find(u => u.id === userId);
  if (user) {
    const previousRoom = user.currentRoom;
    user.currentRoom = roomId;
    
    // Notificar sala anterior se existir
    if (previousRoom && previousRoom !== roomId) {
      io.to(previousRoom).emit('user_disconnected', { userId, roomId: previousRoom });
    }
    
    // Notificar nova sala
    io.to(roomId).emit('user_connected', { userId, roomId });
  }
  
  saveDatabase(db);
  
  res.json({ message: 'Conectado à sala com sucesso' });
});

// Desconectar de uma sala (mas permanecer como membro)
app.post('/api/rooms/:roomId/disconnect', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  
  const room = db.rooms?.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  // Atualizar usuário
  const user = db.users.find(u => u.id === userId);
  if (user && user.currentRoom === roomId) {
    user.currentRoom = null;
    
    // Notificar sala
    io.to(roomId).emit('user_disconnected', { userId, roomId });
  }
  
  saveDatabase(db);
  
  res.json({ message: 'Desconectado da sala com sucesso' });
});

// Obter salas do usuário com status de conexão
app.get('/api/users/:userId/rooms', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const userRooms = db.rooms?.filter(room => room.members.includes(userId)).map(room => ({
    ...room,
    isConnected: user.currentRoom === room.id,
    connectedMembers: room.members.filter(memberId => {
      const member = db.users.find(u => u.id === memberId);
      return member && member.currentRoom === room.id;
    }).length
  })) || [];
  
  res.json(userRooms);
});

// API para gamificação
app.get('/api/rankings/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const dailyRanking = db.dailyRankings?.find(r => r.date === today);
  
  if (!dailyRanking) {
    // Criar ranking do dia se não existir
    const rankings = db.users.map(user => ({
      userId: user.id,
      userName: user.name,
      totalWater: 0,
      points: 0
    }));
    
    const newRanking = {
      date: today,
      rankings
    };
    
    if (!db.dailyRankings) db.dailyRankings = [];
    db.dailyRankings.push(newRanking);
    saveDatabase(db);
    
    res.json(newRanking);
  } else {
    res.json(dailyRanking);
  }
});

app.get('/api/rankings/weekly', (req, res) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  // Calcular ranking semanal baseado nos rankings diários
  const weeklyRankings = {};
  
  db.dailyRankings?.forEach(daily => {
    if (daily.date >= weekStartStr) {
      daily.rankings.forEach(ranking => {
        if (!weeklyRankings[ranking.userId]) {
          weeklyRankings[ranking.userId] = {
            userId: ranking.userId,
            userName: ranking.userName,
            totalWater: 0,
            totalPoints: 0
          };
        }
        weeklyRankings[ranking.userId].totalWater += ranking.totalWater;
        weeklyRankings[ranking.userId].totalPoints += ranking.points;
      });
    }
  });
  
  const weeklyRanking = {
    weekStart: weekStartStr,
    rankings: Object.values(weeklyRankings).sort((a, b) => b.totalPoints - a.totalPoints)
  };
  
  res.json(weeklyRanking);
});

app.get('/api/users/:userId/points', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const pointHistory = db.pointHistory?.filter(p => p.userId === userId) || [];
  
  res.json({
    points: user.points || 0,
    history: pointHistory
  });
});

// Função para calcular e distribuir pontos diários
function calculateDailyPoints() {
  const today = new Date().toISOString().split('T')[0];
  const dailyRanking = db.dailyRankings?.find(r => r.date === today);
  
  if (!dailyRanking) return;
  
  // Calcular consumo total de água para hoje
  const todayRecords = db.waterRecords.filter(record => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
    return recordDate === today;
  });
  
  // Agrupar por usuário
  const userWaterConsumption = {};
  todayRecords.forEach(record => {
    if (!userWaterConsumption[record.userId]) {
      userWaterConsumption[record.userId] = 0;
    }
    userWaterConsumption[record.userId] += record.amount;
  });
  
  // Atualizar rankings
  dailyRanking.rankings.forEach(ranking => {
    ranking.totalWater = userWaterConsumption[ranking.userId] || 0;
  });
  
  // Ordenar por consumo de água
  dailyRanking.rankings.sort((a, b) => b.totalWater - a.totalWater);
  
  // Distribuir pontos
  const pointsDistribution = [15, 10, 5, 3, 1]; // 1º, 2º, 3º, 4º, 5º lugares
  
  dailyRanking.rankings.forEach((ranking, index) => {
    const points = pointsDistribution[index] || 0;
    ranking.points = points;
    
    // Adicionar pontos ao usuário
    const user = db.users.find(u => u.id === ranking.userId);
    if (user) {
      user.points = (user.points || 0) + points;
      
      // Registrar no histórico
      if (points > 0) {
        const pointRecord = {
          id: `point_${Date.now()}_${ranking.userId}`,
          userId: ranking.userId,
          points,
          reason: `${index + 1}º lugar no ranking diário`,
          timestamp: new Date().toISOString()
        };
        
        if (!db.pointHistory) db.pointHistory = [];
        db.pointHistory.push(pointRecord);
      }
    }
  });
  
  saveDatabase(db);
  
  // Notificar usuários sobre os pontos ganhos
  dailyRanking.rankings.forEach((ranking, index) => {
    if (ranking.points > 0) {
      io.emit('points_earned', {
        userId: ranking.userId,
        userName: ranking.userName,
        points: ranking.points,
        position: index + 1,
        totalWater: ranking.totalWater
      });
    }
  });
}

// Agendar cálculo de pontos diário à meia-noite
function scheduleDailyPointsCalculation() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    calculateDailyPoints();
    
    // Agendar para todos os dias
    setInterval(calculateDailyPoints, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log(`🏆 Agendador de pontos configurado: cálculo diário à meia-noite`);
  console.log(`   Próximo cálculo em: ${tomorrow.toLocaleString('pt-BR')}`);
}

// Iniciar agendador de pontos
scheduleDailyPointsCalculation();

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO - Gerenciamento de conexões
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
    
    // Remover usuário da lista de conectados
    if (connectedUsers.has(socket.id)) {
      const userData = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      console.log(`👋 ${userData.userName} desconectou`);
    }
  });
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`Usuário ${userId} entrou na sala`);
    
    // Buscar informações do usuário no banco
    const user = db.users.find(u => u.id === userId);
    if (user) {
      // Adicionar usuário à lista de conectados
      connectedUsers.set(socket.id, {
        userId: userId,
        userName: user.name,
        connectedAt: new Date().toISOString()
      });
      
      console.log(`✅ ${user.name} está online`);
    }
  });
  
  // Listener para teste do console
  socket.on('test_event', (data) => {
    console.log('🧪 Evento de teste recebido:', data);
    socket.emit('test_response', { message: 'Teste recebido com sucesso!' });
  });
  
  // Listener para teste DNS
  socket.on('test_dns', (data) => {
    console.log('🌐 Teste DNS recebido:', data);
    socket.emit('test_dns_response', { 
      message: 'Teste DNS funcionando!',
      hostname: data.hostname,
      serverTime: new Date().toISOString()
    });
  });
});

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor WaterLog iniciado!`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Acessível em:`);
  console.log(`   • Local: http://localhost:${PORT}`);
  
  // Mostrar IPs da rede local
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      // Mostrar apenas IPv4 e não loopback
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`   • Rede: http://${interface.address}:${PORT}`);
      }
    });
  });
  
}); 