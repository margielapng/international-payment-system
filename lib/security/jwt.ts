import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-characters-long")
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-min-32-chars",
)

const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"

export interface TokenPayload {
  userId: string
  email: string
  role: "customer" | "employee"
  mfaVerified?: boolean
}

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("international-payment-system")
    .setAudience("payment-portal")
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer("international-payment-system")
    .setAudience("payment-portal-refresh")
    .sign(JWT_REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "international-payment-system",
      audience: "payment-portal",
    })
    return payload as unknown as TokenPayload
  } catch (error) {
    throw new Error("Invalid or expired access token")
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: "international-payment-system",
      audience: "payment-portal-refresh",
    })
    return payload as unknown as TokenPayload
  } catch (error) {
    throw new Error("Invalid or expired refresh token")
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const payload = await verifyRefreshToken(refreshToken)

  const newAccessToken = await generateAccessToken(payload)
  const newRefreshToken = await generateRefreshToken(payload)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}
