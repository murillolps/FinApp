# FinApp — Documento Mestre de Desenvolvimento

> **Documento único de especificação e plano de execução do MVP do FinApp.**
> Este arquivo é a fonte de verdade para o desenvolvimento. Contém contexto, requisitos, modelo de dados, stack, contratos de API e o plano de construção dividido em fases com pontos de parada.

**Versão:** 1.0 · **Data:** Maio/2026 · **Autor do produto:** Murillo Lopes

---

# PARTE I — INSTRUÇÕES PARA O AGENTE DE IA

> Esta seção é dirigida ao agente de codificação (Claude no VS Code). Leia-a com atenção antes de escrever qualquer linha de código.

## Como trabalhar com este documento

1. **Leia o documento inteiro antes de começar.** Não comece a codar sem ter o contexto completo das Partes II a VII.
2. **Trabalhe estritamente fase por fase, na ordem.** O plano está na Parte VII (Fase 0 a Fase 8). Não pule fases nem as combine.
3. **PARE em cada CHECKPOINT.** Ao final de cada fase existe um bloco `⏸️ CHECKPOINT`. Quando chegar nele:
   - **Pare de codar.**
   - Apresente ao Murillo um resumo do que foi feito, quais arquivos foram criados/alterados e o passo a passo exato para ele testar.
   - **Aguarde a confirmação explícita** dele (ex.: "pode seguir", "próxima fase") antes de iniciar a fase seguinte.
   - Nunca inicie a próxima fase por conta própria.
4. **Toda fase termina com o app funcionando.** Nenhuma fase pode deixar o projeto num estado quebrado. Se uma fase ficar grande, conclua uma parte funcional e avise.
5. **Faça um commit ao final de cada fase**, com mensagem descritiva em português (ver convenções na Parte VI).
6. **Em caso de ambiguidade, pergunte.** Se algo no documento não estiver claro ou faltar informação, pergunte ao Murillo antes de assumir.
7. **A stack é fixa.** Use exatamente as bibliotecas listadas na Parte V. Não substitua por alternativas sem aprovação.
8. **Referência visual:** o arquivo `wireframes-finapp.html` (mesma pasta) contém o protótipo de baixa fidelidade de todas as telas. Consulte-o para entender o layout esperado de cada tela.
9. **O Murillo está aprendendo Node.** Explique decisões de forma didática nos resumos de checkpoint. Ele tem base em Java, então analogias com Java/Spring/Hibernate ajudam.

## Formato dos checkpoints

Cada checkpoint segue este modelo:

```
⏸️ CHECKPOINT — FASE X
PARE AQUI. Não inicie a Fase X+1.
Entregue ao Murillo:
  • Resumo do que foi implementado nesta fase
  • Lista de arquivos criados/alterados
  • Passo a passo exato para testar e validar
  • Comando de commit sugerido
Aguarde "pode seguir" antes de continuar.
```

---

# PARTE II — CONTEXTO DO PRODUTO

## O problema

O Murillo controla suas finanças pessoais numa planilha Excel. Cada mês é uma tabela com as colunas `Data | Entrada | Saída | Gasto Diário | Saldo`, onde o saldo é cumulativo dia a dia. Há também uma sub-tabela de "Gastos Fixos" (ex.: Celular, Internet). A planilha funciona, mas não é móvel, não categoriza bem os gastos, e a projeção do restante do mês é feita manualmente.

## A proposta

Um aplicativo web responsivo (mobile-first) que reproduz a lógica da planilha e adiciona:

- Categorização customizável das transações
- Projeção automática do saldo até o fim do mês com base em recorrências (gastos/entradas fixas)
- Visualizações gráficas dos padrões de gasto
- Suporte multi-usuário desde o primeiro deploy (cada usuário com seus próprios dados isolados)

O app deve responder com clareza a três perguntas: **"quanto tenho agora?"**, **"quanto eu tinha antes da última entrada?"** e **"como meu saldo vai ficar no restante do mês?"**.

