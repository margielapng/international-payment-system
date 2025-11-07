import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/security/jwt"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("employee_refresh_token")?.value || cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    // Verify the refresh token
    const payload = await verifyRefreshToken(refreshToken)

    const supabase = await createClient()

    // Check if refresh token exists in sessions table and is not expired
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("refresh_token", refreshToken)
      .eq("user_id", payload.userId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from("sessions").delete().eq("id", session.id)
      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 })
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken(payload)
    const newRefreshToken = await generateRefreshToken(payload)

    // Update session with new refresh token (token rotation)
    await supabase
      .from("sessions")
      .update({
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: payload.userId,
      user_type: payload.role,
      action: "refresh_token",
      status: "success",
    })

    const response = NextResponse.json({
      message: "Token refreshed successfully",
    })

    // Set new cookies
    const cookieName = payload.role === "employee" ? "employee_token" : "access_token"
    const refreshCookieName = payload.role === "employee" ? "employee_refresh_token" : "refresh_token"

    response.cookies.set(cookieName, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set(refreshCookieName, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
  }
}
