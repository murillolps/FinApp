# FinApp — Guia de Setup Passo a Passo

Este guia leva você do zero (máquina sem nada instalado) até o primeiro endpoint funcionando, com backend Node.js + Express + Prisma + MySQL e frontend React + Vite. Pensado pra quem nunca mexeu com Node mas já tem base de programação.

> **Tempo estimado:** 2 a 3 horas pra completar tudo, sem pressa.

---

## Parte 1 — Instalar as ferramentas

Você só faz isso uma vez. Depois é só programar.

### 1.1 Node.js
Baixe a versão **LTS** em https://nodejs.org/.
Durante a instalação, aceite as opções padrão. Marque a opção que adiciona o Node ao PATH (já vem marcada).

Verifique no terminal (cmd ou PowerShell):
```bash
node --version
npm --version
```

Os dois comandos devem imprimir uma versão. Se não imprimirem, reinicie o terminal.

### 1.2 MySQL Server
Baixe o **MySQL Community Server** em https://dev.mysql.com/downloads/installer/.

Durante a instalação:
- Escolha o tipo **Developer Default** (instala servidor + Workbench)
- Configure a senha do usuário `root` e **anote em local seguro**
- Mantenha a porta padrão `3306`
- Deixe o serviço iniciar com o Windows

Após instalar, abra o **MySQL Workbench** (vem junto) e conecte usando `root` + sua senha.

### 1.3 Git
Baixe em https://git-scm.com/download/win. Durante a instalação aceite as opções padrão.

Configure seu nome e e-mail (uma vez só):
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 1.4 VS Code
Baixe em https://code.visualstudio.com/.

Após instalar, abra o VS Code e instale estas extensões (Ctrl+Shift+X, busca pelo nome):
- **ESLint** (Microsoft)
- **Prettier - Code formatter**
- **Prisma**
- **Tailwind CSS IntelliSense**
- **ES7+ React/Redux/React-Native snippets**

### 1.5 Postman
Baixe em https://www.postman.com/downloads/. É o que você vai usar pra testar a API enquanto não tem frontend pronto.

---

## Parte 2 — Criar a estrutura do projeto

Abra o terminal na pasta `C:\Desenvolvimento\Financas` (onde estão os documentos).

```bash
mkdir finapp
cd finapp
mkdir backend frontend
git init
```

Crie um arquivo `.gitignore` na raiz `finapp/` com este conteúdo:
```
node_modules/
.env
.env.local
.env.production
dist/
build/
*.log
.DS_Store
```

---

## Parte 3 — Setup do Backend

```bash
cd backend
npm init -y
```

Isso cria um `package.json`. Agora instale as dependências:

```bash
npm install express cors dotenv bcrypt jsonwebtoken zod @prisma/client
npm install --save-dev nodemon prisma
```

Por que cada uma?
- `express` — framework HTTP
- `cors` — libera chamadas vindas do frontend (que roda em outra porta)
- `dotenv` — carrega o arquivo `.env` com variáveis de ambiente
- `bcrypt` — hash de senhas
- `jsonwebtoken` — geração e validação de JWT
- `zod` — validação de dados que chegam nas rotas
- `@prisma/client` — cliente do ORM (usado em runtime)
- `prisma` (dev) — CLI do ORM (gerar migrations etc.)
- `nodemon` (dev) — reinicia o servidor automaticamente quando você edita o código

### 3.1 Inicializar o Prisma

```bash
npx prisma init --datasource-provider mysql
```

Isso cria a pasta `prisma/` com o arquivo `schema.prisma` e um `.env` na raiz do backend.

### 3.2 Configurar a conexão com o banco

No `backend/.env` (substitua `SUASENHA` pela senha que você anotou):
```
DATABASE_URL="mysql://root:SUASENHA@localhost:3306/finapp"
JWT_SECRET="cole-aqui-uma-string-bem-longa-e-aleatoria-de-pelo-menos-32-caracteres"
PORT=3001
```

> **Como gerar uma JWT_SECRET aleatória:** abra o terminal e rode `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Copie o resultado pro `.env`.

### 3.3 Criar o banco de dados

No MySQL Workbench, abra uma nova query e execute:
```sql
CREATE DATABASE finapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.4 Definir o schema (modelo de dados)