## Escopo do MVP

Recursos que o MVP entrega:

- Cadastro e login de usuário (e-mail e senha)
- CRUD de transações (entradas e saídas) com categoria
- Categorias customizáveis pelo usuário
- Recorrências (gastos e entradas fixas) que alimentam a projeção mensal
- Dashboard com saldo atual, saldo anterior à última entrada, projeção de fim de mês e gasto do mês
- Tabela mensal com histórico de transações e projeção do restante do mês
- Relatórios com gráficos (gastos por categoria, evolução do saldo, entrada vs saída)
- Conta única por usuário ("Carteira Principal")

## Fora do escopo do MVP

Importação de extratos bancários (OFX/CSV), Open Finance/Pix, login social com Google (fica como melhoria pós-MVP), múltiplas contas bancárias, metas de gasto com alertas, múltiplas moedas, divisão de despesas entre pessoas, app nativo iOS/Android e exportação fiscal.

---

# PARTE III — REQUISITOS

## Requisitos funcionais

### Autenticação e conta
- **RF-01** — Cadastro de usuário com e-mail, nome e senha.
- **RF-02** — Login com e-mail e senha.
- **RF-03** — Logout.
- **RF-04** — Onboarding curto no primeiro acesso: definir saldo inicial da carteira.
- **RF-05** — Ao criar a conta, o sistema cria automaticamente um conjunto inicial de categorias sugeridas.

### Transações
- **RF-06** — Cadastrar transação (entrada ou saída) com tipo, valor, data, categoria e descrição opcional.
- **RF-07** — Listar transações de um mês selecionado, ordenadas por data.
- **RF-08** — Editar transação existente.
- **RF-09** — Excluir transação (com confirmação).
- **RF-10** — Filtrar transações por tipo e por categoria.
- **RF-11** — A tabela mensal exibe o saldo cumulativo dia a dia e inclui as linhas de projeção (recorrências futuras), visualmente diferenciadas.

### Categorias
- **RF-12** — Criar categoria com nome, tipo (entrada/saída), cor e ícone.
- **RF-13** — Listar categorias do usuário.
- **RF-14** — Editar categoria.
- **RF-15** — Arquivar categoria (não excluir — preserva o histórico vinculado).

### Recorrências
- **RF-16** — Criar recorrência com tipo, valor, descrição, categoria, frequência, dia do mês, data de início e data de término opcional.
- **RF-17** — Listar recorrências (ativas, pausadas, todas).
- **RF-18** — Editar recorrência (alteração vale apenas para lançamentos futuros).
- **RF-19** — Pausar e reativar recorrência.
- **RF-20** — Excluir recorrência (transações já geradas no passado permanecem).

### Dashboard
- **RF-21** — Exibir saldo atual.
- **RF-22** — Exibir saldo anterior à última entrada.
- **RF-23** — Exibir projeção do saldo no fim do mês.
- **RF-24** — Exibir total gasto no mês corrente.
- **RF-25** — Exibir gráfico de evolução do saldo no mês (realizado + projetado).
- **RF-26** — Exibir lista das próximas recorrências.
- **RF-27** — Permitir navegação entre meses.

### Relatórios
- **RF-28** — Gráfico de gastos por categoria no mês.
- **RF-29** — Gráfico de saldo final mês a mês (últimos 6 meses).
- **RF-30** — Gráfico comparativo de entradas vs saídas (últimos 6 meses).

## Requisitos não funcionais

- **RNF-01** — Interface responsiva, mobile-first.
- **RNF-02** — Lançar uma transação em até 3 cliques a partir do dashboard.
- **RNF-03** — Idioma da interface: português brasileiro.
- **RNF-04** — Senhas armazenadas com hash (bcrypt).
- **RNF-05** — Autenticação por JWT, expiração de 7 dias.
- **RNF-06** — Isolamento total de dados entre usuários: toda query filtra obrigatoriamente por `userId`.
- **RNF-07** — Carregamento inicial abaixo de 3s em conexão 4G.
- **RNF-08** — Código versionado em Git, com commit ao final de cada fase.
- **RNF-09** — HTTPS obrigatório em produção.

