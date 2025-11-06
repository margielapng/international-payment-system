"use client"

import { useState, useEffect } from "react"
import apiClient from "../utils/api"
import "../styles/verification.css"

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

export default function PaymentVerification() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchPendingPayments()
  }, [])

  const fetchPendingPayments = async () => {
    try {
      const response = await apiClient.get("/api/payments/pending")
      setPayments(response.data.payments)
      if (response.data.payments.length > 0) {
        setSelectedPayment(response.data.payments[0])
      }
      setLoading(false)
    } catch (err) {
      setError("Failed to load payments")
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedPayment) return

    setVerifying(true)
    try {
      await apiClient.post(`/api/payments/${selectedPayment._id}/verify`, {
        verified: true,
      })

      setRejectionReason("")
      await fetchPendingPayments()
      alert("Payment verified successfully")
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    if (!window.confirm("Are you sure you want to reject this payment?")) {
      return
    }

    setVerifying(true)
    try {
      await apiClient.post(`/api/payments/${selectedPayment._id}/verify`, {
        verified: false,
        rejectionReason: rejectionReason.trim(),
      })

      setRejectionReason("")
      await fetchPendingPayments()
      alert("Payment rejected successfully")
    } catch (err: any) {
      setError(err.response?.data?.error || "Rejection failed")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  if (payments.length === 0) {
    return (
      <div className="verification-container">
        <div className="empty-state">No payments pending verification</div>
      </div>
    )
  }

  return (
    <div className="verification-container">
      <div className="verification-layout">
        <div className="payment-list">
          <h3>Payments to Review</h3>
          <div className="list-items">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className={`list-item ${selectedPayment?._id === payment._id ? "active" : ""}`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="item-info">
                  <span className="customer">{payment.customerId.username}</span>
                  <span className="amount">
                    {payment.amount} {payment.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPayment && (
          <div className="verification-form">
            <h3>Payment Details</h3>
            {error && <div className="alert-error">{error}</div>}

            <div className="details-card">
              <div className="detail-row">
                <label>Customer:</label>
                <span>{selectedPayment.customerId.username}</span>
              </div>
              <div className="detail-row">
                <label>Account Number:</label>
                <span>{selectedPayment.customerId.accountNumber}</span>
              </div>

              <hr />

              <div className="detail-row">
                <label>Amount:</label>
                <span className="highlight">
                  {selectedPayment.amount} {selectedPayment.currency}
                </span>
              </div>
              <div className="detail-row">
                <label>Payee Name:</label>
                <span>{selectedPayment.payeeFullName}</span>
              </div>
              <div className="detail-row">
                <label>Payee Account:</label>
                <span className="code">{selectedPayment.payeeAccountNumber}</span>
              </div>
              <div className="detail-row">
                <label>SWIFT Code:</label>
                <span className="code">{selectedPayment.payeeSwiftCode}</span>
              </div>
              <div className="detail-row">
                <label>Date Submitted:</label>
                <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>

              <hr />

              <div className="verification-actions">
                <div className="form-group">
                  <label htmlFor="rejectionReason">Rejection Reason (if rejecting):</label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                  />
                </div>

                <div className="action-buttons">
                  <button onClick={handleVerify} disabled={verifying} className="btn-verify">
                    {verifying ? "Processing..." : "✓ Verify"}
                  </button>
                  <button onClick={handleReject} disabled={verifying} className="btn-reject">
                    {verifying ? "Processing..." : "✕ Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
