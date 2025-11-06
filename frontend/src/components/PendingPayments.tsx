"use client"

import { useState, useEffect } from "react"
import apiClient from "../utils/api"
import "../styles/tables.css"

interface Payment {
  _id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  payeeFullName: string
  payeeAccountNumber: string
  payeeSwiftCode: string
  customerId: {
    username: string
    accountNumber: string
  }
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPendingPayments()
    const interval = setInterval(fetchPendingPayments, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchPendingPayments = async () => {
    try {
      const response = await apiClient.get("/api/payments/pending")
      setPayments(response.data.payments)
      setLoading(false)
    } catch (err) {
      setError("Failed to load pending payments")
      setLoading(false)
    }
  }

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId],
    )
  }

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(payments.map((p) => p._id))
    }
  }

  const handleSubmitToSwift = async () => {
    if (selectedPayments.length === 0) {
      alert("Please select at least one payment")
      return
    }

    if (!window.confirm(`Submit ${selectedPayments.length} payment(s) to SWIFT?`)) {
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post("/api/payments/swift/submit", {
        paymentIds: selectedPayments,
      })

      setSelectedPayments([])
      await fetchPendingPayments()
      alert("Payments submitted to SWIFT successfully")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit payments")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Loading pending payments...</div>

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>Pending Payments</h2>
        <span className="badge-count">{payments.length}</span>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {payments.length === 0 ? (
        <p className="empty-state">No pending payments</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table selectable">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length}
                      onChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payee</th>
                  <th>Account</th>
                  <th>SWIFT Code</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className={selectedPayments.includes(payment._id) ? "selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment._id)}
                        onChange={() => handleSelectPayment(payment._id)}
                        aria-label={`Select payment ${payment._id}`}
                      />
                    </td>
                    <td>{payment.customerId.username}</td>
                    <td className="amount">
                      {payment.amount} {payment.currency}
                    </td>
                    <td>{payment.payeeFullName}</td>
                    <td className="code">{payment.payeeAccountNumber}</td>
                    <td className="code">{payment.payeeSwiftCode}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-view-small">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-actions">
            <div className="selection-info">
              {selectedPayments.length > 0 && <span>{selectedPayments.length} payment(s) selected</span>}
            </div>
            <button
              onClick={handleSubmitToSwift}
              disabled={selectedPayments.length === 0 || submitting}
              className="btn-primary btn-submit"
            >
              {submitting ? "Submitting..." : `Submit to SWIFT (${selectedPayments.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
