"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Copy, Check } from "lucide-react"
import Image from "next/image"

export default function MFASetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationToken, setVerificationToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setupMFA()
  }, [])

  const setupMFA = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup MFA")
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyMFA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      router.push("/customer/dashboard?mfa=enabled")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading && !qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800 border-slate-700">
          <p className="text-slate-300">Setting up MFA...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-slate-800 border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Two-Factor Authentication Setup</h1>
        </div>

        {step === "setup" ? (
          <div className="space-y-6">
            <Alert className="bg-blue-950 border-blue-800">
              <AlertDescription className="text-blue-200">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </AlertDescription>
            </Alert>

            {qrCode && (
              <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg">
                <Image src={qrCode || "/placeholder.svg"} alt="MFA QR Code" width={250} height={250} />
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded">
                    <code className="text-sm font-mono text-slate-900">{secret}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(secret)} className="h-6 w-6 p-0">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-slate-200">Backup Codes</Label>
              <Alert className="bg-amber-950 border-amber-800">
                <AlertDescription className="text-amber-200">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your
                  authenticator device.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-900 rounded-lg">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-sm text-slate-300 font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep("verify")} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Continue to Verification
            </Button>
          </div>
        ) : (
          <form onSubmit={verifyMFA} className="space-y-6">
            <Alert className="bg-blue-950 border-blue-800">
              <AlertDescription className="text-blue-200">
                Enter the 6-digit code from your authenticator app to complete setup
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="bg-red-950 border-red-800">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="token" className="text-slate-200">
                Verification Code
              </Label>
              <Input
                id="token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="bg-slate-900 border-slate-700 text-white text-center text-2xl tracking-widest"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("setup")}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enable MFA"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
