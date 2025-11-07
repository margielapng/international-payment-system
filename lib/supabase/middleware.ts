import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect customer routes
  if (request.nextUrl.pathname.startsWith("/customer") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Protect employee routes (handled separately with custom auth)
  if (request.nextUrl.pathname.startsWith("/employee") && !request.nextUrl.pathname.startsWith("/employee/login")) {
    const employeeToken = request.cookies.get("employee_token")
    if (!employeeToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/employee/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
