import { createClient } from "@/lib/supabase/server"
import { validateEmail, sanitizeInput } from "@/lib/security/validation"
import { hashPassword, validatePasswordStrength } from "@/lib/security/password"
import { verifyAccessToken } from "@/lib/security/jwt"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("employee_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin token
    const payload = await verifyAccessToken(token)

    const supabase = await createClient()

    // Check if user is admin
    const { data: admin, error: adminError } = await supabase
      .from("employees")
      .select("role")
      .eq("id", payload.userId)
      .single()

    if (adminError || !admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, fullName, role, department } = body

    // Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(", ") }, { status: 400 })
    }

    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`

    // Hash password
    const passwordHash = await hashPassword(password)

    // Sanitize and create employee
    const employeeData = {
      employee_id: employeeId,
      email: sanitizeInput(email),
      password_hash: passwordHash,
      full_name: sanitizeInput(fullName),
      role: role || "employee",
      department: department ? sanitizeInput(department) : null,
      is_active: true,
      created_by: payload.userId,
    }

    const { data: employee, error } = await supabase.from("employees").insert(employeeData).select().single()

    if (error) {
      console.error("[v0] Employee creation error:", error)
      return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
    }

    // Log audit event
    await supabase.from("audit_logs").insert({
      user_id: payload.userId,
      user_type: "employee",
      action: "create_employee",
      resource_type: "employee",
      resource_id: employee.id,
      status: "success",
      details: { employee_id: employeeId, email, role },
    })

    return NextResponse.json({
      message: "Employee created successfully",
      employee: {
        id: employee.id,
        employeeId: employee.employee_id,
        fullName: employee.full_name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    })
  } catch (error) {
    console.error("[v0] Create employee error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
