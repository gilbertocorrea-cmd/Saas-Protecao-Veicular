import { Request, Response } from 'express';
import * as service from './tenant.service';

export const createTenant = async (req: Request, res: Response) => {
  const data = req.body;
  const tenant = await service.createTenant(data);

  return res.json({ success: true, data: tenant });
};

export const listTenants = async (req: Request, res: Response) => {
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenants = await service.getTenants({ role, tenantId });

  return res.json({ success: true, data: tenants });
};

export const getTenantById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenant = await service.getTenantById(id, { role, tenantId });

  if (!tenant) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant não encontrado' } });
  }

  return res.json({ success: true, data: tenant });
};

export const updateTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenant = await service.updateTenant(id, data, { role, tenantId });

  return res.json({ success: true, data: tenant });
};

export const updateTenantConfig = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenant = await service.updateTenantConfig(id, data, { role, tenantId });

  return res.json({ success: true, data: tenant });
};

export const suspendTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenant = await service.suspendTenant(id, { role, tenantId });

  return res.json({ success: true, data: tenant });
};

export const reactivateTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const role = (req as any).user?.role as string;
  const tenantId = (req as any).tenantId as number;

  const tenant = await service.reactivateTenant(id, { role, tenantId });

  return res.json({ success: true, data: tenant });
};