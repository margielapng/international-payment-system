"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../utils/api"
import PaymentForm from "./PaymentForm"
import TransactionHistory from "./TransactionHistory"
import MFASetup from "./MFASetup"
import "../styles/dashboard.css"

interface User {
  id: string
  username: string
  role: string
  mfaEnabled: boolean
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("payment")
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Secure Bank - Customer Portal</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          New Payment
        </button>
        <button
          className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Transaction History
        </button>
        <button className={`nav-tab ${activeTab === "mfa" ? "active" : ""}`} onClick={() => setActiveTab("mfa")}>
          Security Settings
        </button>
      </div>

      <main className="dashboard-content">
        {activeTab === "payment" && <PaymentForm />}
        {activeTab === "history" && <TransactionHistory />}
        {activeTab === "mfa" && user && <MFASetup user={user} onUpdate={fetchUserData} />}
      </main>
    </div>
  )
}
