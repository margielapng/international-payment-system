import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import { Payment } from "../models/Payment"
import { User } from "../models/User"
import { INPUT_VALIDATORS } from "../config/security"
import { AuditLogger } from "../utils/audit-logger"

export class PaymentController {
  /**
   * Create a new payment transaction
   */
  static async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { amount, currency, provider, payeeFullName, payeeAccountNumber, payeeSwiftCode } = req.body

      // Validate inputs
      if (!INPUT_VALIDATORS.paymentAmount(String(amount))) {
        res.status(400).json({ error: "Invalid amount" })
        return
      }

      if (!INPUT_VALIDATORS.currencyCode(currency)) {
        res.status(400).json({ error: "Invalid currency code" })
        return
      }

      if (provider !== "SWIFT") {
        res.status(400).json({ error: "Invalid payment provider" })
        return
      }

      if (!INPUT_VALIDATORS.swiftCode(payeeSwiftCode)) {
        res.status(400).json({ error: "Invalid SWIFT code" })
        return
      }

      if (!INPUT_VALIDATORS.accountNumber(payeeAccountNumber)) {
        res.status(400).json({ error: "Invalid payee account number" })
        return
      }

      // Validate payee name
      if (!payeeFullName || payeeFullName.trim().length < 2 || payeeFullName.length > 100) {
        res.status(400).json({ error: "Invalid payee name" })
        return
      }

      // Check for malicious patterns
      if (this.containsSuspiciousPatterns(payeeFullName)) {
        res.status(400).json({ error: "Invalid characters in payee name" })
        return
      }

      // Verify customer exists and is active
      const customer = await User.findById(req.userId)
      if (!customer || customer.role !== "customer" || !customer.isActive) {
        res.status(403).json({ error: "Only active customers can create payments" })
        return
      }

      // Create payment transaction
      const payment = new Payment({
        customerId: req.userId,
        amount: Number.parseFloat(String(amount)),
        currency: currency.toUpperCase(),
        provider: "SWIFT",
        payeeFullName: payeeFullName.trim(),
        payeeAccountNumber: payeeAccountNumber.toUpperCase(),
        payeeSwiftCode: payeeSwiftCode.toUpperCase(),
        status: "pending",
      })

      await payment.save()

      // Audit log
      await AuditLogger.logPaymentTransaction(req.userId, payment._id?.toString() || "", {
        amount: payment.amount,
        currency: payment.currency,
        payee: payment.payeeFullName,
      })

