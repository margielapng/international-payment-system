"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    accountNumber: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = "Username required"
    if (!formData.accountNumber) newErrors.accountNumber = "Account number required"
    if (!formData.password) newErrors.password = "Password required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: formData.username,
        accountNumber: formData.accountNumber,
        password: formData.password,
      })

      localStorage.setItem("accessToken", response.data.accessToken)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      const role = response.data.user.role
      if (role === "customer") {
        navigate("/customer/dashboard")
      } else if (role === "employee") {
        navigate("/employee/dashboard")
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || "Login failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-slate-400 mb-6">Secure access to international payments</p>

          {errors.submit && <div className="alert-error mb-4">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className={`secure-input w-full ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Your account number"
                className={`secure-input w-full ${errors.accountNumber ? "border-red-500" : ""}`}
              />
              {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                className={`secure-input w-full ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} className="text-sky-400 hover:text-sky-300">
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
