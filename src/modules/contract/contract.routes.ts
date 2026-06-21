import { Router } from 'express'
import { authenticateJWT } from '../../middleware/authenticateJWT'
import { checkTenant } from '../../middleware/checkTenant'
import { checkRole } from '../../middleware/checkRole'
import { validate } from '../../middleware/validate'
import * as controller from './contract.controller'
import { createContractSchema } from './contract.schemas'

const router = Router()

router.post(
  '/',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  validate(createContractSchema),
  controller.createContract,
)

router.get(
  '/',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.listContracts,
)

router.get(
  '/:id',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.getContractById,
)

router.patch(
  '/:id/cancel',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.cancelContract,
)

export { router as contractRoutes }
