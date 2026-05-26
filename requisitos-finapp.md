# FinApp — Documento de Requisitos do MVP

**Autor:** Murillo Lopes
**Versão:** 0.1 (rascunho inicial — fase de planejamento)
**Data:** Maio / 2026
**Status:** Em definição

---

## 1. Visão geral

### 1.1 O problema
Hoje o controle financeiro pessoal é feito numa planilha Excel onde cada mês é uma tabela com colunas Data, Entrada, Saída, Gasto Diário e Saldo. A planilha funciona, mas tem limitações: não é móvel, não tem categorização rica, projeção do restante do mês é manual, e não dá pra evoluir pra uso por outras pessoas.

### 1.2 A proposta
Um aplicativo web (responsivo, mobile-first) que reproduz a lógica da planilha atual, mas adiciona:
- Categorização customizável das transações
- Projeção automática do saldo até o fim do mês com base em recorrências
- Visualizações gráficas dos padrões de gasto
- Multi-usuário pronto desde o primeiro deploy (mesmo que inicialmente só o autor utilize)

### 1.3 Escopo do MVP
O MVP entrega o suficiente pra substituir a planilha pessoal. Recursos avançados (Open Finance, importação de extratos, metas, múltiplas moedas, divisão de despesas) ficam fora do MVP e entram no roadmap.

### 1.4 Fora do escopo do MVP
- Importação automática de extratos bancários (OFX, CSV de banco)
- Integração com Open Finance / Pix
- Metas de gasto e alertas automáticos
- Múltiplas contas bancárias (apenas uma "Carteira Principal" no MVP)
- Múltiplas moedas
- Divisão de despesas entre pessoas
- App nativo iOS/Android (PWA atende o MVP)
- Exportação fiscal / relatório IR

---

## 2. Personas

### 2.1 Persona primária — "Murillo, o usuário organizado"
Pessoa que já controla suas finanças manualmente em planilha, conhece o próprio fluxo de receitas e despesas, e quer:
- Lançar entradas e saídas rapidamente
- Ver de relance "quanto tenho hoje" e "quanto vou ter no fim do mês"
- Acompanhar tendências sem montar gráficos manualmente

### 2.2 Persona secundária (pós-MVP) — "Usuário casual"
Pessoa interessada em começar a controlar suas finanças, mas sem disciplina prévia. Precisa de:
- Onboarding mais didático
- Sugestões de categorias prontas
- Lembretes (notificações) — fora do MVP

---

## 3. Requisitos funcionais

### 3.1 Autenticação e conta
- **RF-01:** Cadastro de usuário com e-mail e senha
- **RF-02:** Login com e-mail e senha
- **RF-03:** Recuperação de senha via e-mail
- **RF-04:** Login social com Google (OAuth) — desejável no MVP
- **RF-05:** Edição de perfil (nome, e-mail, troca de senha)
- **RF-06:** Logout
- **RF-07:** Onboarding curto no primeiro acesso (nome do usuário e saldo inicial da carteira)

### 3.2 Transações
- **RF-08:** Cadastrar nova transação (entrada ou saída) com: tipo, valor, data, categoria, descrição opcional
- **RF-09:** Listar transações do mês selecionado, ordenadas por data
- **RF-10:** Editar transação existente
- **RF-11:** Excluir transação (com confirmação)
- **RF-12:** Filtrar transações por: tipo, categoria, intervalo de datas
- **RF-13:** Buscar transações por texto na descrição
- **RF-14:** Marcar transação como recorrente no momento do cadastro (atalho que cria a recorrência associada)

### 3.3 Categorias
- **RF-15:** Cadastrar nova categoria com: nome, tipo (entrada/saída), cor, ícone
- **RF-16:** Listar categorias do usuário
- **RF-17:** Editar categoria existente
- **RF-18:** Arquivar categoria (não exclui — preserva o histórico de transações vinculadas)
- **RF-19:** Sistema deve criar automaticamente um conjunto inicial de categorias sugeridas ao criar a conta (Salário, Alimentação, Casa, Transporte, Lazer, Saúde, Outros)

