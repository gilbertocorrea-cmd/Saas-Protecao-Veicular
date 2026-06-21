import { z } from 'zod';

export const createTenantSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
});

export const updateTenantSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').optional(),
  status: z.enum(['ATIVO', 'SUSPENSO']).optional(),
});

export const updateTenantConfigSchema = z.object({
  logo_url: z.string().url('URL inválida').optional(),
  primary_color: z.string().min(3).optional(),
  secondary_color: z.string().min(3).optional(),
  app_name: z.string().min(1).optional(),
});

export const tenantIdSchema = z.object({
  id: z.number().int().positive(),
});