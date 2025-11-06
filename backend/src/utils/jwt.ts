import jwt from "jsonwebtoken"
import type { JWTPayload, RefreshTokenPayload, AuthTokens } from "../types"

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production"
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "change-refresh-secret"

export class JWTManager {
  static generateAccessToken(userId: string, username: string, role: string): string {
    return jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: "15m" })
  }

  static generateRefreshToken(userId: string, tokenVersion: number): string {
    return jwt.sign({ userId, tokenVersion }, REFRESH_SECRET, { expiresIn: "7d" })
  }

  static generateTokenPair(userId: string, username: string, role: string, tokenVersion: number): AuthTokens {
    const accessToken = this.generateAccessToken(userId, username, role)
    const refreshToken = this.generateRefreshToken(userId, tokenVersion)

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }

  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload
    } catch (error) {
      return null
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      return null
    }
  }
}
