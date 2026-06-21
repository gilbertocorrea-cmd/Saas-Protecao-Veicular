import { Response } from 'express'

export function sendSuccess<T>(res: Response, statusCode: number, data: T, meta?: object) {
  return res.status(statusCode).json({ success: true, data, ...(meta && { meta }) })
}

export function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  })
}