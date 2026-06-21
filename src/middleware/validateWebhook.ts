import { Request, Response, NextFunction } from 'express'

export const validateWebhook = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-webhook-signature'] as string | undefined
  if (!signature) {
    return res.status(400).json({
      success: false,
      error: { code: 'WEBHOOK_VALIDATION_FAILED', message: 'Assinatura do webhook ausente' },
    })
  }

  // Placeholder: implementar verificação de assinatura conforme o provedor
  return next()
}
