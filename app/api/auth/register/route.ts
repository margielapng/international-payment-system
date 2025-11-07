import { createClient } from "@/lib/supabase/server"
import { validateEmail, sanitizeInput } from "@/lib/security/validation"
import { validatePasswordStrength } from "@/lib/security/password"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, address, city, country, postalCode } = body

    // Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(", ") }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email),
      fullName: sanitizeInput(fullName),
      phone: phone ? sanitizeInput(phone) : null,
      address: address ? sanitizeInput(address) : null,
      city: city ? sanitizeInput(city) : null,
      country: country ? sanitizeInput(country) : null,
      postalCode: postalCode ? sanitizeInput(postalCode) : null,
    }

    const supabase = await createClient()

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard`,
        data: {
          full_name: sanitizedData.fullName,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Note: Customer profile is auto-created by trigger
    // We'll update additional details after email confirmation

    return NextResponse.json({
      message: "Registration successful. Please check your email to confirm your account.",
      userId: authData.user?.id,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
