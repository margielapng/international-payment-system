"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [transactions, setTransactions] = useState([])
  const [verifications, setVerifications] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransactions(response.data || [])
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (transactionId) => {
    setVerifications({
      ...verifications,
      [transactionId]: !verifications[transactionId],
    })
  }

  const handleSubmitToSwift = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const verifiedTransactions = Object.keys(verifications).filter((id) => verifications[id])

      await axios.post(
        `${API_URL}/api/transactions/submit-swift`,
        { transactionIds: verifiedTransactions },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setVerifications({})
      fetchTransactions()
      alert("Transactions submitted to SWIFT successfully!")
    } catch (error) {
      alert("Failed to submit to SWIFT")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    navigate("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white text-xl">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-12 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white">SecureBank - Employee Portal</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Transaction Verification</h2>
        <p className="text-slate-400">Employee: {user.username}</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Currency</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Payee</th>
                <th className="px-6 py-4 text-left text-white font-semibold">SWIFT Code</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Verify</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-white">{transaction.amount}</td>
                    <td className="px-6 py-4 text-white">{transaction.currency}</td>
                    <td className="px-6 py-4 text-white">{transaction.payeeAccountName}</td>
                    <td className="px-6 py-4 text-white font-mono">{transaction.payeeSwiftCode}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={verifications[transaction.id] || false}
                        onChange={() => handleVerify(transaction.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No transactions to verify
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {Object.values(verifications).some((v) => v) && (
          <div className="bg-slate-900 px-6 py-4 border-t border-slate-700">
            <button
              onClick={handleSubmitToSwift}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Submit {Object.values(verifications).filter(Boolean).length} Verified Transactions to SWIFT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