## Regras de negócio

- **RN-01** — Saldo é calculado dinamicamente: `saldo(data) = saldo_inicial + Σ(entradas até data) − Σ(saídas até data)`. Nunca armazenado como coluna.
- **RN-02** — Linhas de projeção do mês são calculadas em tempo de execução a partir das recorrências ativas; não criam registros físicos até virarem transações reais.
- **RN-03** — Uma transação gerada por recorrência mantém o vínculo `recurrenceId` com a recorrência-mãe, mas pode ter o valor alterado individualmente sem afetar a recorrência.
- **RN-04** — Categoria arquivada continua visível nas transações antigas, mas não pode ser selecionada em novos lançamentos.
- **RN-05** — Coloração do saldo: **verde** quando saldo > 30% da entrada média mensal; **amarelo** entre 0 e 30%; **vermelho** quando ≤ 0.
- **RN-06** — Excluir transação recalcula o saldo de todas as datas posteriores.
- **RN-07** — Datas no formato dd/mm/aaaa; valores monetários no padrão pt-BR (R$ 1.234,56).
- **RN-08** — Mês padrão exibido é o mês corrente (fuso America/Sao_Paulo).
- **RN-09** — `amount` é sempre positivo; o sinal (entrada/saída) é determinado pelo campo `type`.

---

# PARTE IV — MODELO DE DADOS

Quatro entidades: `User`, `Category`, `Transaction`, `Recurrence`. Toda entidade derivada carrega `userId` para isolamento de dados. O diagrama ER visual está na aba "Modelo de Dados" do `wireframes-finapp.html`.

Schema completo do Prisma (este é o contrato de dados — implementar exatamente assim na Fase 1):

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
  initialBalance Decimal      @default(0) @db.Decimal(10, 2)
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
  type         String        // "income" | "expense"
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

**Categorias-semente** criadas no cadastro do usuário (RF-05):

| Nome | Tipo | Cor (hex) | Ícone |
|---|---|---|---|
| Salário | income | #5a8a5a | 💼 |
| Alimentação | expense | #b35a5a | 🍔 |
| Casa | expense | #c7b07a | 🏠 |
| Transporte | expense | #4a5a8a | 🚗 |
| Lazer | expense | #8a9acb | 🎬 |
| Saúde | expense | #6a8a8a | 💊 |
| Outros | expense | #9a9aa5 | 📦 |

---

# PARTE V — STACK TÉCNICA

A stack é **fixa**. Use exatamente estas bibliotecas.

## Frontend
- React 18 + Vite (template `react`, variante **JavaScript**, não TypeScript)
- Tailwind CSS
- React Router (`react-router-dom`)
- Axios
- Recharts (gráficos)

## Backend
- Node.js LTS + Express
- Prisma ORM
- MySQL 8.x
- bcrypt (hash de senha)
- jsonwebtoken (JWT)
- zod (validação de payloads)
- dotenv
- cors
- nodemon (dev)

## Ferramentas
VS Code, Git + GitHub, MySQL Workbench ou DBeaver, Postman ou Insomnia, Prisma Studio.

## Hospedagem (Fase 8)
Frontend na Vercel; backend no Railway ou Render; MySQL no Railway ou PlanetScale.

---

# PARTE VI — ESTRUTURA E CONVENÇÕES

## Estrutura do repositório

Monorepo com duas pastas-irmãs:

