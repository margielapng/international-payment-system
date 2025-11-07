import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "verified":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-slate-400">View and manage your payment history</p>
          </div>
          <Button asChild>
            <Link href="/customer/transactions/new">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              New Transfer
            </Link>
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">All Transactions</CardTitle>
            <CardDescription>Complete history of your international transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-slate-800 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white text-lg">{transaction.recipient_name}</p>
                        <p className="text-sm text-slate-400">{transaction.recipient_bank}</p>
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Amount</p>
                        <p className="text-white font-medium">
                          {transaction.amount} {transaction.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Reference</p>
                        <p className="text-white font-mono text-xs">{transaction.reference_number}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Date</p>
                        <p className="text-white">{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Purpose</p>
                        <p className="text-white">{transaction.purpose}</p>
                      </div>
                    </div>

                    {transaction.rejection_reason && (
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-sm text-red-400">Rejection Reason: {transaction.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p className="mb-4">No transactions yet</p>
                <Button asChild>
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
