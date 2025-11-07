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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Secure International
              <span className="block text-blue-500">Payment System</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Transfer money globally with bank-grade security, real-time verification, and complete transparency
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle className="text-white">Bank-Grade Security</CardTitle>
              <CardDescription>Multi-factor authentication, encryption, and advanced fraud detection</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <Globe className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle className="text-white">Global Transfers</CardTitle>
              <CardDescription>Send money to over 150 countries with competitive exchange rates</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <Lock className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle className="text-white">Compliance First</CardTitle>
              <CardDescription>Full regulatory compliance with KYC/AML standards and data protection</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle className="text-white">Fast Processing</CardTitle>
              <CardDescription>Real-time verification and processing for urgent transfers</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Employee Portal Link */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-4">Are you an employee?</p>
          <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
            <Link href="/employee/login">Employee Portal →</Link>
          </Button>
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
