import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export function getPrivateKey() {
  const key = process.env.JWT_PRIVATE_KEY
  if (!key) throw new Error('JWT_PRIVATE_KEY não definida')
  return key.replace(/\\n/g, '\n')
}

export function signAccessToken(payload: any) {
  return jwt.sign(payload, getPrivateKey(), {
    algorithm: 'RS256',
    expiresIn: '15m',
  })
}

export function createRefreshToken() {
  const id = crypto.randomUUID()
  const secret = crypto.randomBytes(48).toString('base64url')

  return {
    id,
    secret,
    token: `${id}.${secret}`,
  }
}

export function parseRefreshToken(token: string) {
  const [id, secret] = token.split('.')
  if (!id || !secret) return null
  return { id, secret }
}