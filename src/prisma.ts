// Prisma padrão (SEM adapter — evita erro "No database selected")
import { PrismaClient } from '@prisma/client'

// Contexto de tenant (vai usar depois quando reativar isolamento)
import { getTenantContext } from './tenantContext'

// =====================================================
// 🚀 INSTÂNCIA DO PRISMA
// =====================================================
// Usa DATABASE_URL do .env automaticamente
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

// =====================================================
// 🏢 MODELOS QUE POSSUEM tenantId
// =====================================================
// (vai ser usado quando reativarmos isolamento automático)
const TENANT_MODELS = new Set<string>([
  'Usuario',
  'Cliente',
  'Veiculo',
  'Vistoria',
  'Financeiro',
  'RefreshToken',
  'AuditLog',
])

// =====================================================
// 🔧 HELPERS (futuros)
// =====================================================

function addTenantToWhere(where: any, tenantId: number) {
  if (!where) return { tenantId }
  if (where.tenantId !== undefined) return where
  return { AND: [where, { tenantId }] }
}

function addTenantToData(data: any, tenantId: number) {
  if (!data) return data
  if (data.tenantId !== undefined) return data
  return { ...data, tenantId }
}

// =====================================================
// ⚠️ ISOLAMENTO MULTI-TENANT (DESATIVADO TEMPORARIAMENTE)
// =====================================================
//
// Motivo:
// - Prisma 7 mudou comportamento
// - $use não funciona igual antes com adapter
// - estava quebrando a conexão
//
// Quando estabilizar:
// - reativar isso aqui
// - ou migrar para query extensions
//

/*
(prisma as any).$use(async (params: any, next: any) => {
  const ctx = getTenantContext()
  if (!ctx) return next(params)
  if (ctx.role === 'ADMIN_MASTER') return next(params)

  if (!params.model || !TENANT_MODELS.has(params.model)) {
    return next(params)
  }

  const tenantId = ctx.tenantId
  const args: any = params.args ?? {}

  switch (params.action) {
    case 'findMany':
    case 'findFirst':
    case 'findFirstOrThrow':
    case 'count':
    case 'aggregate':
    case 'groupBy': {
      args.where = addTenantToWhere(args.where, tenantId)
      params.args = args
      return next(params)
    }

    case 'findUnique':
    case 'findUniqueOrThrow': {
      args.where = { ...(args.where ?? {}), tenantId }
      params.args = args
      return next(params)
    }

    case 'create': {
      args.data = addTenantToData(args.data, tenantId)
      params.args = args
      return next(params)
    }

    case 'createMany': {
      if (Array.isArray(args.data)) {
        args.data = args.data.map((d: any) => addTenantToData(d, tenantId))
      } else {
        args.data = addTenantToData(args.data, tenantId)
      }
      params.args = args
      return next(params)
    }

    case 'update':
    case 'upsert': {
      args.where = { ...(args.where ?? {}), tenantId }
      if (params.action === 'upsert') {
        args.create = addTenantToData(args.create, tenantId)
      }
      params.args = args
      return next(params)
    }

    case 'updateMany':
    case 'deleteMany': {
      args.where = addTenantToWhere(args.where, tenantId)
      params.args = args
      return next(params)
    }

    case 'delete': {
      args.where = { ...(args.where ?? {}), tenantId }
      params.args = args
      return next(params)
    }

    default:
      return next(params)
  }
})
*/