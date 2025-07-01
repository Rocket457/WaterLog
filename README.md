# 🚰 WaterLog - Controle de Hidratação com Gamificação

Um aplicativo web progressivo (PWA) para controle de hidratação no trabalho, com sistema de salas em grupo e gamificação.

## 🌐 Acesso

- **URL Principal:** http://waterlog.servebeer.com
- **Porta:** 80 (HTTP padrão)
- **Rede Local:** http://192.168.1.8

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)
```bash
# Execute como administrador
start-server.bat
```

### Opção 2: Manual
```bash
# Instalar dependências
npm install

# Iniciar servidor (requer privilégios de administrador)
npm start
```

## 🔧 Configuração de Rede

### Para acesso local:
```bash
setup-network.bat
```

### Para acesso externo:
```bash
setup-external-access.bat
```

## 🚀 Novas Funcionalidades

### 📱 PWA (Progressive Web App)
- **Instalação**: O app pode ser instalado como aplicativo nativo
- **Notificações Push**: Receba notificações mesmo com o app fechado
- **Funcionamento Offline**: Cache de recursos para uso sem internet
- **Atualizações Automáticas**: Service Worker gerencia atualizações

### 👥 Sistema de Salas
- **Criação de Salas**: Crie salas públicas ou privadas para grupos
- **Participação**: Entre e saia de salas facilmente
- **Limite de Membros**: Configure o número máximo de participantes
- **Atividades em Grupo**: Veja atividades dos membros da sala

### 🏆 Gamificação
- **Sistema de Pontos**: Ganhe pontos baseado no consumo de água
- **Ranking Diário**: Compita pelo primeiro lugar do dia
- **Ranking Semanal**: Ranking acumulado da semana
- **Distribuição de Pontos**:
  - 1º lugar: 15 pontos
  - 2º lugar: 10 pontos
  - 3º lugar: 5 pontos
  - 4º lugar: 3 pontos
  - 5º lugar: 1 ponto

## 📱 Funcionalidades

- ✅ Controle de garrafas de água
- ✅ Registro de consumo em tempo real
- ✅ Estatísticas diárias e totais
- ✅ Notificações push para todos os usuários
- ✅ Console administrativo
- ✅ Acesso via console do navegador

## 🎮 Comandos do Console

Abra o console do navegador (F12) e use:

```javascript
showUsers()           // Ver usuários logados
showStats()           // Ver estatísticas
broadcastToast("msg") // Enviar notificação para todos
testSocketIO()        // Testar conexão
showHelp()            // Ver todos os comandos
```

## 🚀 Funcionalidades

- **Cadastro de Usuários**: Sistema simples de login com nome e email
- **Gestão de Garrafas**: Cadastre suas garrafas com nome e capacidade
- **Controle de Consumo**: Registre quanto você bebeu de água
- **Marcação de Garrafas Vazias**: Marque quando esvaziar uma garrafa completa
- **Notificações em Tempo Real**: Receba notificações quando colegas bebem água
- **Estatísticas**: Acompanhe seu consumo diário e total
- **Interface Responsiva**: Funciona em desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: JSON (arquivo local)
- **Comunicação em Tempo Real**: Socket.IO
- **Ícones**: Font Awesome
- **PWA**: Service Workers, Web Push API
- **Gráficos**: Chart.js

## 📦 Instalação

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd WaterLog
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Inicie o servidor**:
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

4. **Acesse o aplicativo**:
Abra seu navegador e acesse: `http://localhost:999`

## 🎯 Como Usar

### 1. Primeiro Acesso
- Digite seu nome e email
- Clique em "Entrar" para criar sua conta
- Configure sua meta diária de água
- Adicione suas garrafas

### 2. Cadastrar Garrafas
- Clique em "Nova Garrafa"
- Digite o nome da garrafa (ex: "Garrafa do Trabalho")
- Informe a capacidade em ml
- Clique em "Adicionar"

### 3. Registrar Consumo de Água
**Opção 1 - Beber Água:**
- Clique em "Beber Água" ou no botão "Beber" de uma garrafa
- Selecione a garrafa
- Digite a quantidade em ml
- Clique em "Registrar"

