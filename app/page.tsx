"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("accessToken")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Redirect based on role
        if (userData.role === "customer") {
          router.push("/customer/dashboard")
        } else if (userData.role === "employee" || userData.role === "admin") {
          router.push("/employee/dashboard")
        }
      } catch (error) {
        console.error("Failed to parse user data")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">Secure Bank International Payments</h1>
        <p className="text-xl text-slate-300 mb-8">
          A secure, enterprise-grade platform for international payment processing with advanced security features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Customer Portal Card */}
          <Link href="/login?role=customer">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition cursor-pointer transform hover:scale-105">
              <h2 className="text-2xl font-bold text-white mb-2">Customer Portal</h2>
              <p className="text-slate-400 mb-6">Submit international payments securely with full verification.</p>
              <div className="text-blue-400 font-semibold">Get Started →</div>
            </div>
          </Link>

          {/* Employee Portal Card */}
          <Link href="/login?role=employee">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-purple-500 transition cursor-pointer transform hover:scale-105">
              <h2 className="text-2xl font-bold text-white mb-2">Employee Portal</h2>
              <p className="text-slate-400 mb-6">Verify and process international payments with audit trails.</p>
              <div className="text-purple-400 font-semibold">Access Portal →</div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">JWT Authentication + MFA</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">Bcrypt Password Hashing</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">Input Validation & Sanitization</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">HTTPS/TLS Encryption</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">Comprehensive Audit Logging</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">Rate Limiting & DDoS Protection</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">XSS & CSRF Protection</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-slate-300">Role-Based Access Control</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            Register as Customer
          </Link>
        </div>
      </div>
    </div>
  )
}