Substitua todo o conteúdo de `backend/prisma/schema.prisma` por:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(uuid())
  email         String        @unique
  name          String
  passwordHash  String
  createdAt     DateTime      @default(now())
  categories    Category[]
  transactions  Transaction[]
  recurrences   Recurrence[]
}

model Category {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  name         String
  type         String        // "income" | "expense"
  color        String
  icon         String
  archived     Boolean       @default(false)
  createdAt    DateTime      @default(now())
  transactions Transaction[]
  recurrences  Recurrence[]

  @@index([userId])
}

model Transaction {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id])
  recurrenceId  String?
  recurrence    Recurrence? @relation(fields: [recurrenceId], references: [id])
  type          String      // "income" | "expense"
  amount        Decimal     @db.Decimal(10, 2)
  occurredOn    DateTime    @db.Date
  description   String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId, occurredOn])
}

model Recurrence {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  categoryId   String
  category     Category      @relation(fields: [categoryId], references: [id])
  type         String
  amount       Decimal       @db.Decimal(10, 2)
  description  String
  frequency    String        // "monthly" | "weekly" | "yearly"
  dayOfMonth   Int
  startDate    DateTime      @db.Date
  endDate      DateTime?     @db.Date
  active       Boolean       @default(true)
  createdAt    DateTime      @default(now())
  transactions Transaction[]

  @@index([userId, active])
}
```

### 3.5 Rodar a primeira migration

```bash
npx prisma migrate dev --name init
```

O Prisma vai criar as tabelas no MySQL automaticamente. Confira no Workbench: as quatro tabelas (`User`, `Category`, `Transaction`, `Recurrence`) devem aparecer no banco `finapp`.

### 3.6 Estrutura de pastas do backend

Crie esta estrutura dentro de `backend/`:
```
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   ├── lib/
│   └── server.js
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

### 3.7 Cliente Prisma reutilizável

`src/lib/prisma.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

### 3.8 Servidor Express básico

`src/server.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
```

### 3.9 Adicionar script de dev

Edite `backend/package.json` e adicione/troque o bloco `"scripts"`:
```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

### 3.10 Rodar o servidor

```bash
npm run dev
```

Abra http://localhost:3001/api/health no navegador. Deve aparecer `{"status":"ok","timestamp":"..."}`. Se aparecer, **seu backend está vivo**. 🎉

### 3.11 Primeira rota real — cadastro e login de usuário

`src/controllers/authController.js`:
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(400).json({ error: 'E-mail já cadastrado' });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, passwordHash },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
}

async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = { register, login };
```

`src/routes/authRoutes.js`:
```javascript
const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

No `src/server.js`, adicione antes do `app.listen`:
```javascript
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
```

### 3.12 Testar no Postman

1. Abra o Postman, crie uma nova request
2. Método: **POST**
3. URL: `http://localhost:3001/api/auth/register`
4. Aba **Body** → **raw** → **JSON**
5. Cole:
```json
{
  "email": "murillo@teste.com",
  "name": "Murillo",
  "password": "123456"
}
```
6. Clique em **Send**

Deve voltar um JSON com o `user` e o `token`. Salve o token, vamos usar nas próximas rotas.

Teste também o login (mesma URL trocando `/register` por `/login`, removendo o campo `name`).

### 3.13 Inspecionar dados no Prisma Studio

Em outro terminal, na pasta `backend/`:
```bash
npx prisma studio
```

Abre uma interface visual em http://localhost:5555. Você vai ver o usuário que acabou de criar.

---

## Parte 4 — Setup do Frontend

Em outro terminal, vá pra pasta `frontend/`:

```bash
cd ../frontend
npm create vite@latest . -- --template react
```

Quando perguntar "Current directory is not empty", responda `Ignore files and continue`.

Quando aparecer a opção de variant, escolha **JavaScript** (não TypeScript).

```bash
npm install
npm install react-router-dom axios recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4.1 Configurar Tailwind

Substitua o conteúdo de `frontend/tailwind.config.js`:
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Substitua o conteúdo de `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.2 Estrutura de pastas

```
frontend/src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
├── components/
├── lib/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

### 4.3 Cliente HTTP

`src/lib/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 4.4 Tela de Login

`src/pages/Login.jsx`:
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao entrar');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-1">Fin<span className="text-blue-600">$</span>App</h1>
        <p className="text-gray-500 text-sm mb-6">Controle financeiro pessoal</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>
        )}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Não tem conta? <Link to="/register" className="text-blue-600">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
