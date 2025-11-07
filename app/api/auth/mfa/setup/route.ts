import { createClient } from "@/lib/supabase/server"
import { generateMFASecret, generateQRCode, generateBackupCodes } from "@/lib/security/mfa"
import { NextResponse } from "next/server"
import { encrypt } from "@/lib/security/encryption"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate MFA secret and QR code
    const { secret, uri } = generateMFASecret(user.email!)
    const qrCode = await generateQRCode(uri)
    const backupCodes = generateBackupCodes()

    // Encrypt the secret before storing
    const encryptedSecret = await encrypt(secret)
    const encryptedBackupCodes = await Promise.all(backupCodes.map((code) => encrypt(code)))

    // Store in customer profile (not enabled yet)
    await supabase
      .from("customers")
      .update({
        mfa_secret: encryptedSecret,
        mfa_backup_codes: encryptedBackupCodes,
      })
      .eq("id", user.id)

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes,
    })
  } catch (error) {
    console.error("[v0] MFA setup error:", error)
    return NextResponse.json({ error: "MFA setup failed" }, { status: 500 })
  }
}
