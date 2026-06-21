import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, senha, tenantId } = req.body;

    const tenant_id = tenantId;
    const tokens = await AuthService.login(email, senha, tenant_id);

    return res.json({
      success: true,
      data: tokens,
    });
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    return res.json({
      success: true,
      data: tokens,
    });
  }

  static async logout(req: Request, res: Response) {
    const userIdRaw = (req as any).user?.userId
    const userId = typeof userIdRaw === 'string' ? Number(userIdRaw) : userIdRaw

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' },
      })
    }

    await AuthService.logout(userId)

    return res.json({ success: true, data: true })
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email, tenantId } = req.body
    const resetToken = await AuthService.forgotPassword(email, tenantId)

    return res.json({ success: true, data: { resetToken } })
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, senha, tenantId } = req.body
    await AuthService.resetPassword(token, senha, tenantId)

    return res.json({ success: true, data: true })
  }

  static async me(req: Request, res: Response) {
    const user = (req as any).user

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_TOKEN_INVALID', message: 'Token inválido' },
      })
    }

    return res.json({ success: true, data: user })
  }
}