### 3.4 Recorrências (gastos e entradas fixas)
- **RF-20:** Cadastrar recorrência com: tipo, valor, descrição, categoria, frequência (mensal/semanal/anual), dia do mês, data de início, data de término opcional
- **RF-21:** Listar recorrências ativas e pausadas
- **RF-22:** Editar recorrência (alteração só vale para lançamentos futuros)
- **RF-23:** Pausar / reativar recorrência
- **RF-24:** Excluir recorrência (transações já geradas no passado permanecem)
- **RF-25:** Recorrências futuras devem aparecer como "linhas projetadas" (visualmente diferentes) na tabela do mês, calculadas em runtime
- **RF-26:** No dia certo (ou sob confirmação do usuário), a recorrência gera uma transação concreta editável

### 3.5 Dashboard e projeção
- **RF-27:** Exibir saldo atual (soma de todas as transações até a data corrente)
- **RF-28:** Exibir saldo anterior à última entrada
- **RF-29:** Exibir projeção do saldo no fim do mês (saldo atual + entradas projetadas − saídas projetadas, considerando recorrências)
- **RF-30:** Exibir total gasto no mês corrente
- **RF-31:** Exibir gráfico de evolução do saldo dia a dia, com linha cheia (realizado) e tracejada (projetado)
- **RF-32:** Exibir lista das próximas 4-5 recorrências
- **RF-33:** Permitir navegação entre meses (anterior, atual, próximo)

### 3.6 Relatórios
- **RF-34:** Gráfico de pizza de gastos por categoria no mês selecionado
- **RF-35:** Gráfico de barras com saldo final mês a mês (últimos 6 meses)
- **RF-36:** Gráfico comparativo de entradas vs saídas dos últimos 6 meses

---

## 4. Requisitos não funcionais

### 4.1 Usabilidade
- **RNF-01:** Lançamento de uma transação em até 3 cliques a partir do dashboard
- **RNF-02:** Interface responsiva, com prioridade para experiência mobile (mobile-first)
- **RNF-03:** Idioma português brasileiro; arquitetura preparada para internacionalização posterior
- **RNF-04:** Acessibilidade básica: contraste suficiente, navegação por teclado, labels em todos os campos

### 4.2 Performance
- **RNF-05:** Tempo de carregamento inicial (Time to Interactive) abaixo de 3 segundos em conexão 4G
- **RNF-06:** Operações de CRUD de transação respondem em até 1 segundo
- **RNF-07:** Cálculo do saldo do mês com até 200 transações concluído em até 500 ms

### 4.3 Segurança
- **RNF-08:** Senhas armazenadas com hash forte (bcrypt ou argon2)
- **RNF-09:** Autenticação por JWT com refresh token, expiração de 7 dias
- **RNF-10:** HTTPS obrigatório em produção
- **RNF-11:** Isolamento de dados entre usuários via row-level security ou filtro obrigatório por user_id em todas as queries
- **RNF-12:** Conformidade com LGPD: política de privacidade, possibilidade de exclusão de conta e dados, consentimento explícito

### 4.4 Disponibilidade
- **RNF-13:** Disponibilidade alvo de 99% (suficiente para MVP)
- **RNF-14:** Backup diário automatizado do banco

### 4.5 Manutenibilidade
- **RNF-15:** Código versionado em Git
- **RNF-16:** Testes automatizados cobrindo regras de negócio críticas (cálculo de saldo, geração de projeções)
- **RNF-17:** CI/CD com deploy automático em ambiente de staging

---

## 5. Regras de negócio

- **RN-01:** Saldo é calculado dinamicamente: `saldo(data) = saldo_inicial + Σ(entradas até data) − Σ(saídas até data)`. Não é armazenado em coluna.
- **RN-02:** Linhas de "projeção" no mês são calculadas em runtime a partir das recorrências ativas — não criam registros físicos no banco até virarem transações reais.
- **RN-03:** Uma transação gerada por recorrência mantém o vínculo (`recurrence_id`) com a recorrência-mãe, mas pode ter o valor alterado individualmente sem afetar a recorrência.
- **RN-04:** Categoria arquivada continua aparecendo nas transações antigas, mas não pode ser selecionada em novos lançamentos.
- **RN-05:** Coloração do saldo (verde / amarelo / vermelho) segue regra:
  - Verde: saldo > 30% da entrada média mensal do usuário
  - Amarelo: saldo entre 0 e 30%
  - Vermelho: saldo negativo ou zero
