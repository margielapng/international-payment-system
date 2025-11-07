import * as OTPAuth from "otpauth"
import QRCode from "qrcode"

export function generateMFASecret(email: string): {
  secret: string
  uri: string
} {
  const totp = new OTPAuth.TOTP({
    issuer: "International Payment System",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  })

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  }
}

export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri)
}

export function verifyMFAToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  })

  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}
