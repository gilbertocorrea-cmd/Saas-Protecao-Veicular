import { Router } from 'express';
import { authenticateJWT } from '../../middleware/authenticateJWT';
import { checkRole } from '../../middleware/checkRole';
import { tenantContextMiddleware } from '../../middleware/tenantContextMiddleware';
import { checkTenant } from '../../middleware/checkTenant';
import { validate } from '../../middleware/validate';
import { createTenantSchema, updateTenantSchema, updateTenantConfigSchema, tenantIdSchema } from './tenant.schemas';
import {
  createTenant,
  listTenants,
  getTenantById,
  updateTenant,
  updateTenantConfig,
  suspendTenant,
  reactivateTenant,
} from './tenant.controller';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER']),
  validate(createTenantSchema),
  createTenant,
);

router.get(
  '/',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER']),
  listTenants,
);

router.get(
  '/:id',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER', 'GESTOR']),
  validate(tenantIdSchema),
  getTenantById,
);

router.put(
  '/:id',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER', 'GESTOR']),
  validate(updateTenantSchema),
  updateTenant,
);

router.put(
  '/:id/config',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['GESTOR']),
  validate(updateTenantConfigSchema),
  updateTenantConfig,
);

router.patch(
  '/:id/suspend',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER']),
  validate(tenantIdSchema),
  suspendTenant,
);

router.patch(
  '/:id/reactivate',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN_MASTER']),
  validate(tenantIdSchema),
  reactivateTenant,
);

export { router as tenantRoutes };