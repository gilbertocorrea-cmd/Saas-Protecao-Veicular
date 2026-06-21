import { prisma } from "../../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

type JwtPayload = {
  userId: number;
  tenantId: number;
  role: string;
};

const PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || '').replace(/\\n/g, '\n')
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'

export class AuthService {
  static generateTokens(user: any) {
    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.tipo_usuario,
    }

    const accessToken = jwt.sign(payload, PRIVATE_KEY as jwt.Secret, {
      algorithm: 'RS256',
      expiresIn: ACCESS_EXPIRES as any,
    })

    const refreshToken = jwt.sign(payload, PRIVATE_KEY as jwt.Secret, {
      algorithm: 'RS256',
      expiresIn: REFRESH_EXPIRES as any,
    })

    return { accessToken, refreshToken }
  }

  static async createSession(user: any) {
    const { accessToken, refreshToken } = this.generateTokens(user);
    const hash = await bcrypt.hash(refreshToken, 12);

    await prisma.refreshToken.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        tenantId: user.tenantId,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: "AUTH_REFRESH",
      },
    });

    return { accessToken, refreshToken };
  }

  static async login(email: string, senha: string, tenant_id: number) {
    const user = await prisma.usuario.findFirst({
      where: {
        email,
        tenantId: tenant_id,
        status: "ATIVO",
      },
    });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      throw new Error("Credenciais inválidas");
    }

    return this.createSession(user);
  }

  static async refreshToken(token: string) {
    let payload: JwtPayload

    try {
      payload = jwt.verify(token, PRIVATE_KEY as jwt.Secret) as JwtPayload
    } catch {
      throw new Error('Token inválido')
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        revokedAt: null,
        userAgent: 'AUTH_REFRESH',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!tokenRecord) {
      throw new Error("Token inválido");
    }

    const valid = await bcrypt.compare(token, tokenRecord.tokenHash);
    if (!valid) {
      throw new Error("Token inválido");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new Error("Token expirado");
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return this.createSession(user);
  }

  static async logout(userId: number) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        userAgent: "AUTH_REFRESH",
      },
      data: { revokedAt: new Date() },
    });

    return true;
  }

  static async forgotPassword(email: string, tenantId: number) {
    const user = await prisma.usuario.findFirst({
      where: { email, tenantId, status: 'ATIVO' },
    })

    if (!user) {
      return ''
    }

    const token = crypto.randomBytes(32).toString('hex')
    const hash = await bcrypt.hash(token, 12)

    await prisma.refreshToken.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        tenantId: user.tenantId,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        userAgent: 'PASSWORD_RESET',
      },
    })

    return token
  }

  static async resetPassword(token: string, novaSenha: string, tenantId: number) {
    const records = await prisma.refreshToken.findMany({
      where: {
        tenantId,
        userAgent: 'PASSWORD_RESET',
        revokedAt: null,
      },
    })

    const record = await Promise.all(
      records.map(async (item) => {
        const valid = await bcrypt.compare(token, item.tokenHash)
        return valid ? item : null
      })
    ).then((results) => results.find(Boolean))

    if (!record || record.expiresAt < new Date()) {
      throw new Error('Token inválido ou expirado')
    }

    const user = await prisma.usuario.findUnique({ where: { id: record.userId } })
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const hash = await bcrypt.hash(novaSenha, 12)
    await prisma.usuario.update({
      where: { id: user.id },
      data: { senha: hash },
    })

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    })

    return true
  }
}