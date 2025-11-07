import { createClient } from "@/lib/supabase/server"
import { validateTransactionData, sanitizeInput } from "@/lib/security/validation"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get transactions for the authenticated customer
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Fetch transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate transaction data
    const validation = validateTransactionData(body)
    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", errors: validation.errors }, { status: 400 })
    }

    // Sanitize inputs
    const transactionData = {
      customer_id: user.id,
      transaction_type: "international_transfer",
      amount: body.amount,
      currency: sanitizeInput(body.currency),
      sender_name: sanitizeInput(body.senderName),
      sender_account: sanitizeInput(body.senderAccount),
      sender_bank: sanitizeInput(body.senderBank || ""),
      sender_country: sanitizeInput(body.senderCountry),
      recipient_name: sanitizeInput(body.recipientName),
      recipient_account: sanitizeInput(body.recipientAccount),
      recipient_bank: sanitizeInput(body.recipientBank),
      recipient_swift: sanitizeInput(body.swiftCode),
      recipient_iban: body.iban ? sanitizeInput(body.iban) : null,
      recipient_country: sanitizeInput(body.recipientCountry),
      recipient_address: body.recipientAddress ? sanitizeInput(body.recipientAddress) : null,
      purpose: sanitizeInput(body.purpose),
      status: "pending",
    }

    // Insert transaction
    const { data: transaction, error } = await supabase.from("transactions").insert(transactionData).select().single()

    if (error) {
      console.error("[v0] Transaction creation error:", error)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_type: "customer",
      action: "create_transaction",
      resource_type: "transaction",
      resource_id: transaction.id,
      status: "success",
      details: { amount: body.amount, currency: body.currency },
    })

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction,
    })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
