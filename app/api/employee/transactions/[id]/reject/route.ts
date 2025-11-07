import { createClient } from "@/lib/supabase/server"
import { verifyAccessToken } from "@/lib/security/jwt"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    const cookieStore = await cookies()
    const token = cookieStore.get("employee_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    const supabase = await createClient()

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update({
        status: "rejected",
        verified_by: payload.userId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to reject transaction" }, { status: 500 })
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: payload.userId,
      user_type: "employee",
      action: "reject_transaction",
      resource_type: "transaction",
      resource_id: id,
      status: "success",
      details: { reason },
    })

    return NextResponse.json({
      message: "Transaction rejected successfully",
      transaction,
    })
  } catch (error) {
    console.error("[v0] Reject transaction error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
