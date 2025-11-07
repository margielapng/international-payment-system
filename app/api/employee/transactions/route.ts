import { createClient } from "@/lib/supabase/server"
import { verifyAccessToken } from "@/lib/security/jwt"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("employee_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify employee token
    await verifyAccessToken(token)

    const supabase = await createClient()

    // Get all transactions for employee review
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        *,
        customers:customer_id (
          full_name,
          email,
          account_status
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Employee fetch transactions error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
