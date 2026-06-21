import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authenticateJWT } from '../../middleware/authenticateJWT'
import { checkRole } from '../../middleware/checkRole'
import { tenantContextMiddleware } from '../../middleware/tenantContextMiddleware'
import { checkTenant } from '../../middleware/checkTenant'
import { validate } from '../../middleware/validate'
import { loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, logoutSchema, meSchema } from './auth.schemas'
import { loginLimiter } from '../../middleware/rateLimiter'

const router = Router()

const allAuthenticatedRoles = ['ADMIN', 'ADMIN_MASTER', 'GESTOR', 'FUNCIONARIO', 'CLIENTE']

router.post('/login', loginLimiter, validate(loginSchema), AuthController.login)
router.post('/refresh', validate(refreshSchema), AuthController.refresh)
router.post(
  '/logout',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(allAuthenticatedRoles),
  validate(logoutSchema),
  AuthController.logout,
)
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword)
router.get(
  '/me',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(allAuthenticatedRoles),
  validate(meSchema),
  AuthController.me,
)

export { router as authRoutes }
