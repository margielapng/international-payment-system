"use client"

import { useState, useEffect } from "react"
import apiClient from "../utils/api"
import "../styles/stats.css"

interface Stats {
  totalPayments: number
  totalAmount: number
  byStatus: Array<{
    _id: string
    count: number
    totalAmount: number
  }>
}

export default function EmployeeStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/payments/stats/overview")
      setStats(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load statistics")
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading statistics...</div>

  return (
    <div className="stats-container">
      {error && <div className="alert-error">{error}</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Payments</h4>
              <div className="stat-value">{stats.totalPayments}</div>
            </div>

            <div className="stat-card">
              <h4>Total Amount</h4>
              <div className="stat-value">${stats.totalAmount.toLocaleString()}</div>
            </div>
          </div>

          <div className="status-breakdown">
            <h3>Payment Status Breakdown</h3>
            <div className="breakdown-items">
              {stats.byStatus.map((item) => (
                <div key={item._id} className="breakdown-item">
                  <div className="item-header">
                    <span className="status-label">{item._id.toUpperCase()}</span>
                    <span className="item-count">{item.count}</span>
                  </div>
                  <div className="item-amount">Total: ${item.totalAmount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
