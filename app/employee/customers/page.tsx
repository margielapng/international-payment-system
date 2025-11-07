import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmployeeCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "suspended":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Customer Management</h1>
          <p className="text-slate-400">View and manage customer accounts</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">All Customers</CardTitle>
            <CardDescription>{customers?.length || 0} registered customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers?.map((customer) => (
                <div key={customer.id} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-white text-lg">{customer.full_name}</p>
                      <p className="text-sm text-slate-400">{customer.email}</p>
                    </div>
                    <Badge className={getStatusColor(customer.account_status)}>{customer.account_status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Phone</p>
                      <p className="text-white">{customer.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Country</p>
                      <p className="text-white">{customer.country || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">KYC Status</p>
                      <p className="text-white">{customer.kyc_verified ? "Verified" : "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">MFA</p>
                      <p className="text-white">{customer.mfa_enabled ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
