import { prisma } from '../../prisma'
import bcrypt from 'bcrypt'

export async function createUserRecord(data: { nome: string; email: string; senha: string; role: string; tenantId: number }) {
  const senhaHash = await bcrypt.hash(data.senha, 12)

  return prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: senhaHash,
      tipo_usuario: data.role,
      status: 'ATIVO',
      tenantId: data.tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      tokenVersion: true,
      createdAt: true,
    },
  })
}

export async function findUsers() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  })
}

export async function findUserById(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      tokenVersion: true,
      createdAt: true,
    },
  })
}

export async function updateUserRecord(id: number, data: Partial<{ nome: string; email: string; senha: string; role: string }>) {
  const payload: any = {}
  if (data.nome) payload.nome = data.nome
  if (data.email) payload.email = data.email
  if (data.senha) payload.senha = await bcrypt.hash(data.senha, 12)
  if (data.role) payload.tipo_usuario = data.role

  return prisma.usuario.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function deactivateUserRecord(id: number, currentVersion: number) {
  return prisma.usuario.update({
    where: { id },
    data: {
      status: 'INATIVO',
      tokenVersion: currentVersion + 1,
    },
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      createdAt: true,
    },
  })
}
