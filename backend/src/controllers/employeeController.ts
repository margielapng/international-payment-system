import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"
import { PasswordManager } from "../utils/password"
import { AuditLog } from "../models/AuditLog"

export class EmployeeController {
  /**
   * List all employees (admin only)
   */
  static async listEmployees(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can list employees" })
        return
      }

      const { page = 1, limit = 20, active } = req.query

      const query: Record<string, any> = { role: "employee" }

      if (active !== undefined) {
        query.isActive = active === "true"
      }

      const employees = await User.find(query)
        .select("-passwordHash -mfaSecret -mfaBackupCodes")
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))

      const total = await User.countDocuments(query)

      res.json({
        employees,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("List employees error:", error)
      res.status(500).json({ error: "Failed to list employees" })
    }
  }

  /**
   * Get employee details (admin only)
   */
  static async getEmployeeDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can view employee details" })
        return
      }

      const { employeeId } = req.params

      const employee = await User.findOne({ _id: employeeId, role: "employee" }).select(
        "-passwordHash -mfaSecret -mfaBackupCodes",
      )

      if (!employee) {
        res.status(404).json({ error: "Employee not found" })
        return
      }

      // Get employee activity
      const activity = await AuditLog.find({ userId: employeeId }).sort({ timestamp: -1 }).limit(10)

      res.json({
        employee,
        recentActivity: activity,
      })
    } catch (error) {
      console.error("Get employee details error:", error)
      res.status(500).json({ error: "Failed to get employee details" })
    }
  }

  /**
   * Reset employee password (admin only)
   */
  static async resetEmployeePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can reset passwords" })
        return
      }

      const { employeeId } = req.params
      const { newPassword } = req.body

      if (!newPassword) {
        res.status(400).json({ error: "New password required" })
        return
      }

      const passwordValidation = PasswordManager.validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        res.status(400).json({ error: "Password does not meet requirements", details: passwordValidation.errors })
        return
      }

      const employee = await User.findOne({ _id: employeeId, role: "employee" })

      if (!employee) {
        res.status(404).json({ error: "Employee not found" })
        return
      }

      const passwordHash = await PasswordManager.hashPassword(newPassword)
      employee.passwordHash = passwordHash
      employee.loginAttempts = 0
      employee.lockedUntil = undefined

      await employee.save()

      await AuditLog.create({
        userId: req.userId,
        action: "EMPLOYEE_ACCOUNT_CREATED", // Reusing for password reset
        resource: `employees/${employeeId}/password-reset`,
        status: "success",
        details: { targetEmployee: employeeId },
        timestamp: new Date(),
      })

      res.json({ message: "Employee password reset successfully" })
    } catch (error) {
      console.error("Reset password error:", error)
      res.status(500).json({ error: "Failed to reset password" })
    }
  }

  /**
   * Deactivate employee (admin only)
   */
  static async deactivateEmployee(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can deactivate employees" })
        return
      }

      const { employeeId } = req.params

      if (employeeId === req.userId) {
        res.status(400).json({ error: "Cannot deactivate yourself" })
        return
      }

      const employee = await User.findOne({ _id: employeeId, role: "employee" })

      if (!employee) {
        res.status(404).json({ error: "Employee not found" })
        return
      }

      employee.isActive = false
      await employee.save()

      await AuditLog.create({
        userId: req.userId,
        action: "EMPLOYEE_DELETED",
        resource: `employees/${employeeId}`,
        status: "success",
        details: { targetEmployee: employeeId, username: employee.username },
        timestamp: new Date(),
      })

      res.json({ message: "Employee deactivated successfully" })
    } catch (error) {
      console.error("Deactivate employee error:", error)
      res.status(500).json({ error: "Failed to deactivate employee" })
    }
  }

  /**
   * Reactivate employee (admin only)
   */
  static async reactivateEmployee(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can reactivate employees" })
        return
      }

      const { employeeId } = req.params

      const employee = await User.findOne({ _id: employeeId, role: "employee" })

      if (!employee) {
        res.status(404).json({ error: "Employee not found" })
        return
      }

      employee.isActive = true
      await employee.save()

      await AuditLog.create({
        userId: req.userId,
        action: "EMPLOYEE_ACCOUNT_CREATED",
        resource: `employees/${employeeId}/reactivate`,
        status: "success",
        details: { targetEmployee: employeeId },
        timestamp: new Date(),
      })

      res.json({ message: "Employee reactivated successfully" })
    } catch (error) {
      console.error("Reactivate employee error:", error)
      res.status(500).json({ error: "Failed to reactivate employee" })
    }
  }
}
