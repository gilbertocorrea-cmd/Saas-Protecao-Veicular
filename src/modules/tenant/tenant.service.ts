import { prisma } from '../../prisma';

export interface TenantFilters {
  role: string;
  tenantId: number;
}

export async function createTenant(data: { nome: string }) {
  return prisma.tenant.create({
    data: {
      nome: data.nome,
      status: 'ATIVO',
    },
  });
}

export async function getTenants(filters: TenantFilters) {
  const where = filters.role === 'ADMIN_MASTER' ? {} : { id: filters.tenantId };

  return prisma.tenant.findMany({
    where,
    select: {
      id: true,
      nome: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getTenantById(id: number, filters: TenantFilters) {
  const where = filters.role === 'ADMIN_MASTER' ? { id } : { id: filters.tenantId };

  return prisma.tenant.findUnique({
    where,
    select: {
      id: true,
      nome: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateTenant(id: number, data: { nome?: string; status?: string }, filters: TenantFilters) {
  if (filters.role === 'ADMIN_MASTER') {
    return prisma.tenant.update({
      where: { id },
      data,
    });
  }

  if (filters.role !== 'GESTOR') {
    throw new Error('Acesso negado');
  }

  if (id !== filters.tenantId) {
    throw new Error('Acesso negado');
  }

  return prisma.tenant.update({
    where: { id },
    data,
  });
}

export async function updateTenantConfig(
  id: number,
  data: { logo_url?: string; primary_color?: string; secondary_color?: string; app_name?: string },
  filters: TenantFilters
) {
  if (filters.role !== 'ADMIN_MASTER' && filters.role !== 'GESTOR') {
    throw new Error('Acesso negado');
  }

  if (filters.role !== 'ADMIN_MASTER' && id !== filters.tenantId) {
    throw new Error('Acesso negado');
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } })
  if (!tenant) {
    throw new Error('Tenant não encontrado');
  }

  return tenant
}

export async function suspendTenant(id: number, filters: TenantFilters) {
  if (filters.role !== 'ADMIN_MASTER') {
    throw new Error('Acesso negado');
  }

  return prisma.tenant.update({
    where: { id },
    data: { status: 'SUSPENSO' },
  });
}

export async function reactivateTenant(id: number, filters: TenantFilters) {
  if (filters.role !== 'ADMIN_MASTER') {
    throw new Error('Acesso negado');
  }

  return prisma.tenant.update({
    where: { id },
    data: { status: 'ATIVO' },
  });
}