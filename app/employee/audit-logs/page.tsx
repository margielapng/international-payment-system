import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmployeeAuditLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "failure":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "error":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-slate-400">Monitor system activity and security events</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription>Last 100 system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs?.map((log) => (
                <div key={log.id} className="p-3 bg-slate-800 rounded-lg flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(log.status || "success")}>{log.status || "success"}</Badge>
                      <span className="text-sm text-slate-400">{log.user_type}</span>
                      <span className="text-sm text-white font-medium">{log.action}</span>
                    </div>
                    {log.details && <p className="text-xs text-slate-400 font-mono">{JSON.stringify(log.details)}</p>}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
