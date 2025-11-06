import fs from "fs/promises"
import path from "path"

export interface AuditLog {
  timestamp: string
  userId: string
  action: string
  resource: string
  status: "success" | "failure"
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  private static logsDir = path.join(process.cwd(), "logs")

  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.logsDir, { recursive: true })
    } catch (error) {
      console.error("Failed to initialize audit logs directory:", error)
    }
  }

  static async log(auditLog: AuditLog): Promise<void> {
    try {
      const date = new Date().toISOString().split("T")[0]
      const logFile = path.join(this.logsDir, `audit-${date}.log`)
      const logEntry = JSON.stringify(auditLog) + "\n"
      await fs.appendFile(logFile, logEntry)
    } catch (error) {
      console.error("Failed to write audit log:", error)
    }
  }

  static async logLogin(userId: string, success: boolean, ipAddress?: string): Promise<void> {
    await this.log({
      timestamp: new Date().toISOString(),
      userId,
      action: "LOGIN_ATTEMPT",
      resource: "auth/login",
      status: success ? "success" : "failure",
      ipAddress,
    })
  }

  static async logMFASetup(userId: string, success: boolean): Promise<void> {
    await this.log({
      timestamp: new Date().toISOString(),
      userId,
      action: "MFA_SETUP",
      resource: "auth/mfa-setup",
      status: success ? "success" : "failure",
    })
  }

  static async logPaymentTransaction(
    userId: string,
    transactionId: string,
    details: Record<string, any>,
  ): Promise<void> {
    await this.log({
      timestamp: new Date().toISOString(),
      userId,
      action: "PAYMENT_CREATED",
      resource: "payments",
      status: "success",
      details: { transactionId, ...details },
    })
  }

  static async logEmployeeVerification(employeeId: string, transactionId: string, verified: boolean): Promise<void> {
    await this.log({
      timestamp: new Date().toISOString(),
      userId: employeeId,
      action: "TRANSACTION_VERIFIED",
      resource: "transactions",
      status: "success",
      details: { transactionId, verified },
    })
  }
}
