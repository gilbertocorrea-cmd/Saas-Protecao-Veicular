import { z } from 'zod'

export const createUserSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.enum(['FUNCIONARIO', 'CLIENTE']),
})

export const updateUserSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  role: z.enum(['FUNCIONARIO', 'CLIENTE']).optional(),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})
