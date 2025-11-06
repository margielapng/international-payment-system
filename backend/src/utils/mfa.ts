import speakeasy from "speakeasy"
import QRCode from "qrcode"
import type { MFASetupResponse } from "../types"

export class MFAManager {
  static generateSecret(username: string, issuer = "SecureBank"): speakeasy.Secret {
    return speakeasy.generateSecret({
      name: `${issuer} (${username})`,
      issuer,
      length: 32,
    })
  }

  static async generateQRCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret)
  }

  static generateBackupCodes(count = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("")
      codes.push(code)
    }
    return codes
  }

  static async setupMFA(username: string): Promise<MFASetupResponse> {
    const secret = this.generateSecret(username)
    const qrCode = await this.generateQRCode(secret.otpauth_url!)
    const backupCodes = this.generateBackupCodes()

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    }
  }

  static verifyToken(secret: string, token: string, window = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window,
    })
  }

  static verifyBackupCode(backupCode: string, storedCodes: string[]): boolean {
    const hashedCode = this.hashBackupCode(backupCode)
    return storedCodes.some((code) => code === backupCode)
  }

  static hashBackupCode(code: string): string {
    // In production, these should be hashed like passwords
    return code
  }
}
