import { z } from 'zod'

export const createPaymentSchema = z.object({
  userId: z.string(),
  vehicleId: z.string().optional(),
  amount: z.number().positive(),
  method: z.enum(['PIX', 'BOLETO']),
})

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PAID', 'CANCELED']),
})