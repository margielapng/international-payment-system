"use client"

import { useState, useEffect } from "react"
import apiClient from "../utils/api"
import "../styles/tables.css"

interface Transaction {
  _id: string
  amount: number
  currency: string
  status: "pending" | "verified" | "submitted" | "failed"
  createdAt: string
  payeeFullName: string
  payeeAccountNumber: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get("/payments")
      setTransactions(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load transactions")
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading transactions...</div>

  return (
    <div className="table-card">
      <h2>Transaction History</h2>

      {error && <div className="alert-error">{error}</div>}

      {transactions.length === 0 ? (
        <p className="empty-state">No transactions found</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Payee</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td>
                    {tx.amount} {tx.currency}
                  </td>
                  <td>{tx.payeeFullName}</td>
                  <td>
                    <span className={`status-badge status-${tx.status}`}>{tx.status}</span>
                  </td>
                  <td>
                    <button className="btn-small">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
