"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../utils/api"
import PendingPayments from "./PendingPayments"
import PaymentVerification from "./PaymentVerification"
import EmployeeStats from "./EmployeeStats"
import "../styles/employee-dashboard.css"

interface User {
  id: string
  username: string
  role: string
  fullName: string
}

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("/auth/me")
      setUser(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load user data")
      setLoading(false)
      navigate("/login")
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      navigate("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header employee-header">
        <div className="header-content">
          <h1>Secure Bank - Employee Portal</h1>
          <div className="user-info">
            <span>{user?.fullName || user?.username}</span>
            <span className="role-badge">{user?.role.toUpperCase()}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="dashboard-nav employee-nav">
        <button
          className={`nav-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Verification
        </button>
        <button className={`nav-tab ${activeTab === "verify" ? "active" : ""}`} onClick={() => setActiveTab("verify")}>
          Verify Payments
        </button>
        <button className={`nav-tab ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
          Statistics
        </button>
      </div>

      <main className="dashboard-content employee-content">
        {activeTab === "pending" && <PendingPayments />}
        {activeTab === "verify" && <PaymentVerification />}
        {activeTab === "stats" && <EmployeeStats />}
      </main>
    </div>
  )
}
