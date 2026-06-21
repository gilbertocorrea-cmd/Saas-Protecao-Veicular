import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.number()
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
  userId: z.number()
});

export const logoutSchema = z.object({
  userId: z.number()
});