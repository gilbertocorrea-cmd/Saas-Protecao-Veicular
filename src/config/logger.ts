import { createLogger, format, transports } from 'winston'

const sensitiveKeys = ['senha', 'password', 'token', 'refresh_token', 'refreshToken']

function maskSensitive(value: unknown): unknown {
  if (typeof value === 'string') {
    let result = value
    for (const key of sensitiveKeys) {
      const regex = new RegExp(key, 'gi')
      result = result.replace(regex, '[REDACTED]')
    }
    return result
  }

  if (Array.isArray(value)) {
    return value.map(maskSensitive)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, maskSensitive(val)])
    )
  }

  return value
}

const redactFormat = format((info) => {
  if (info.message) {
    info.message = String(maskSensitive(info.message))
  }
  if (info.meta) {
    info.meta = maskSensitive(info.meta)
  }
  return info
})

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    redactFormat(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, meta }) => {
      const metaString = meta ? ` ${JSON.stringify(meta)}` : ''
      return `${timestamp} [${level}] ${message}${metaString}`
    })
  ),
  transports: [new transports.Console()],
})
