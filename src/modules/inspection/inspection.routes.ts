import { Router } from 'express'
import { authenticateJWT } from '../../middleware/authenticateJWT'
import { checkTenant } from '../../middleware/checkTenant'
import { checkRole } from '../../middleware/checkRole'
import { validate } from '../../middleware/validate'
import * as controller from './inspection.controller'
import { createInspectionSchema, updateInspectionSchema } from './inspection.schemas'

const router = Router()

router.post(
  '/',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  validate(createInspectionSchema),
  controller.createInspection,
)

router.get(
  '/',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.listInspections,
)

router.get(
  '/:id',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.getInspectionById,
)

router.put(
  '/:id',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  validate(updateInspectionSchema),
  controller.updateInspection,
)

router.delete(
  '/:id',
  authenticateJWT,
  checkTenant,
  checkRole(['GESTOR', 'FUNCIONARIO']),
  controller.deleteInspection,
)

export { router as inspectionRoutes }
