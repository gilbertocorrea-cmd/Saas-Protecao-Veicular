import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../prisma';

const createUserSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.enum(['FUNCIONARIO', 'CLIENTE']),
});

const updateUserSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  role: z.enum(['FUNCIONARIO', 'CLIENTE']).optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function sendSuccess<T>(res: Response, status: number, data: T) {
  return res.status(status).json({ success: true, data });
}

function sendValidationError(res: Response, details: unknown) {
  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Input inválido', details },
  });
}

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error.flatten());

  const tenantId = (req as any).user?.tenantId as number | undefined;
  const actorRole = (req as any).user?.role as string | undefined;
  if (!tenantId || !actorRole) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' } });
  }

  const senhaHash = await bcrypt.hash(parsed.data.senha, 12);
  const created = await prisma.usuario.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email,
      senha: senhaHash,
      tipo_usuario: parsed.data.role,
      status: 'ATIVO',
      tenantId,
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
  });

  return sendSuccess(res, StatusCodes.CREATED, {
    id: created.id,
    tenantId: created.tenantId,
    nome: created.nome,
    email: created.email,
    role: created.tipo_usuario,
    status: created.status,
    createdAt: created.createdAt,
  });
}

export async function listUsers(req: Request, res: Response) {
  const tenantId = (req as any).user?.tenantId as number | undefined
  if (!tenantId) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' } })
  }

  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  const nome = typeof req.query.nome === 'string' ? req.query.nome.trim() : undefined
  const email = typeof req.query.email === 'string' ? req.query.email.trim() : undefined
  const role = typeof req.query.role === 'string' ? req.query.role.trim() : undefined

  const take = limit > 0 ? Math.min(limit, 100) : 20
  const skip = page > 1 ? (page - 1) * take : 0

  const where: any = { tenantId }
  if (nome) where.nome = { contains: nome, mode: 'insensitive' }
  if (email) where.email = { contains: email, mode: 'insensitive' }
  if (role) where.tipo_usuario = role

  const [total, users] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
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
      take,
      skip,
    }),
  ])

  return sendSuccess(res, StatusCodes.OK, {
    items: users.map((u: any) => ({
      id: u.id,
      tenantId: u.tenantId,
      nome: u.nome,
      email: u.email,
      role: u.tipo_usuario,
      status: u.status,
      createdAt: u.createdAt,
    })),
    meta: {
      page: page > 0 ? page : 1,
      limit: take,
      total,
    },
  })
}

export async function updateUser(req: Request, res: Response) {
  const params = idParamSchema.safeParse(req.params);
  if (!params.success) return sendValidationError(res, params.error.flatten());

  const body = updateUserSchema.safeParse(req.body);
  if (!body.success) return sendValidationError(res, body.error.flatten());

  const tenantId = (req as any).user?.tenantId as number | undefined;
  const actorId = (req as any).user?.id as number | undefined;
  if (!tenantId || !actorId) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' } });
  }

  if ((body.data as any).role === 'GESTOR') {
    return res.status(403).json({ success: false, error: { code: 'PERMISSION_DENIED', message: 'Sem permissão' } });
  }

  const id = params.data.id;
  const before = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      createdAt: true,
    },
  });

  if (!before) {
    return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Usuário não encontrado' } });
  }

  const data: any = {};
  if (body.data.nome) data.nome = body.data.nome;
  if (body.data.email) data.email = body.data.email;
  if (body.data.senha) data.senha = await bcrypt.hash(body.data.senha, 12);
  if (body.data.role) data.tipo_usuario = body.data.role;

  const updated = await prisma.usuario.update({
    where: { id },
    data,
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      status: true,
      createdAt: true,
    },
  });

  return sendSuccess(res, StatusCodes.OK, {
    id: updated.id,
    tenantId: updated.tenantId,
    nome: updated.nome,
    email: updated.email,
    role: updated.tipo_usuario,
    status: updated.status,
    createdAt: updated.createdAt,
  });
}

export async function deactivateUser(req: Request, res: Response) {
  const params = idParamSchema.safeParse(req.params);
  if (!params.success) return sendValidationError(res, params.error.flatten());

  const tenantId = (req as any).user?.tenantId as number | undefined;
  if (!tenantId) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' } });
  }

  const id = params.data.id;
  const before = await prisma.usuario.findUnique({
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
  });

  if (!before) {
    return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Usuário não encontrado' } });
  }

  const updated = await prisma.usuario.update({
    where: { id },
    data: {
      status: 'INATIVO',
      tokenVersion: before.tokenVersion + 1,
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
  });

  return sendSuccess(res, StatusCodes.OK, {
    id: updated.id,
    tenantId: updated.tenantId,
    nome: updated.nome,
    email: updated.email,
    role: updated.tipo_usuario,
    status: updated.status,
    createdAt: updated.createdAt,
  });
}

