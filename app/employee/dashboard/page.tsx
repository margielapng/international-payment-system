import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { verifyAccessToken } from "@/lib/security/jwt"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, CheckCircle, Users, AlertTriangle } from "lucide-react"

export default async function EmployeeDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("employee_token")?.value

  if (!token) {
    redirect("/employee/login")
  }

  try {
    await verifyAccessToken(token)
  } catch {
    redirect("/employee/login")
  }

  const supabase = await createClient()

  // Get statistics
  const { data: allTransactions } = await supabase.from("transactions").select("*")

  const pendingCount = allTransactions?.filter((t) => t.status === "pending").length || 0
  const verifiedToday =
    allTransactions?.filter(
      (t) => t.status === "verified" && new Date(t.verified_at || "").toDateString() === new Date().toDateString(),
    ).length || 0
  const { count: customersCount } = await supabase.from("customers").select("*", { count: "exact", head: true })
  const flaggedCount = allTransactions?.filter((t) => t.flagged_for_review).length || 0

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
            <p className="text-slate-400">Transaction verification and monitoring</p>
          </div>
          <Button asChild>
            <Link href="/employee/transactions">View All Transactions</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingCount}</div>
              <p className="text-xs text-slate-400">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Verified Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{verifiedToday}</div>
              <p className="text-xs text-slate-400">Processed today</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{customersCount || 0}</div>
              <p className="text-xs text-slate-400">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{flaggedCount}</div>
              <p className="text-xs text-slate-400">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">Review and verify pending transactions</p>
              <Button asChild className="w-full">
                <Link href="/employee/transactions">Manage Transactions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">View customer accounts and KYC status</p>
              <Button asChild className="w-full">
                <Link href="/employee/customers">View Customers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">Monitor system activity and security events</p>
              <Button asChild className="w-full">
                <Link href="/employee/audit-logs">View Logs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
