## Aviso

Este documento contém a arquitetura alvo do projeto.
Alguns componentes descritos ainda estão em fase de implementação e podem não estar presentes na versão atual do código.

# ARCHITECTURE.md — SaaS Proteção Veicular
> Documento de arquitetura consolidado. Usar como contexto no Cursor antes de qualquer implementação.

---

## 1. Visão Geral

Plataforma SaaS **white label multi-tenant** para gestão de associações de proteção veicular.
Cada seguradora é um **tenant** independente operando no mesmo banco de dados, isolado por `tenant_id`.

**Stack:**
- Backend: Node.js + TypeScript + Express
- ORM: Prisma
- Banco: MariaDB (1 banco, n tenants)
- Cache/Filas: Redis (Upstash em produção)
- Storage: S3 / Backblaze B2 (fotos, PDFs)
- Frontend: Flutter (iOS + Android + Web)
- Auth: JWT RS256 (Access Token 15min + Refresh Token 7 dias)

---

## 2. Multi-Tenancy

### Regra de ouro
**Todo SELECT, INSERT, UPDATE e DELETE deve incluir `tenant_id`.**
Isso é validado por middleware global no backend — nunca depender só do frontend.

### Middleware obrigatório em toda rota protegida
```
Request → authenticateJWT → resolveTenant → checkRole → controller
```

### Hierarquia de acesso
```
ADMIN_MASTER (dono da plataforma)
  └── vê TODOS os tenants
  └── pode suspender/bloquear/deletar tenants
  └── acessa KPIs globais e logs de auditoria

ADMIN (gestor da seguradora)
  └── vê apenas seu tenant_id
  └── gerencia usuários, veículos, contratos do seu tenant

FUNCIONARIO
  └── vê apenas seu tenant_id
  └── cria/edita vistorias e clientes

CLIENTE
  └── vê apenas seus próprios dados dentro do tenant
  └── consulta contrato, gera 2a via de boleto
```

---

## 3. Módulos do Sistema

| Módulo | Responsabilidade |
|--------|-----------------|
| auth | Login, logout, refresh token, 2FA (TOTP) |
| tenant | Onboarding, configuração white label, billing |
| user | CRUD de usuários, RBAC |
| vehicle | Cadastro de veículos, integração FIPE |
| inspection | Vistoria digital (foto + GPS + timestamp) |
| contract | Geração de PDF, assinatura digital |
| payment | Integração PSP (PIX/Boleto), webhooks |
| claim | Registro e gestão de sinistros |
| ai | Worker antifraude assíncrono |
| notification | Email, SMS, push (Firebase FCM) |
| audit | Log imutável de todas as ações |
| admin | Dashboard do ADMIN_MASTER |

---

## 4. Regras de Negócio (imutáveis)

- **RN01:** Vistoria aprovada é pré-requisito para gerar contrato
- **RN02:** Cliente com +5 dias de inadimplência → bloqueio automático do contrato
- **RN03:** Vistoria sem GPS válido = status INVALIDA (não pode gerar contrato)
- **RN04:** Tenant com plano SaaS vencido → sistema bloqueado pelo ADMIN_MASTER (automático após X dias)
- **RN05:** Toda ação de escrita (POST/PUT/DELETE) gera um registro em AuditLog
- **RN06:** Fotos de vistoria são re-encoded via sharp antes de salvar (segurança + padronização)
- **RN07:** Webhooks de PSP são validados por assinatura HMAC-SHA256 antes de processar

---

## 5. Segurança

### Auth
- Senhas: bcrypt com cost factor 12
- JWT: algoritmo RS256 (chave assimétrica), Access Token 15min, Refresh Token 7 dias
- Refresh Token: armazenado como hash (bcrypt) no banco, rotacionado a cada uso
- 2FA: TOTP obrigatório para roles ADMIN e ADMIN_MASTER

### API
- Rate limit: 100 req/min geral, 5 req/min em `/auth/login`, 10 req/min em `/payments`
- Validação: Zod em todas as rotas (body, params, query)
- Headers: Helmet.js (HSTS, CSP, X-Frame-Options, etc.)
- CORS: whitelist explícita de origens

