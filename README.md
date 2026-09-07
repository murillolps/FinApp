# FinApp

Este repositório contém o MVP do FinApp, com backend em Node.js/Express e frontend em React/Vite.

## Como rodar

### Banco de dados (MySQL na nuvem — Clever Cloud)
1. Crie uma conta em [clever-cloud.com](https://www.clever-cloud.com/) e crie um add-on **MySQL** no plano **DEV** (gratuito).
2. Na aba de informações do add-on, pegue **Host**, **Port**, **Database**, **User** e **Password**.
3. Conecte no banco com um cliente MySQL (linha de comando, DBeaver, MySQL Workbench, TablePlus etc.) usando esses dados e rode o script `backend/db/schema.sql` para criar as tabelas. Exemplo via linha de comando:
   ```
   mysql -h <host> -P <port> -u <user> -p <database> < backend/db/schema.sql
   ```
4. Confira as tabelas: `mysql -h <host> -P <port> -u <user> -p <database> -e "SHOW TABLES;"`

> Alternativa local: se sua máquina aguenta Docker, ainda existe um `docker-compose.yml` em `finapp/` (`docker compose up -d`, depois aplique o `schema.sql` do mesmo jeito).

### Backend
1. Abra o terminal em `finapp/backend`
2. Execute `npm install`
3. Copie `.env.example` para `.env` e preencha `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` com os dados do Clever Cloud, `DB_SSL=true` (a maioria dos provedores cloud exige conexão criptografada) e um `JWT_SECRET` qualquer
4. Execute `npm run dev`

### Frontend
1. Abra o terminal em `finapp/frontend`
2. Execute `npm install`
3. (Opcional em dev) copie `.env.example` para `.env` se quiser apontar para um backend que não seja `http://localhost:3001`
4. Execute `npm run dev`

## Notas
- O backend expõe `/api/health` para verificar se o servidor está funcionando.
- O frontend está configurado com React Router e Tailwind CSS.

## Produção (deploy)

O banco de dados já roda na nuvem (Clever Cloud, ver acima). Faltam backend e frontend.

### Backend (Railway ou Render)
1. Crie uma conta e um novo serviço "Web Service" apontando para este repositório, pasta raiz `finapp/backend`
2. Build command: `npm install` · Start command: `npm start` (ou `node src/server.js`)
3. Configure as variáveis de ambiente de produção (mesmas do `.env`, com os dados do Clever Cloud):
   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`, `PORT` (a plataforma geralmente define sozinha)
4. Depois de publicar o frontend (próximo passo) e saber a URL dele, defina `CORS_ORIGIN` com essa URL (ex.: `https://finapp.vercel.app`) para restringir quem pode chamar a API
5. Anote a URL pública do backend (ex.: `https://finapp-backend.up.railway.app`)

### Frontend (Vercel)
1. Crie uma conta na [Vercel](https://vercel.com/) e importe este repositório
2. Root directory: `finapp/frontend` · Framework preset: Vite
3. Configure a variável de ambiente `VITE_API_URL` apontando para a URL pública do backend + `/api` (ex.: `https://finapp-backend.up.railway.app/api`)
4. Deploy. A Vercel dá uma URL pública com HTTPS automaticamente

### Checklist final
- [ ] Backend publicado e `/api/health` responde `{"status":"ok"}`
- [ ] Frontend publicado, `VITE_API_URL` aponta pro backend certo
- [ ] `CORS_ORIGIN` do backend aponta pra URL do frontend
- [ ] Fluxo completo testado em produção: cadastro → onboarding → lançamento → dashboard
- [ ] Testado em tela de celular (ou modo responsivo do navegador)
