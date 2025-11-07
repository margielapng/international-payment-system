import { createClient } from "@/lib/supabase/server"
import { validateEmail } from "@/lib/security/validation"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get customer profile
    const { data: customer } = await supabase.from("customers").select("*").eq("id", data.user.id).single()

    return NextResponse.json({
      message: "Login successful",
      user: data.user,
      customer,
      mfaRequired: customer?.mfa_enabled,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
