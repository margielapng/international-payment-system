"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, XCircle, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Transaction {
  id: string
  amount: string
  currency: string
  sender_name: string
  recipient_name: string
  recipient_bank: string
  recipient_swift: string
  status: string
  reference_number: string
  purpose: string
  created_at: string
  customers: {
    full_name: string
    email: string
    account_status: string
  }
}

export default function EmployeeTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [actionType, setActionType] = useState<"verify" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/employee/transactions")
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedTransaction) return
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/employee/transactions/${selectedTransaction.id}/verify`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchTransactions()
        setSelectedTransaction(null)
        setActionType(null)
      }
    } catch (error) {
      console.error("[v0] Failed to verify transaction:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTransaction || !rejectionReason) return
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/employee/transactions/${selectedTransaction.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (response.ok) {
        await fetchTransactions()
        setSelectedTransaction(null)
        setActionType(null)
        setRejectionReason("")
      }
    } catch (error) {
      console.error("[v0] Failed to reject transaction:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredTransactions = transactions.filter(
    (t) =>
      t.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sender_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transaction Verification</h1>
          <p className="text-slate-400">Review and process customer transactions</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by reference, sender, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">All Transactions</CardTitle>
            <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-slate-800 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white text-lg">
                        {transaction.sender_name} → {transaction.recipient_name}
                      </p>
                      <p className="text-sm text-slate-400">{transaction.customers?.email}</p>
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
                      <p className="text-slate-400">Bank</p>
                      <p className="text-white">{transaction.recipient_bank}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">SWIFT</p>
                      <p className="text-white font-mono text-xs">{transaction.recipient_swift}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-slate-400">Purpose</p>
                    <p className="text-white">{transaction.purpose}</p>
                  </div>

                  {transaction.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setActionType("verify")
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setActionType("reject")
                        }}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify Dialog */}
      <Dialog open={actionType === "verify"} onOpenChange={() => setActionType(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Verify Transaction</DialogTitle>
            <DialogDescription>Confirm that this transaction should be approved</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">
                Amount:{" "}
                <span className="text-white font-medium">
                  {selectedTransaction.amount} {selectedTransaction.currency}
                </span>
              </p>
              <p className="text-slate-400">
                Reference: <span className="text-white font-mono">{selectedTransaction.reference_number}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === "reject"} onOpenChange={() => setActionType(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Transaction</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="bg-slate-800 border-slate-700"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
