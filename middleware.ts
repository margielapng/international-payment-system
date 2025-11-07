import { updateSession } from "@/lib/supabase/middleware"
import { applyHelmetHeaders } from "@/lib/security/helmet"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = await updateSession(request)

  response = applyHelmetHeaders(response)

  response.headers.set("X-RateLimit-Limit", "100")
  response.headers.set("X-RateLimit-Remaining", "99")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
