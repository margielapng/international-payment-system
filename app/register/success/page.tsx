import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-white">Registration Successful!</CardTitle>
          <CardDescription>Please check your email to confirm your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400 text-center">
            We've sent a confirmation email to your inbox. Please click the link in the email to verify your account
            before signing in.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