```
finapp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/        ← lógica de negócio (cálculo de saldo, projeção)
│   │   ├── lib/             ← prisma client, helpers
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env                 ← NÃO versionar
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/             ← api.js (cliente axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## Convenções de código

- **Nomes de variáveis, funções e arquivos:** em inglês. **Textos de UI e mensagens de erro ao usuário:** em português.
- **Backend:** rotas finas; lógica nos controllers; regra de negócio complexa (cálculo de saldo, geração de projeção) isolada em `services/`.
- **Frontend:** um componente por arquivo; páginas em `pages/`, componentes reutilizáveis em `components/`.
- **Dinheiro:** sempre `Decimal` no banco; nunca usar `float`. No JS, tratar como string/número com 2 casas e arredondar com cuidado.
- **Datas:** armazenar como `Date`; considerar fuso America/Sao_Paulo nos cálculos de "mês corrente".
- **Validação:** todo payload de entrada das rotas é validado com `zod` antes de tocar o banco.
- **Segurança:** toda rota (exceto `/api/auth/*`) passa pelo middleware de autenticação; toda query Prisma filtra por `userId`.
- **Commits:** uma fase = um ou mais commits descritivos em português. Ex.: `git commit -m "Fase 3: CRUD de categorias (backend e frontend)"`.
- **.env nunca versionado.** Manter um `.env.example` com as chaves sem valores.

## Contratos de API

Todas as rotas abaixo de `/api`. Todas (exceto `/api/auth/*`) exigem header `Authorization: Bearer <token>`. O `userId` vem do token, nunca do body.

**Auth**
- `POST /api/auth/register` — body `{ email, name, password }` → `{ user, token }`
- `POST /api/auth/login` — body `{ email, password }` → `{ user, token }`

**Usuário**
- `GET /api/me` → `{ id, name, email, initialBalance }`
- `PATCH /api/me` — body `{ initialBalance }` → usuário atualizado

**Categorias**
- `GET /api/categories?type=income|expense` → `[category]`
- `POST /api/categories` — body `{ name, type, color, icon }` → `category`
- `PUT /api/categories/:id` — body `{ name, color, icon }` → `category`
- `PATCH /api/categories/:id/archive` → `category`

**Transações**
- `GET /api/transactions?month=YYYY-MM&type=&categoryId=` → `{ transactions: [...], summary: {...} }`
- `GET /api/transactions/month-table?month=YYYY-MM` → linhas reais + linhas projetadas com saldo cumulativo
- `POST /api/transactions` — body `{ type, amount, occurredOn, categoryId, description }` → `transaction`
- `PUT /api/transactions/:id` → `transaction`
- `DELETE /api/transactions/:id` → `204`

**Recorrências**
- `GET /api/recurrences?status=active|paused|all` → `[recurrence]`
- `POST /api/recurrences` → `recurrence`
- `PUT /api/recurrences/:id` → `recurrence`
- `PATCH /api/recurrences/:id/toggle` → `recurrence`
- `DELETE /api/recurrences/:id` → `204`

**Dashboard**
- `GET /api/dashboard?month=YYYY-MM` → `{ currentBalance, balanceBeforeLastIncome, projectedMonthEnd, monthSpent, balanceEvolution: [...], upcomingRecurrences: [...] }`

**Relatórios**
- `GET /api/reports/by-category?month=YYYY-MM` → `[{ categoryName, color, total }]`
- `GET /api/reports/monthly-balance?months=6` → `[{ month, balance }]`
- `GET /api/reports/income-vs-expense?months=6` → `[{ month, income, expense }]`

---

# PARTE VII — PLANO DE DESENVOLVIMENTO EM FASES

> Trabalhe uma fase de cada vez. Pare em cada `⏸️ CHECKPOINT` e aguarde aprovação.

## FASE 0 — Fundação do projeto

**Objetivo:** ter o esqueleto do monorepo com backend e frontend rodando vazios.

**Tarefas:**
1. Criar a estrutura de pastas (`finapp/`, `backend/`, `frontend/`).
2. Criar `.gitignore` na raiz com: `node_modules/`, `.env`, `dist/`, `build/`, `*.log`.
3. **Backend:** `npm init -y`; instalar `express cors dotenv bcrypt jsonwebtoken zod @prisma/client` e `--save-dev nodemon prisma`.
4. Criar `backend/src/server.js` com Express, `cors()`, `express.json()` e a rota `GET /api/health` retornando `{ status: 'ok' }`.
5. Adicionar scripts `dev` (nodemon) e `start` no `package.json` do backend.
6. **Frontend:** `npm create vite@latest . -- --template react` (variante JavaScript); `npm install`; instalar `react-router-dom axios recharts` e `-D tailwindcss postcss autoprefixer`; rodar `npx tailwindcss init -p` e configurar Tailwind.
7. Criar `README.md` na raiz explicando como rodar os dois projetos.
8. `git init` e primeiro commit.

**Critérios de aceite:**
- `cd backend && npm run dev` sobe o servidor; `http://localhost:3001/api/health` responde `{ status: 'ok' }`.
- `cd frontend && npm run dev` abre o app Vite em `http://localhost:5173`.

```
⏸️ CHECKPOINT — FASE 0
PARE AQUI. Não inicie a Fase 1.
Entregue: resumo, arquivos criados, passos para testar os dois servidores, comando de commit.
Aguarde "pode seguir".
```

## FASE 1 — Banco de dados e schema

**Objetivo:** ter o MySQL conectado e as tabelas criadas.

**Tarefas:**
1. Rodar `npx prisma init --datasource-provider mysql` no backend.
2. Pedir ao Murillo para criar o banco `finapp` no MySQL Workbench (`CREATE DATABASE finapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`) e preencher `DATABASE_URL`, `JWT_SECRET` e `PORT` no `.env`. Criar também `.env.example`.
3. Escrever o `schema.prisma` exatamente como na Parte IV deste documento.
4. Rodar `npx prisma migrate dev --name init`.
5. Criar `backend/src/lib/prisma.js` exportando uma instância única do `PrismaClient`.

**Critérios de aceite:**
- As 4 tabelas (`User`, `Category`, `Transaction`, `Recurrence`) existem no banco.
- `npx prisma studio` abre e mostra as tabelas vazias.

```
⏸️ CHECKPOINT — FASE 1
PARE AQUI. Não inicie a Fase 2.
Entregue: resumo, instrução do que o Murillo precisa fazer no .env e no Workbench, como verificar as tabelas, comando de commit.
Aguarde "pode seguir".
```

## FASE 2 — Autenticação

**Objetivo:** usuário consegue se cadastrar, fazer login e acessar uma área protegida.

**Tarefas (backend):**
1. Criar `controllers/authController.js` com `register` e `login` (hash bcrypt, geração de JWT, validação zod).
2. No `register`, após criar o usuário, criar as 7 categorias-semente (Parte IV).
3. Criar `routes/authRoutes.js` e montar em `/api/auth`.
4. Criar `middlewares/auth.js` que lê o header `Authorization`, valida o JWT e injeta `req.userId`.
5. Criar `controllers/userController.js` com `getMe` e `updateMe` (saldo inicial); rotas `GET /api/me` e `PATCH /api/me` protegidas.

**Tarefas (frontend):**
6. Criar `lib/api.js` (axios com interceptor que injeta o token do `localStorage`).
7. Criar páginas `Login.jsx` e `Register.jsx`.
8. Criar `App.jsx` com React Router e um componente `PrivateRoute`.
9. Criar `Dashboard.jsx` placeholder (mostra "Olá, {nome}" e botão Sair).
10. Criar tela/modal de onboarding que pergunta o saldo inicial no primeiro acesso.

**Critérios de aceite:**
- Criar conta pelo frontend redireciona ao dashboard; recarregar a página mantém o login.
- Logout limpa o token e volta ao login.
- Acessar `/dashboard` sem token redireciona para `/login`.
- As 7 categorias-semente aparecem no Prisma Studio após o cadastro.

```
⏸️ CHECKPOINT — FASE 2
PARE AQUI. Não inicie a Fase 3.
Entregue: resumo, arquivos, passo a passo de teste (cadastro, login, logout, rota protegida), comando de commit.
Aguarde "pode seguir".
```

## FASE 3 — Categorias (CRUD)

**Objetivo:** usuário gerencia suas categorias.

**Tarefas:**
1. **Backend:** `controllers/categoryController.js` e `routes/categoryRoutes.js` cobrindo listar, criar, editar e arquivar (contratos na Parte VI). Toda query filtra por `req.userId`.
2. **Frontend:** página `Categories.jsx` com a lista de categorias e modal de criação/edição (nome, tipo, cor, ícone). Botão de arquivar com confirmação.
3. Adicionar item "Categorias" na navegação.

**Critérios de aceite:**
- Criar, editar e arquivar categoria funciona ponta a ponta.
- Categoria arquivada some da lista de seleção mas continua existindo.
- Layout coerente com a aba "Categorias" do `wireframes-finapp.html`.

```
⏸️ CHECKPOINT — FASE 3
PARE AQUI. Não inicie a Fase 4.
Entregue: resumo, arquivos, passo a passo de teste, comando de commit.
Aguarde "pode seguir".
```

## FASE 4 — Transações e cálculo de saldo

**Objetivo:** o coração do app — lançar transações e ver o saldo cumulativo, equivalente à planilha.

**Tarefas:**
1. **Backend:** `services/balanceService.js` com a lógica de cálculo de saldo (RN-01) e o saldo cumulativo por dia.
2. **Backend:** `controllers/transactionController.js` e rotas: listar por mês com filtros, criar, editar, excluir (contratos na Parte VI).
3. **Frontend:** página `Transactions.jsx` reproduzindo a tabela mensal (`Data | Tipo | Categoria | Descrição | Entrada | Saída | Saldo`), com coloração do saldo (RN-05) e navegação entre meses.
4. **Frontend:** modal `TransactionForm` para criar/editar (tipo, valor, data, categoria, descrição).
5. Exclusão com confirmação; o saldo recalcula após qualquer mudança.

**Critérios de aceite:**
- Adicionar/editar/excluir transação atualiza a tabela e o saldo cumulativo corretamente.
- Filtros por tipo e categoria funcionam.
- Coloração verde/amarelo/vermelho do saldo segue a RN-05.
- Navegação entre meses funciona.

```
⏸️ CHECKPOINT — FASE 4
PARE AQUI. Não inicie a Fase 5.
Entregue: resumo, arquivos, passo a passo de teste com casos (entrada, saída, edição, exclusão, troca de mês), comando de commit.
Aguarde "pode seguir".
```

## FASE 5 — Recorrências e projeção

**Objetivo:** gastos/entradas fixas que alimentam a projeção do restante do mês.

**Tarefas:**
1. **Backend:** `controllers/recurrenceController.js` e rotas (listar, criar, editar, toggle, excluir).
2. **Backend:** `services/projectionService.js` que, dado um mês, gera as "linhas projetadas" a partir das recorrências ativas (RN-02) — sem persistir nada.
3. **Backend:** rota `GET /api/transactions/month-table` que devolve transações reais + linhas projetadas com saldo cumulativo.
4. **Frontend:** página `Recurrences.jsx` (lista + modal de criação/edição, ações pausar/reativar/excluir).
5. **Frontend:** ajustar a tabela mensal da Fase 4 para exibir as linhas projetadas com estilo diferenciado (hachurado, como no wireframe).

**Critérios de aceite:**
- Criar uma recorrência mensal faz aparecerem linhas projetadas nos meses futuros.
- Linhas projetadas são visualmente distintas das reais.
- Pausar a recorrência remove as projeções futuras dela.

```
⏸️ CHECKPOINT — FASE 5
PARE AQUI. Não inicie a Fase 6.
Entregue: resumo, arquivos, passo a passo de teste, comando de commit.
Aguarde "pode seguir".
```

## FASE 6 — Dashboard

**Objetivo:** a tela inicial que responde "quanto tenho / tinha / vou ter".

**Tarefas:**
1. **Backend:** `controllers/dashboardController.js` e rota `GET /api/dashboard?month=YYYY-MM` retornando os KPIs e séries (contrato na Parte VI).
2. **Frontend:** página `Dashboard.jsx` completa: cards de KPI (saldo atual, saldo antes da última entrada, projeção fim do mês, gasto do mês), gráfico de evolução do saldo (Recharts, linha realizada + projetada), lista de próximas recorrências, botões de ação rápida (+ Entrada / − Saída) e navegação entre meses.

**Critérios de aceite:**
- Os 4 KPIs batem com os dados das transações de teste.
- O gráfico de evolução renderiza com linha cheia (realizado) e tracejada (projetado).
- Botões de ação rápida abrem o modal de transação.

```
⏸️ CHECKPOINT — FASE 6
PARE AQUI. Não inicie a Fase 7.
Entregue: resumo, arquivos, passo a passo de teste, comando de commit.
Aguarde "pode seguir".
```

## FASE 7 — Relatórios

**Objetivo:** visualizações dos padrões de gasto.

**Tarefas:**
1. **Backend:** `controllers/reportController.js` e as 3 rotas de relatórios (Parte VI).
2. **Frontend:** página `Reports.jsx` com: gráfico de pizza de gastos por categoria, gráfico de barras de saldo final mês a mês e gráfico comparativo entrada vs saída (todos com Recharts).

**Critérios de aceite:**
- Os 3 gráficos renderizam com dados reais do usuário.
- Os totais por categoria batem com a tabela de transações.

```
⏸️ CHECKPOINT — FASE 7
PARE AQUI. Não inicie a Fase 8.
Entregue: resumo, arquivos, passo a passo de teste, comando de commit.
Aguarde "pode seguir".
```

## FASE 8 — Polimento e deploy

**Objetivo:** app publicado e utilizável.

**Tarefas:**
1. Revisão de responsividade mobile em todas as telas.
2. Tratamento de erros e estados de carregamento (loading/empty states).
3. Revisão de UX do onboarding.
4. Deploy do backend (Railway ou Render) + banco MySQL gerenciado.
5. Deploy do frontend (Vercel), apontando para a URL de produção do backend.
6. Configurar variáveis de ambiente de produção e CORS.
7. Atualizar o `README.md` com instruções de produção.

**Critérios de aceite:**
- App acessível por uma URL pública com HTTPS.
- Fluxo completo (cadastro → transação → dashboard) funciona em produção.
- Funciona bem em tela de celular.

```
⏸️ CHECKPOINT — FASE 8
PARE AQUI. MVP concluído.
Entregue: resumo geral, URL de produção, instruções de teste e o que ficou para o roadmap pós-MVP.
```

---

# PARTE VIII — ROADMAP PÓS-MVP

Itens para depois do MVP, em ordem sugerida de prioridade: login social com Google; recuperação de senha por e-mail; exportação de transações em CSV; busca de transações por texto; modo escuro; metas de gasto com alertas; múltiplas contas (corrente, carteira, poupança); importação de extrato bancário (OFX/CSV); PWA instalável; notificações de recorrências a vencer.

---

# PARTE IX — REFERÊNCIAS

- **`wireframes-finapp.html`** — protótipo de baixa fidelidade de todas as telas + diagrama ER + fluxo de telas. Abrir no navegador. É a referência visual oficial.
- Este documento substitui os antigos `requisitos-finapp.md` e `setup-passo-a-passo.md` (podem ser apagados ou mantidos só como histórico).

---

*Documento mestre do FinApp · v1.0 · maio/2026. Atualizar conforme decisões forem tomadas ao longo do desenvolvimento.*
