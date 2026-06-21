import { Request } from 'express'

export type AuthTokenPayload = {
  userId: number
  tenantId: number
  role: string
  tokenVersion?: number
}

export interface AuthRequest extends Request {
  user: {
    id: number
    email: string
    role: string
    tenantId: number
  }
  tenant: {
    id: number
    status: string
  }
}
