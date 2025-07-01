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

**💧 Mantenha-se hidratado e produtivo no trabalho! 💧**

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

## ✨ Funcionalidades Principais

### 💧 Controle de Hidratação
- **Registro de Consumo**: Registre quanta água você bebeu
- **Gestão de Garrafas**: Cadastre suas garrafas com capacidades
- **Meta Diária**: Configure sua meta personalizada de hidratação
- **Histórico**: Visualize todos os seus registros

### 📊 Dashboard e Estatísticas
- **Gráficos Interativos**: Visualize consumo em gráficos
- **Filtros Temporais**: Dia, semana ou mês
- **Ranking de Consumo**: Compare com outros usuários
- **Estatísticas Detalhadas**: Total consumido, registros, etc.

### 🔔 Notificações
- **Notificações Push**: Receba notificações do navegador
- **Toasts**: Notificações em tempo real na tela
- **Atividades Recentes**: Feed de atividades dos usuários

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Real-time**: Socket.IO
- **PWA**: Service Workers, Web Push API
- **Gráficos**: Chart.js
- **Banco de Dados**: JSON (arquivo local)

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

4. **Acesse o aplicativo**:
```
http://localhost:999
```

## 🚀 Como Usar

### Primeiro Acesso
1. Digite seu nome e email
2. Clique em "Entrar"
3. Configure sua meta diária de água
4. Adicione suas garrafas

### Usando o App
1. **Beber Água**: Clique em "Beber Água" e selecione a garrafa
2. **Encher Garrafa**: Marque quando encher uma garrafa
3. **Ver Estatísticas**: Acesse o dashboard para ver gráficos
4. **Participar de Salas**: Entre em salas para competir em grupo
5. **Ganhar Pontos**: Beba água regularmente para subir no ranking

### PWA
1. **Instalar**: Clique em "Instalar" quando aparecer o prompt
2. **Notificações**: Permita notificações para receber lembretes
3. **Uso Offline**: O app funciona mesmo sem internet

## 📱 Funcionalidades PWA

### Instalação
- O app detecta automaticamente se pode ser instalado
- Prompt de instalação aparece após alguns segundos
- Instala como aplicativo nativo no dispositivo

### Notificações Push
- Solicita permissão na primeira vez
- Recebe notificações mesmo com o app fechado
- Notificações sobre atividades e rankings

### Cache Offline
- Recursos principais ficam em cache
- Funciona sem conexão com internet
- Atualizações automáticas quando online

## 👥 Sistema de Salas

### Criar Sala
1. Clique em "Salas" no menu
2. Clique em "Criar Sala"
3. Preencha nome, descrição e configurações
4. Clique em "Criar Sala"

### Participar de Sala
1. Clique em uma sala na lista
2. Veja detalhes e membros
3. Clique em "Entrar na Sala"

### Tipos de Sala
- **Pública**: Qualquer pessoa pode entrar
- **Privada**: Apenas convidados podem entrar

## 🏆 Sistema de Gamificação

### Como Ganhar Pontos
- **Consumo Diário**: Quem bebe mais água ganha mais pontos
- **Ranking Diário**: Pontos distribuídos à meia-noite
- **Ranking Semanal**: Acumula pontos da semana

### Visualizar Pontos
1. Clique em "Ranking" no menu
2. Veja seus pontos totais
3. Histórico de pontos ganhos
4. Rankings diário e semanal

### Medalhas
- 🥇 **Ouro**: 1º lugar (15 pontos)
- 🥈 **Prata**: 2º lugar (10 pontos)
- 🥉 **Bronze**: 3º lugar (5 pontos)

## 🔧 Configuração do Servidor

### Variáveis de Ambiente
```bash
PORT=999                    # Porta do servidor
HOST=0.0.0.0               # Host (aceita conexões externas)
```

### Comandos Disponíveis
```bash
npm start                  # Inicia o servidor
npm run dev               # Modo desenvolvimento com nodemon
```

## 📊 Estrutura do Banco de Dados

O banco é salvo em `database.json` com a seguinte estrutura:

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "points": 0,
      "currentRoom": "string|null",
      "pushSubscription": "object|null"
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

## 🔒 Segurança

- **Validação de Dados**: Todos os inputs são validados
- **Autorização**: Usuários só podem editar seus próprios dados
- **Sanitização**: Dados são sanitizados antes de salvar

## 🐛 Solução de Problemas

### PWA não instala
- Verifique se está usando HTTPS ou localhost
- Certifique-se de que o manifest.json está acessível
- Verifique se o Service Worker está registrado

### Notificações não funcionam
- Verifique se a permissão foi concedida
- Certifique-se de que o navegador suporta Push API
- Verifique se o VAPID está configurado

### Salas não carregam
- Verifique a conexão com o servidor
- Certifique-se de que o Socket.IO está funcionando
- Verifique se há erros no console

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedores

- **WaterLog Team**
- **Versão**: 2.0.0
- **Última Atualização**: Janeiro 2025

## 🎯 Roadmap

- [ ] Chat em tempo real nas salas
- [ ] Desafios semanais
- [ ] Conquistas e badges
- [ ] Integração com wearables
- [ ] Relatórios detalhados
- [ ] Exportação de dados
- [ ] Temas personalizáveis
- [ ] Modo escuro/claro 