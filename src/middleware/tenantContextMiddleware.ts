import { runWithTenantContext } from '../tenantContext'

export const tenantContextMiddleware = (req: any, res: any, next: any) => {
  const context = {
    tenantId: req.user?.tenantId,
    role: req.user?.role,
    userId: req.user?.userId,
  }

  return runWithTenantContext(context, () => next())
}
