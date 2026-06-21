import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tenantId: z.number().int().positive()
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  tenantId: z.number().int().positive()
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token de redefinição obrigatório'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    senhaConfirm: z.string().min(6, 'Confirmação de senha obrigatória'),
    tenantId: z.number().int().positive()
  })
  .refine((data) => data.senha === data.senhaConfirm, {
    path: ['senhaConfirm'],
    message: 'As senhas não coincidem'
  });

export const logoutSchema = z.object({});
export const meSchema = z.object({});
