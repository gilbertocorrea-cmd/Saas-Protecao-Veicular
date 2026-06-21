import { Router } from 'express'
import { authenticateJWT } from '../../middleware/authenticateJWT'
import { checkRole } from '../../middleware/checkRole'
import { tenantContextMiddleware } from '../../middleware/tenantContextMiddleware'
import { checkTenant } from '../../middleware/checkTenant'
import { validate } from '../../middleware/validate'
import { createUserSchema, updateUserSchema } from './user.schemas'
import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
} from './user.controller'

const router = Router()

router.post(
  '/',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['GESTOR']),
  validate(createUserSchema),
  createUser,
)
router.get(
  '/',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['GESTOR']),
  listUsers,
)
router.put(
  '/:id',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['GESTOR']),
  validate(updateUserSchema),
  updateUser,
)
router.patch(
  '/:id/deactivate',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['GESTOR']),
  deactivateUser,
)

export { router as userRoutes }