- **RN-06:** Excluir uma transação recalcula o saldo de todas as datas posteriores em tempo real.
- **RN-07:** Toda data exibida segue o padrão dd/mm/aaaa; valores monetários seguem o padrão pt-BR (R$ 1.234,56).
- **RN-08:** Mês exibido por padrão no dashboard é o mês corrente baseado no fuso do usuário (assumido America/Sao_Paulo no MVP).

---

## 6. User stories priorizadas (MoSCoW)

### Must have (essencial pra o MVP funcionar)
1. Como usuário, quero criar uma conta com e-mail e senha pra ter meus dados protegidos.
2. Como usuário, quero registrar entradas e saídas rapidamente pra capturar tudo que acontece.
3. Como usuário, quero classificar minhas transações em categorias pra entender pra onde vai meu dinheiro.
4. Como usuário, quero ver o saldo atual destacado pra saber quanto tenho disponível agora.
5. Como usuário, quero ver a projeção do saldo até o fim do mês pra me planejar.
6. Como usuário, quero cadastrar gastos e entradas recorrentes uma única vez pra eles entrarem automaticamente na projeção.
7. Como usuário, quero navegar pela lista do mês com saldo cumulativo dia a dia, igual à minha planilha.

### Should have (importante, idealmente entra no MVP)
8. Como usuário, quero criar e editar minhas próprias categorias pra refletir minha realidade.
9. Como usuário, quero ver gráficos do meu padrão de gasto por categoria pra identificar onde estou gastando demais.
10. Como usuário, quero comparar saldos de meses anteriores pra ver minha evolução.
11. Como usuário, quero entrar com Google pra não precisar lembrar de mais uma senha.

### Could have (entra se sobrar tempo)
12. Como usuário, quero exportar minhas transações em CSV pra fazer análises externas.
13. Como usuário, quero buscar transações por descrição pra encontrar lançamentos antigos.
14. Como usuário, quero modo escuro pra usar de noite sem cansar a vista.

### Won't have (fica pro pós-MVP)
15. Importação de extrato bancário OFX/CSV.
16. Open Finance / Pix.
17. Múltiplas contas bancárias e cartões.
18. Metas de gasto com alertas.
19. Divisão de despesas entre pessoas.
20. App nativo (PWA atende).

---

## 7. Modelo de dados (resumo)

Diagrama completo está no protótipo HTML (aba "Modelo de Dados"). Resumo das entidades:

- **users** — id, email (único), name, password_hash, created_at, last_login_at
- **accounts** — id, user_id, name, type, initial_balance, archived (no MVP, uma única conta por usuário criada automaticamente)
- **categories** — id, user_id, name, type (income/expense), color, icon, archived
- **transactions** — id, user_id, account_id, category_id, recurrence_id (nullable), type, amount, occurred_on, description, created_at, updated_at
- **recurrences** — id, user_id, account_id, category_id, type, amount, description, frequency, day_of_month, start_date, end_date (nullable), active

Restrições principais: `user_id` obrigatório em toda entidade derivada; `email` único em `users`; `amount > 0` em `transactions` e `recurrences` (o sinal vem do `type`).

---

## 8. Stack técnica definida

Stack escolhida para aproveitar a familiaridade do desenvolvedor com JavaScript e MySQL, mantendo bom ecossistema, baixo custo e caminho fácil pra escalar.

### 8.1 Frontend
- **React 18** com **Vite** (bundler e dev server moderno)
- **JavaScript** puro (sem TypeScript no MVP — pode ser introduzido em refatoração futura)
- **Tailwind CSS** (estilização utilitária, evita escrever CSS do zero)
- **React Router** (navegação entre telas)
- **Axios** (requisições HTTP ao backend)
- **Recharts** (gráficos do dashboard e relatórios)

### 8.2 Backend
- **Node.js LTS** com **Express** (framework HTTP minimalista, padrão da indústria)
- **Prisma ORM** (mapeia o schema MySQL pra código JS, gera migrations automaticamente — equivalente ao Hibernate/JPA do Java)
- **MySQL 8.x** (banco de dados)
- **bcrypt** (hash de senhas)
- **jsonwebtoken** (JWT para autenticação)
- **zod** (validação de payloads de entrada)
- **dotenv** (variáveis de ambiente)
- **cors** (libera chamadas do frontend)

### 8.3 Hospedagem (MVP)
- **Frontend:** Vercel (gratuito, deploy automático via GitHub)
- **Backend:** Railway ou Render (free tier suficiente pro MVP)
- **Banco:** Railway MySQL ou PlanetScale (free tier inicial)
- **Domínio:** opcional no MVP — usar subdomínio gratuito do Vercel até decidir