      res.status(201).json({
        message: "Payment created successfully",
        transactionId: payment._id,
        status: payment.status,
      })
    } catch (error) {
      console.error("Payment creation error:", error)
      res.status(500).json({ error: "Failed to create payment" })
    }
  }

  /**
   * Get customer's payment transactions
   */
  static async getCustomerPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { page = 1, limit = 20, status } = req.query

      const query: Record<string, any> = { customerId: req.userId }

      if (status) {
        query.status = status
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .select("-__v")

      const total = await Payment.countDocuments(query)

      res.json({
        payments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Get payments error:", error)
      res.status(500).json({ error: "Failed to fetch payments" })
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { paymentId } = req.params

      const payment = await Payment.findOne({
        _id: paymentId,
        customerId: req.userId,
      })

      if (!payment) {
        res.status(404).json({ error: "Payment not found" })
        return
      }

      res.json(payment)
    } catch (error) {
      console.error("Get payment details error:", error)
      res.status(500).json({ error: "Failed to fetch payment details" })
    }
  }

  /**
   * Get all pending payments (for employees to verify)
   */
  static async getPendingPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "employee" && req.role !== "admin") {
        res.status(403).json({ error: "Only employees can view pending payments" })
        return
      }

      const { page = 1, limit = 20 } = req.query

      const payments = await Payment.find({ status: "pending" })
        .populate("customerId", "username accountNumber")
        .sort({ createdAt: 1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .select("-__v")

      const total = await Payment.countDocuments({ status: "pending" })

      res.json({
        payments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Get pending payments error:", error)
      res.status(500).json({ error: "Failed to fetch pending payments" })
    }
  }

  /**
   * Verify payment (employee action)
   */
  static async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "employee" && req.role !== "admin") {
        res.status(403).json({ error: "Only employees can verify payments" })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { paymentId } = req.params
      const { verified, rejectionReason } = req.body

      const payment = await Payment.findById(paymentId)

      if (!payment) {
        res.status(404).json({ error: "Payment not found" })
        return
      }

      if (payment.status !== "pending") {
        res.status(400).json({ error: "Payment is not pending" })
        return
      }

      if (verified === false && !rejectionReason) {
        res.status(400).json({ error: "Rejection reason required" })
        return
      }

      if (verified === false) {
        // Reject payment
        payment.status = "rejected"
        payment.failureReason = rejectionReason
      } else {
        // Verify payment
        payment.status = "verified"
        payment.verifiedBy = req.userId
        payment.verificationTimestamp = new Date()
      }

      await payment.save()

      // Audit log
      await AuditLogger.logEmployeeVerification(req.userId, payment._id?.toString() || "", verified)

      res.json({
        message: verified ? "Payment verified successfully" : "Payment rejected successfully",
        status: payment.status,
      })
    } catch (error) {
      console.error("Verify payment error:", error)
      res.status(500).json({ error: "Failed to verify payment" })
    }
  }

  /**
   * Submit verified payments to SWIFT
   */
  static async submitToSwift(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "employee" && req.role !== "admin") {
        res.status(403).json({ error: "Only employees can submit to SWIFT" })
        return
      }

      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { paymentIds } = req.body

      if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
        res.status(400).json({ error: "Payment IDs array required" })
        return
      }

      // Find payments to submit
      const payments = await Payment.find({
        _id: { $in: paymentIds },
        status: "verified",
      })

      if (payments.length === 0) {
        res.status(400).json({ error: "No verified payments found to submit" })
        return
      }

      if (payments.length !== paymentIds.length) {
        res.status(400).json({ error: "Some payments are not in verified status" })
        return
      }

      // Generate transaction references for SWIFT
      const updates = payments.map(async (payment) => {
        payment.status = "submitted_to_swift"
        payment.submittedToSwift = new Date()
        payment.transactionReference = this.generateSwiftReference()
        await payment.save()
      })

      await Promise.all(updates)

      // Audit log
      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        userId: req.userId,
        action: "SWIFT_SUBMISSION",
        resource: "payments/swift",
        status: "success",
        details: {
          paymentCount: payments.length,
          totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        },
      })

      res.json({
        message: `${payments.length} payment(s) submitted to SWIFT`,
        submitted: payments.length,
      })
    } catch (error) {
      console.error("SWIFT submission error:", error)
      res.status(500).json({ error: "Failed to submit to SWIFT" })
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "employee" && req.role !== "admin") {
        res.status(403).json({ error: "Only employees can view statistics" })
        return
      }

      const stats = await Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ])

      const totalPayments = await Payment.countDocuments()
      const totalAmount = await Payment.aggregate([
        {
          $group: {
            _id: null,
            sum: { $sum: "$amount" },
          },
        },
      ])

      res.json({
        totalPayments,
        totalAmount: totalAmount[0]?.sum || 0,
        byStatus: stats,
      })
    } catch (error) {
      console.error("Get stats error:", error)
      res.status(500).json({ error: "Failed to fetch statistics" })
    }
  }

  /**
   * Helper: Check for suspicious patterns
   */
  private static containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /eval/i, /expression/i]

    return suspiciousPatterns.some((pattern) => pattern.test(input))
  }

  /**
   * Helper: Generate SWIFT transaction reference
   */
  private static generateSwiftReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `SWIFT${timestamp}${random}`.substring(0, 32)
  }
}
