# FinApp

Este repositório contém o MVP do FinApp, com backend em Node.js/Express e frontend em React/Vite.

## Como rodar

### Banco de dados (MySQL via Docker)
1. Tenha o Docker Desktop (ou Docker Engine) instalado e rodando.
2. Abra o terminal em `finapp` e execute `docker compose up -d`. Isso sobe um MySQL 8 na porta `3306`, já com o banco `finapp` criado e senha do usuário `root` igual a `finapp`.
3. Aguarde uns 15-20s no primeiro boot (o MySQL precisa inicializar os arquivos internos). Para acompanhar: `docker compose logs -f mysql` (até aparecer `ready for connections`).
4. Rode o script de schema: `docker exec -i finapp-mysql mysql -uroot -pfinapp finapp < backend/db/schema.sql`
5. Confira as tabelas: `docker exec -it finapp-mysql mysql -uroot -pfinapp finapp -e "SHOW TABLES;"`

Para parar o banco: `docker compose down` (mantém os dados). Para apagar os dados também: `docker compose down -v`.

### Backend
1. Abra o terminal em `finapp/backend`
2. Execute `npm install`
3. Copie `.env.example` para `.env` e preencha `DB_PASSWORD=finapp` (se estiver usando o Docker acima) e um `JWT_SECRET` qualquer
4. Execute `npm run dev`

### Frontend
1. Abra o terminal em `finapp/frontend`
2. Execute `npm install`
3. Execute `npm run dev`

## Notas
- O backend expõe `/api/health` para verificar se o servidor está funcionando.
- O frontend está configurado com React Router e Tailwind CSS.
