import { randomBytes, createHmac } from "crypto"

const CSRF_SECRET = process.env.CSRF_SECRET || "change-this-secret-in-production-min-32-chars"

export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex")
  const timestamp = Date.now().toString()
  const data = `${token}:${timestamp}:${sessionId}`
  const signature = createHmac("sha256", CSRF_SECRET).update(data).digest("hex")

  return `${token}:${timestamp}:${signature}`
}

export function verifyCSRFToken(token: string, sessionId: string): boolean {
  try {
    const [tokenPart, timestamp, signature] = token.split(":")

    if (!tokenPart || !timestamp || !signature) {
      return false
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - Number.parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false
    }

    // Verify signature
    const data = `${tokenPart}:${timestamp}:${sessionId}`
    const expectedSignature = createHmac("sha256", CSRF_SECRET).update(data).digest("hex")

    return signature === expectedSignature
  } catch (error) {
    return false
  }
}

export function getCSRFTokenFromHeader(request: Request): string | null {
  return request.headers.get("x-csrf-token")
}
