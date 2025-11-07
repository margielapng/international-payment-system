"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Users, Shield } from "lucide-react"

export default function EmployeeManagementPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("employee")
  const [department, setDepartment] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/employee/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          department,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee")
      }

      setSuccess(`Employee created successfully! ID: ${data.employee.employeeId}`)
      setEmail("")
      setPassword("")
      setFullName("")
      setRole("employee")
      setDepartment("")

      setTimeout(() => {
        setOpen(false)
        setSuccess("")
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Create New Employee
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new employee to the system. They will receive their credentials to access the employee portal.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createEmployee} className="space-y-4 mt-4">
                {error && (
                  <Alert className="bg-red-950 border-red-800">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-emerald-950 border-emerald-800">
                    <AlertDescription className="text-emerald-200">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    placeholder="Min 12 chars, uppercase, lowercase, number, special char"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    placeholder="e.g., Compliance, Operations"
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Creating..." : "Create Employee"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Employee List</h2>
          <p className="text-slate-400">Employee listing interface will be displayed here.</p>
        </Card>
      </div>
    </div>
  )
}