**Opção 2 - Esvaziar Garrafa:**
- Clique em "Esvaziar Garrafa" ou no botão "Esvaziar" de uma garrafa
- Selecione a garrafa
- Clique em "Marcar como Vazia"

### 4. Acompanhar Estatísticas
- **Hoje**: Quantidade bebida hoje e número de registros
- **Total**: Quantidade total bebida desde o cadastro
- **Meta Diária**: Barra de progresso (meta de 2000ml)

### 5. Notificações
- Receba notificações em tempo real quando colegas bebem água
- Visualize atividades recentes na seção "Atividades Recentes"

## 📊 Estrutura do Banco de Dados

O aplicativo utiliza um arquivo JSON (`database.json`) com a seguinte estrutura:

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "createdAt": "ISO date",
      "totalWaterDrunk": "number",
      "points": 0,
      "currentRoom": "string|null",
      "pushSubscription": "object|null"
    }
  ],
  "bottles": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "capacity": "number",
      "isActive": "boolean",
      "createdAt": "ISO date"
    }
  ],
  "waterRecords": [
    {
      "id": "string",
      "userId": "string",
      "bottleId": "string",
      "amount": "number",
      "timestamp": "ISO date",
      "isFullBottle": "boolean"
    }
  ],
  "notifications": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "message": "string",
      "timestamp": "ISO date",
      "type": "string"
    }
  ],
  "rooms": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "members": ["userIds"],
      "isPublic": true,
      "maxMembers": 50
    }
  ],
  "dailyRankings": [
    {
      "date": "YYYY-MM-DD",
      "rankings": [
        {
          "userId": "string",
          "userName": "string",
          "totalWater": 0,
          "points": 0
        }
      ]
    }
  ],
  "pointHistory": [
    {
      "id": "string",
      "userId": "string",
      "points": 0,
      "reason": "string",
      "timestamp": "ISO string"
    }
  ]
}
```

## 🔧 API Endpoints

### Usuários
- `GET /api/users` - Listar todos os usuários
- `POST /api/users` - Criar novo usuário

### Garrafas
- `GET /api/users/:userId/bottles` - Listar garrafas do usuário
- `POST /api/users/:userId/bottles` - Criar nova garrafa

### Consumo de Água
- `POST /api/users/:userId/drink` - Registrar consumo
- `POST /api/users/:userId/bottles/:bottleId/empty` - Marcar garrafa como vazia

### Estatísticas
- `GET /api/users/:userId/stats` - Obter estatísticas do usuário

### Notificações
- `GET /api/notifications` - Obter notificações recentes

## 🌟 Recursos Especiais

### Notificações em Tempo Real
- Utiliza Socket.IO para comunicação instantânea
- Notifica todos os usuários quando alguém bebe água
- Interface atualizada automaticamente

### Interface Moderna
- Design responsivo e adaptável
- Animações suaves e feedback visual
- Tema com gradientes e cores relacionadas à água

### Persistência de Dados
- Dados salvos automaticamente em arquivo JSON
- Sessão do usuário mantida no localStorage
- Backup automático dos dados

## 🚀 Deploy

Para fazer deploy em produção:

1. **Configure as variáveis de ambiente**:
```bash
PORT=999
HOST=0.0.0.0
```

2. **Instale as dependências de produção**:
```bash
npm install --production
```

3. **Inicie o servidor**:
```bash
npm start
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Eduardo Anibal** - Desenvolvimento inicial

## 🙏 Agradecimentos

- Font Awesome pelos ícones
- Socket.IO pela comunicação em tempo real
- Comunidade Node.js pelas ferramentas incríveis
- Meus colegas de time da Blueez por sugerirem ideias para o projeto!

---


## 🎯 Roadmap

- [ ] Chat em tempo real nas salas
- [ ] Desafios semanais
- [ ] Conquistas e badges
- [ ] Integração com wearables
- [ ] Relatórios detalhados
- [ ] Exportação de dados
- [ ] Temas personalizáveis
- [ ] Modo escuro/claro 