```

### 4.5 Tela de Cadastro

`src/pages/Register.jsx`:
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>}

        <input
          type="text" placeholder="Nome" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-3" required
        />
        <input
          type="email" placeholder="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3" required
        />
        <input
          type="password" placeholder="Senha (mínimo 6 caracteres)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3" required minLength={6}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Criar conta
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem conta? <Link to="/login" className="text-blue-600">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
```

### 4.6 Dashboard placeholder

`src/pages/Dashboard.jsx`:
```jsx
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Olá, {user.name}!</h1>
        <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600">
          Sair
        </button>
      </header>
      <p className="text-gray-500">Dashboard em construção. Próximo passo: implementar KPIs e gráficos.</p>
    </div>
  );
}
```

### 4.7 Roteamento

`src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4.8 Rodar o frontend

```bash
npm run dev
```

Abra http://localhost:5173. Vai aparecer a tela de login. Clique em "Criar conta", preencha e envie. Se tudo deu certo, você é redirecionado pro dashboard com seu nome.

> **Importante:** o backend (`localhost:3001`) e o frontend (`localhost:5173`) precisam estar rodando ao mesmo tempo. Mantenha **dois terminais abertos**.

---

## Parte 5 — Versionar no GitHub

Volte pra raiz `finapp/`:
```bash
cd ..
git add .
git commit -m "Setup inicial do FinApp: backend Node + Express + Prisma + MySQL e frontend React + Vite"
```

Crie um repositório novo em https://github.com/new (pode ser privado).

Conecte o repo local ao remoto (substitua `seuusuario`):
```bash
git remote add origin https://github.com/seuusuario/finapp.git
git branch -M main
git push -u origin main
```

A partir daqui, regra de ouro: **commit + push a cada feature concluída**.

---

## Parte 6 — Próximos passos

Com o setup pronto, você segue os sprints do `requisitos-finapp.md`:

1. **Middleware de autenticação** (extrair `userId` do JWT em todas as rotas protegidas)
2. **Rotas de Categorias** (CRUD + categorias-semente criadas no signup)
3. **Rotas de Transações** (CRUD + filtros por mês/categoria/tipo + cálculo de saldo)
4. **Rotas de Recorrências** (CRUD + endpoint que retorna projeções do mês)
5. **Tela de Transações** no frontend (a tabela do mês com saldo cumulativo)
6. **Dashboard com KPIs** (saldo atual, anterior, projeção, gasto do mês)
7. **Gráficos** com Recharts no Dashboard e Relatórios
8. **Deploy** (Vercel + Railway)

Recomendo fechar uma feature de cada vez (back + front + commit) antes de partir pra próxima — é bem mais fácil debugar e dá sensação de progresso constante.

---

## Cheatsheet de comandos

| Quero... | Comando |
|---|---|
| Rodar o backend (com auto-reload) | `cd backend && npm run dev` |
| Rodar o frontend | `cd frontend && npm run dev` |
| Criar nova migration depois de mudar o schema | `cd backend && npx prisma migrate dev --name nome-da-mudanca` |
| Abrir Prisma Studio (visual do banco) | `cd backend && npx prisma studio` |
| Resetar banco completamente | `cd backend && npx prisma migrate reset` |
| Atualizar o cliente Prisma após mudar schema sem migrar | `cd backend && npx prisma generate` |
| Build de produção do frontend | `cd frontend && npm run build` |
| Commit e push padrão | `git add . && git commit -m "msg" && git push` |

---

## Solução de problemas comuns

**"npm não é reconhecido como comando"** — feche e abra o terminal de novo. Se persistir, reinicie o computador (Node precisa estar no PATH).

**"Authentication failed against database server"** — sua senha do MySQL no `.env` está errada. Tem caracteres especiais na senha? Você pode precisar codificar (`@` vira `%40`, por exemplo).

**"PrismaClient is unable to be run in the browser"** — você importou o Prisma no frontend. O Prisma só roda no backend.

**"CORS policy blocked"** — o backend não está com o middleware `cors()` ativo, ou está rodando em porta diferente da que o frontend chama. Confira `src/server.js` e a `baseURL` em `src/lib/api.js`.

**"Cannot find module 'X'"** — você esqueceu o `npm install`. Rode na pasta certa (backend ou frontend).

---

*Quando travar em alguma parte, me chama com o erro exato (copia/cola da mensagem) que eu te ajudo a desentalar.*
