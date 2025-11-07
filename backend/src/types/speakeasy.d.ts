// backend/src/types/speakeasy.d.ts
declare module "speakeasy" {
  export type Secret = {
    ascii?: string;
    hex?: string;
    base32?: string;
    otpauth_url?: string;
  };

  export interface GenerateSecretOptions {
    length?: number;
    name?: string;
    issuer?: string;
  }

  const speakeasy: {
    generateSecret(opts?: GenerateSecretOptions): Secret;
    otpauthURL(opts: { secret: string | Buffer; label: string; issuer?: string; encoding?: string }): string;
    totp: {
      generate(opts: { secret: string | Buffer; encoding?: string; step?: number; digits?: number }): string;
      verify(opts: { secret: string | Buffer; token: string; window?: number; encoding?: string; step?: number; digits?: number }): boolean;
    };
    [k: string]: any;
  };

  export default speakeasy;
}