### Dados
- CPF, dados bancários: encriptados com AES-256 via Prisma middleware antes de salvar
- Logs: mascaramento automático de dados sensíveis (CPF → `***.***.*40-**`)
- Uploads: validação de MIME type + re-encode com sharp (nunca salvar o binário original)

### Infraestrutura
- Cloudflare na frente de tudo (DDoS, WAF, SSL)
- IP whitelist para acesso ao admin master
- Backups diários do banco com retenção de 30 dias

---

## 6. Padrão de Resposta da API

Toda rota retorna este formato:

```typescript
// Sucesso
{ success: true, data: T, meta?: { page, total, perPage } }

// Erro
{ success: false, error: { code: string, message: string, details?: any } }
```

**Códigos de erro padronizados:**
- `AUTH_INVALID_CREDENTIALS` — credenciais erradas
- `AUTH_TOKEN_EXPIRED` — token expirado
- `TENANT_BLOCKED` — tenant bloqueado por inadimplência
- `PERMISSION_DENIED` — role sem acesso à rota
- `VALIDATION_ERROR` — input inválido (inclui `details` com campos)
- `RESOURCE_NOT_FOUND` — entidade não encontrada no tenant
- `FRAUD_DETECTED` — vistoria bloqueada por IA antifraude

---

## 7. Estrutura de Pastas (Backend)

```
/src
  /config         → env, database, redis, logger
  /middleware     → auth, tenant, rbac, rateLimiter, errorHandler
  /modules
    /auth         → controller, service, routes
    /tenant       → controller, service, routes
    /user         → controller, service, routes
    /vehicle      → controller, service, routes
    /inspection   → controller, service, routes, worker
    /contract     → controller, service, routes, pdf-generator
    /payment      → controller, service, routes, webhook-handler
    /claim        → controller, service, routes
    /ai           → worker, fraud-scorer, image-analyzer
    /notification → service, templates
    /audit        → service (auto-log middleware)
    /admin        → controller, service, routes (ADMIN_MASTER only)
  /prisma         → schema.prisma, migrations, seed
  /shared         → types, constants, utils, errors
  /jobs           → Bull queue definitions
```

---

## 8. Worker de IA Antifraude (fluxo)

```
1. Vistoria salva com status PENDENTE
2. Job publicado na fila Redis (Bull)
3. Worker consome o job:
   a. Valida coordenadas GPS (dentro do Brasil? mock GPS?)
   b. Cruza GPS com metadados EXIF da foto
   c. Calcula pHash da imagem (duplicata de vistoria anterior?)
   d. Chama Google Vision API (adulteração, colagem, texto sobreposto)
   e. Calcula score de fraude 0–100
4. Score <= 30: status → APROVADA
   Score 31–69: status → REVISAR (alerta para gestor)
   Score >= 70: status → SUSPEITA (alerta crítico + bloqueio automático)
5. FraudAlert criado se score > 30
6. Notificação push enviada ao gestor
```

---

## 9. Integração FIPE

- API: `https://parallelum.com.br/fipe/api/v2`
- Cache: Redis com TTL de 24h (dados não mudam frequentemente)
- Fluxo: busca marca → modelo → ano → retorna valor FIPE para o veículo
- Campos salvos no Vehicle: `fipe_code`, `fipe_value`, `fipe_updated_at`

---

## 10. Decisões Técnicas Registradas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| 1 banco vs. 1 banco por tenant | 1 banco com tenant_id | Simplicidade operacional no MVP, migração possível depois |
| JWT simétrico vs. assimétrico | RS256 assimétrico | Permite verificar tokens sem expor chave privada |
| PSP | Pagar.me (principal) | API REST simples, suporte a split, PIX nativo |
| Storage | Backblaze B2 | 10x mais barato que S3, compatível com SDK S3 |
| Filas | BullMQ + Redis | Maduro, confiável, suporte a retry e delay |
| Deploy MVP | Railway | Zero DevOps, deploy por git push, escala depois |
