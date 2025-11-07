import { createClient } from "@/lib/supabase/server"
import { verifyMFAToken } from "@/lib/security/mfa"
import { decrypt } from "@/lib/security/encryption"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer with MFA secret
    const { data: customer, error } = await supabase
      .from("customers")
      .select("mfa_secret, mfa_enabled")
      .eq("id", user.id)
      .single()

    if (error || !customer || !customer.mfa_secret) {
      return NextResponse.json({ error: "MFA not set up" }, { status: 400 })
    }

    // Decrypt the secret
    const secret = await decrypt(customer.mfa_secret)

    // Verify the token
    const isValid = verifyMFAToken(secret, token)

    if (!isValid) {
      // Log failed attempt
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        user_type: "customer",
        action: "mfa_verify",
        status: "failure",
        details: { reason: "invalid_token" },
      })

      return NextResponse.json({ error: "Invalid MFA token" }, { status: 401 })
    }

    // Enable MFA if verifying for first time
    if (!customer.mfa_enabled) {
      await supabase.from("customers").update({ mfa_enabled: true }).eq("id", user.id)
    }

    // Log successful verification
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_type: "customer",
      action: "mfa_verify",
      status: "success",
    })

    return NextResponse.json({
      message: "MFA verified successfully",
      mfaEnabled: true,
    })
  } catch (error) {
    console.error("[v0] MFA verification error:", error)
    return NextResponse.json({ error: "MFA verification failed" }, { status: 500 })
  }
}
