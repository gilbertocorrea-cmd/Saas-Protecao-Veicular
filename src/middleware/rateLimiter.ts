import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Muitas tentativas. Tente novamente mais tarde.'
    }
  },
})
