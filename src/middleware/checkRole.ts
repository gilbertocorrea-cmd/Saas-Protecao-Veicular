import { Request, Response, NextFunction } from "express";

export const checkRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (req.user?.role === 'ADMIN' || req.user?.role === 'ADMIN_MASTER') {
      return next();
    }

    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Sem permissão"
        }
      });
    }

    next();
  };
};