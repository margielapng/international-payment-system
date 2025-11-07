import { generateCSRFToken } from "@/lib/security/csrf"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    const csrfToken = generateCSRFToken(sessionId)

    const response = NextResponse.json({ csrfToken })

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("[v0] CSRF token generation error:", error)
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 })
  }
}
