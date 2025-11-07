import speakeasy from "speakeasy";
import type { Secret } from "speakeasy";
import QRCode from "qrcode";
import type { MFASetupResponse } from "../types";

export class MFAManager {
  static generateSecret(username: string, issuer = "SecureBank"): Secret {
    return speakeasy.generateSecret({
      name: `${issuer} (${username})`,
      issuer,
      length: 32,
    });
  }

  static async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  static generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
      codes.push(code);
    }
    return codes;
  }

  static async setupMFA(username: string, issuer = "SecureBank"): Promise<MFASetupResponse> {
    const secret = this.generateSecret(username, issuer);

    // Guard: ensure base32 exists
    if (!secret.base32) {
      throw new Error("Failed to generate MFA secret (missing base32)");
    }

    // Build a reliable otpauth URL using the base32 secret
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${issuer}:${username}`,
      issuer,
      encoding: "base32",
    });

    const qrCode = await this.generateQRCode(otpAuthUrl);
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  static verifyToken(secret: string, token: string, window = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window,
    });
  }

  static verifyBackupCode(backupCode: string, storedCodes: string[]): boolean {
    const hashedCode = this.hashBackupCode(backupCode);
    // compare hashed value with stored (assume storedCodes are hashed in production)
    return storedCodes.some((code) => code === hashedCode);
  }

  static hashBackupCode(code: string): string {
    // In production, hash these (bcrypt/argon2). For now return the plain code.
    return code;
  }
}
