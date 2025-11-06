export interface User {
  _id?: string
  email?: string
  username: string
  accountNumber: string
  fullName?: string
  idNumber?: string
  passwordHash: string
  role: "customer" | "employee" | "admin"
  mfaEnabled: boolean
  mfaSecret?: string
  mfaBackupCodes?: string[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  lastLogin?: Date
  loginAttempts?: number
  lockedUntil?: Date
}

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion: number
  iat: number
  exp: number
}

export interface MFASetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
