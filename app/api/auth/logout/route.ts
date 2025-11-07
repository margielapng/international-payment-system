import { createClient } from "@/lib/supabase/server"
import { verifyAccessToken } from "@/lib/security/jwt"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("employee_token")?.value || cookieStore.get("access_token")?.value

    if (token) {
      try {
        const payload = await verifyAccessToken(token)
        const supabase = await createClient()

        // Delete all sessions for this user
        await supabase.from("sessions").delete().eq("user_id", payload.userId)

        // Log audit event
        await supabase.from("audit_logs").insert({
          user_id: payload.userId,
          user_type: payload.role,
          action: "logout",
          status: "success",
        })
      } catch (error) {
        // Token might be expired, continue with logout
        console.log("[v0] Token verification failed during logout:", error)
      }
    }

    const response = NextResponse.json({ message: "Logged out successfully" })

    // Clear all auth cookies
    response.cookies.delete("employee_token")
    response.cookies.delete("employee_refresh_token")
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
