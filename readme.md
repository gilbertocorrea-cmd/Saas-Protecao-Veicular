# 🚀 SaaS Proteção Veicular — Backend

API principal de um sistema SaaS white-label para gestão de associações de proteção veicular.

Projetado com foco em:
- Multi-tenant real
- Segurança de nível produção
- Escalabilidade
- Arquitetura modular

---

# 🛠️ Stack Tecnológica

- Runtime: Node.js (v20+)
- Linguagem: TypeScript (Strict Mode)
- Framework: Express.js 5.x
- ORM: Prisma
- Banco: MariaDB / MySQL
- Cache/Fila (em breve): Redis
- Storage (em breve): S3 / Backblaze

---

# 🧠 Arquitetura

Sistema baseado em módulos:
src/
modules/
auth/
user/
vehicle/


...


Separação por:
- controller
- service
- validação
- regras de negócio

---

# 🔐 Segurança (Implementado)

- ✔️ Bcrypt (hash de senha)
- ✔️ JWT RS256 (Access Token 15min)
- ✔️ Refresh Token com rotação + hash no banco
- ✔️ Rate limit básico (login)
- ✔️ Validação com Zod
- ✔️ Bloqueio de usuário INATIVO

---

# 🏢 Multi-Tenant (Implementado)

- ✔️ 1 banco com `tenantId`
- ✔️ Isolamento automático via Prisma middleware
- ✔️ Contexto por request (AsyncLocalStorage)
- ✔️ ADMIN_MASTER pode ver todos tenants

👉 Nenhuma query depende do dev lembrar de filtrar

---

# 🔑 RBAC (Controle de Acesso)

Hierarquia:

- ADMIN_MASTER → dono do SaaS
- GESTOR → dono da seguradora (tenant)
- FUNCIONARIO → equipe
- CLIENTE → usuário final

Regras:

- Apenas GESTOR gerencia usuários
- Sem escalonamento de privilégio
- Acesso isolado por tenant

---

# 🧾 Auditoria (AuditLog)

- ✔️ Todas operações de escrita são logadas
- ✔️ Rastreabilidade completa de ações
- ✔️ Base para compliance e debugging

---

# 🧱 Módulos Atuais

## Auth
- Login com bcrypt
- JWT + refresh token
- Rotação segura de tokens

## User
- CRUD completo
- RBAC aplicado
- Desativação (não delete)
- tokenVersion para invalidar sessão

## Vehicle
- CRUD completo
- Integração com FIPE
- Base pronta para vistoria

---

# ⚙️ Configuração

## 1. Variáveis de Ambiente

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/db"
JWT_PRIVATE_KEY="..."
JWT_PUBLIC_KEY="..."


2. Instalação
npm install

3. Banco de Dados
npx prisma migrate dev

4. Rodar servidor
npm run dev





📡 Endpoints Exemplo
Auth

POST /auth/login
POST /auth/refresh

User

GET /users
POST /users
PUT /users/:id
PATCH /users/:id/deactivate

Vehicle

GET /vehicles
POST /vehicles
PUT /vehicles/:id
DELETE /vehicles/:id




🚨 Regras de Negócio
Sem vistoria → sem contrato
Cliente inadimplente → bloqueio automático
Tenant não pago → bloqueado pelo sistema
Nunca deletar dados críticos (usar status)



🚀 Próximos Passos
📸 Módulo de Vistoria (upload + GPS)
💳 Integração com PSP (PIX/Boleto)
📄 Geração de contrato PDF
🤖 IA antifraude (worker + scoring)
📊 Dashboard Admin Master



🧠 Observações
Sistema pronto para escala multi-tenant
Base segura para produção (com ajustes finos)
Arquitetura preparada para crescimento


📌 Status do Projeto

🟢 Base completa (Auth + Multi-tenant + RBAC + Audit)

👉 Pronto para evolução de features