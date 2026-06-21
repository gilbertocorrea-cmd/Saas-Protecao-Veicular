import crypto from 'crypto'

export function createHash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function compareHash(value: string, hash: string) {
  return createHash(value) === hash
}
