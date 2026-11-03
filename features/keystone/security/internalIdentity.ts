import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Loopback-only forwarded client identity (hospital 861591a pattern).
 * The signer is used by the server-side GraphQL client; the verifier accepts the
 * identity only from a LOOPBACK socket with a fresh HMAC (<= 90s) and a secret of
 * at least 32 characters. No limiter in this repo reads it yet (applyRateLimiting
 * stays disabled); it is here so a future limiter keys the end user, not egress.
 */
export function signInternalClientIdentity(source: string, secret: string, now = Date.now()) {
  if (!source || secret.length < 32) return null
  const identity = createHash('sha256').update(source).digest('hex')
  const timestamp = String(Math.floor(now / 1_000))
  const signature = createHmac('sha256', secret).update(`${timestamp}:${identity}`).digest('hex')
  return { identity, timestamp, signature }
}

const INTERNAL_IDENTITY_MAX_AGE_MS = 90_000

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifiedInternalIdentity(
  headers: Record<string, string | string[] | undefined>,
  socketAddress: string | null | undefined,
  secret: string,
  now: number,
) {
  const loopback = /^(?:127\.|::1$|::ffff:127\.)/.test(String(socketAddress || ''))
  if (!loopback || secret.length < 32) return null
  const identity = String(headers['x-openfront-client-identity'] || '')
  const timestamp = String(headers['x-openfront-client-timestamp'] || '')
  const signature = String(headers['x-openfront-client-signature'] || '')
  if (!/^[a-f0-9]{64}$/.test(identity) || !/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) return null
  const age = Math.abs(now - Number(timestamp) * 1_000)
  if (!Number.isFinite(age) || age > INTERNAL_IDENTITY_MAX_AGE_MS) return null
  const expected = createHmac('sha256', secret).update(`${timestamp}:${identity}`).digest('hex')
  return safeEqual(signature, expected) ? `forwarded:${identity}` : null
}

export function requestIdentity(
  headers: Record<string, string | string[] | undefined>,
  socketAddress?: string | null,
  secret = String(process.env.SESSION_SECRET || ''),
  now = Date.now(),
) {
  const internal = verifiedInternalIdentity(headers, socketAddress, secret, now)
  if (internal) return internal

  if (process.env.RAILWAY_ENVIRONMENT) {
    // Railway supplies X-Real-IP at the edge. Prefer it over a client-extendable forwarding chain.
    const realIp = String(headers['x-real-ip'] || '').split(',')[0]?.trim()
    if (realIp) return realIp
  } else if (process.env.TRUST_PROXY === '1') {
    const chain = String(headers['x-forwarded-for'] || '').split(',').map(value => value.trim()).filter(Boolean)
    const configuredHops = Number(process.env.TRUST_PROXY_HOPS || 1)
    const hops = Number.isInteger(configuredHops) && configuredHops > 0 ? configuredHops : 1
    const vouched = chain[chain.length - hops]
    if (vouched) return vouched
    const realIp = String(headers['x-real-ip'] || '').split(',')[0]?.trim()
    if (realIp) return realIp
  }
  return socketAddress || 'unknown-local-client'
}
