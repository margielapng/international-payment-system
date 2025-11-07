import { createClient } from "@/lib/supabase/server"
import { validateEmail } from "@/lib/security/validation"
import { verifyPassword } from "@/lib/security/password"
import { generateAccessToken, generateRefreshToken } from "@/lib/security/jwt"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Query employees table using service role
    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (error || !employee) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if account is locked
    if (employee.account_locked_until && new Date(employee.account_locked_until) > new Date()) {
      return NextResponse.json({ error: "Account is locked. Please try again later." }, { status: 403 })
    }

    // Verify password
    const isValid = await verifyPassword(password, employee.password_hash)

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = (employee.failed_login_attempts || 0) + 1
      const updates: any = { failed_login_attempts: failedAttempts }

      if (failedAttempts >= 5) {
        updates.account_locked_until = new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
      }

      await supabase.from("employees").update(updates).eq("id", employee.id)

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Reset failed attempts and update last login
    await supabase
      .from("employees")
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", employee.id)

    // Generate JWT tokens
    const accessToken = await generateAccessToken({
      userId: employee.id,
      email: employee.email,
      role: "employee",
    })

    const refreshToken = await generateRefreshToken({
      userId: employee.id,
      email: employee.email,
      role: "employee",
    })

    // Store refresh token in sessions table
    await supabase.from("sessions").insert({
      user_id: employee.id,
      user_type: "employee",
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: employee.id,
      user_type: "employee",
      action: "login",
      status: "success",
      details: { employee_id: employee.employee_id },
    })

    const response = NextResponse.json({
      message: "Login successful",
      employee: {
        id: employee.id,
        employeeId: employee.employee_id,
        fullName: employee.full_name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
      mfaRequired: employee.mfa_enabled,
    })

    // Set HTTP-only cookies
    response.cookies.set("employee_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set("employee_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Employee login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
