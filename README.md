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
3. Execute `npm run dev`

## Notas
- O backend expõe `/api/health` para verificar se o servidor está funcionando.
- O frontend está configurado com React Router e Tailwind CSS.