### 8.4 Ferramentas de desenvolvimento
- **VS Code** com extensões ESLint, Prettier, Prisma e Tailwind CSS IntelliSense
- **Git + GitHub** para versionamento
- **MySQL Workbench** ou **DBeaver** como cliente do banco
- **Postman** ou **Insomnia** para testar a API
- **Prisma Studio** (interface visual gerada pelo Prisma) para inspecionar dados em desenvolvimento

### 8.5 Estrutura do repositório
Monorepo simples com duas pastas-irmãs:
```
finapp/
├── backend/   ← API Node + Express + Prisma + MySQL
├── frontend/  ← App React + Vite
├── .gitignore
└── README.md
```

### 8.6 Observabilidade e qualidade
- **ESLint + Prettier** para padronização de código
- **Sentry** (free tier) para captura de erros em produção — opcional no MVP
- Logs nativos do Express + dashboard de logs do Railway/Render

### 8.7 Testes
- **Vitest + Testing Library** no frontend
- **Jest + Supertest** no backend para testes de rotas
- Foco mínimo em cobertura das regras de negócio críticas (cálculo de saldo, geração de projeções)

> **Onde achar o passo a passo:** o guia prático "do zero ao primeiro endpoint" está em `setup-passo-a-passo.md`, na mesma pasta deste documento.

---

## 9. Roadmap proposto

| Sprint | Duração sugerida | Entregas principais |
|---|---|---|
| **Sprint 0 — Fundação** | 1 semana | Setup do repo, ambiente, banco, esquema, autenticação básica |
| **Sprint 1 — Transações** | 2 semanas | CRUD completo de transações; tabela do mês; cálculo de saldo |
| **Sprint 2 — Categorias e Recorrências** | 2 semanas | CRUD de categorias e recorrências; geração de linhas projetadas |
| **Sprint 3 — Dashboard e KPIs** | 1 semana | KPIs do dashboard; gráfico de evolução; navegação entre meses |
| **Sprint 4 — Relatórios** | 1 semana | Gráficos de pizza, barras, comparativos |
| **Sprint 5 — Polimento e Beta** | 1 semana | Onboarding, responsivo mobile, ajustes UX, deploy beta privado |
| **Sprint 6 — Lançamento público** | 1 semana | LGPD, política de privacidade, landing page, monitoramento |

Total estimado: **~9 semanas (≈2 meses) de trabalho focado** para chegar do zero a um MVP em produção pública.

---

## 10. Critérios de aceite do MVP (Definition of Done)

O MVP é considerado pronto pra lançamento quando:
- Todas as user stories Must e Should foram implementadas e testadas
- Cobertura de testes automatizados ≥ 60% nas regras de negócio
- Aplicação está acessível em domínio próprio com HTTPS
- Política de privacidade e termos de uso publicados (LGPD)
- Onboarding funciona end-to-end (cadastro → primeira transação → ver dashboard)
- Não há bugs bloqueadores conhecidos
- Performance: dashboard carrega em < 3s em conexão 4G

---

## 11. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Escopo crescer durante o desenvolvimento | Alta | Alto | Lista MoSCoW rígida; recursos novos só entram após MVP |
| Performance do cálculo de saldo com muitas transações | Média | Médio | Indexar por (user_id, occurred_on); avaliar snapshots mensais se necessário |
| Custo da infraestrutura ao crescer | Baixa | Médio | Supabase free tier cobre primeiros usuários; planejar migração só quando necessário |
| LGPD mal implementada | Média | Alto | Consultar checklist oficial; pedir revisão jurídica antes do lançamento público |
| Falta de adesão de usuários reais (pós-MVP) | Alta | Médio | Lançar primeiro pra círculo próximo; coletar feedback antes de marketing |

---

## 12. Próximos passos imediatos

1. Validar este documento e o protótipo HTML com você mesmo (Murillo) — algum requisito faltando? Algo demais?
2. Decidir entre stack A (Supabase) ou B (backend próprio)
3. Comprar domínio e abrir contas (GitHub, Supabase ou provider escolhido, Vercel)
4. Setup do repositório com README, padrões de código e CI mínimo
5. Implementar Sprint 0 (fundação)

---

*Documento vivo — será atualizado conforme decisões forem tomadas.*
