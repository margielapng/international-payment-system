"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function NewTransactionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    senderName: "",
    senderAccount: "",
    senderBank: "",
    senderCountry: "",
    recipientName: "",
    recipientAccount: "",
    recipientBank: "",
    swiftCode: "",
    iban: "",
    recipientCountry: "",
    recipientAddress: "",
    amount: "",
    currency: "USD",
    purpose: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create transaction")
      }

      router.push("/customer/transactions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">New International Transfer</h1>
          <p className="text-slate-400 mb-8">Fill in the details to initiate a secure transfer</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Information */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Sender Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name *</Label>
                    <Input
                      id="senderName"
                      required
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderAccount">Account Number *</Label>
                    <Input
                      id="senderAccount"
                      required
                      value={formData.senderAccount}
                      onChange={(e) => setFormData({ ...formData, senderAccount: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderBank">Bank Name</Label>
                    <Input
                      id="senderBank"
                      value={formData.senderBank}
                      onChange={(e) => setFormData({ ...formData, senderBank: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderCountry">Country *</Label>
                    <Input
                      id="senderCountry"
                      required
                      value={formData.senderCountry}
                      onChange={(e) => setFormData({ ...formData, senderCountry: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recipient Information</CardTitle>
                <CardDescription>Beneficiary account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      required
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientAccount">Account Number *</Label>
                    <Input
                      id="recipientAccount"
                      required
                      value={formData.recipientAccount}
                      onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientBank">Bank Name *</Label>
                    <Input
                      id="recipientBank"
                      required
                      value={formData.recipientBank}
                      onChange={(e) => setFormData({ ...formData, recipientBank: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT Code *</Label>
                    <Input
                      id="swiftCode"
                      required
                      placeholder="e.g., ABCDUS33XXX"
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN (Optional)</Label>
                    <Input
                      id="iban"
                      placeholder="e.g., GB29NWBK60161331926819"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientCountry">Country *</Label>
                    <Input
                      id="recipientCountry"
                      required
                      value={formData.recipientCountry}
                      onChange={(e) => setFormData({ ...formData, recipientCountry: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="recipientAddress">Address (Optional)</Label>
                    <Input
                      id="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Details */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Transfer Details</CardTitle>
                <CardDescription>Amount and purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input
                      id="currency"
                      required
                      placeholder="USD"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Transfer *</Label>
                  <Textarea
                    id="purpose"
                    required
                    placeholder="e.g., Payment for services, Family support, etc."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Transfer"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
