import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Semeando dados...')

  // =========================
  // 🏢 CRIA TENANT
  // =========================
  const tenant = await prisma.tenant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Tenant Principal',
      status: 'ATIVO',
    },
  })

  // =========================
  // 👤 CRIA USUÁRIO ADMIN
  // =========================
  await prisma.usuario.upsert({
    where: { email: 'admin@saas.com' },
    update: {},
    create: {
      email: 'admin@saas.com',
      nome: 'Gilberto Gestor',
      senha: '123',
      tipo_usuario: 'GESTOR',
      tenantId: tenant.id, // 🔥 obrigatório
    },
  })

  console.log('✅ Banco de dados pronto!')
}

main()
  .catch((e) => {
    console.error('❌ ERRO NO SEED:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })