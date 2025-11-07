import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"

export default async function CustomerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get customer profile
  const { data: customer } = await supabase.from("customers").select("*").eq("id", user.id).single()

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate stats
  const pendingCount = transactions?.filter((t) => t.status === "pending").length || 0
  const completedCount = transactions?.filter((t) => t.status === "completed").length || 0
  const rejectedCount = transactions?.filter((t) => t.status === "rejected").length || 0
  const totalAmount =
    transactions?.reduce((sum, t) => (t.status === "completed" ? sum + Number(t.amount) : sum), 0) || 0

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {customer?.full_name}</p>
          </div>
          <Button asChild>
            <Link href="/customer/transactions/new">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              New Transfer
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingCount}</div>
              <p className="text-xs text-slate-400">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedCount}</div>
              <p className="text-xs text-slate-400">Successfully processed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{rejectedCount}</div>
              <p className="text-xs text-slate-400">Failed verification</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Sent</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Completed transfers</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription>Your latest payment activity</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/customer/transactions">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-white">{transaction.recipient_name}</p>
                      <p className="text-sm text-slate-400">
                        {transaction.recipient_bank} • {transaction.reference_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {transaction.amount} {transaction.currency}
                      </p>
                      <p
                        className={`text-sm ${
                          transaction.status === "completed"
                            ? "text-green-500"
                            : transaction.status === "rejected"
                              ? "text-red-500"
                              : "text-yellow-500"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No transactions yet</p>
                <Button asChild className="mt-4">
                  <Link href="/customer/transactions/new">Create Your First Transfer</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
