import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"
import { Session } from "../models/Session"
import { PasswordManager } from "../utils/password"
import { JWTManager } from "../utils/jwt"
import { MFAManager } from "../utils/mfa"
import { AuditLogger } from "../utils/audit-logger"
import { INPUT_VALIDATORS, SECURITY_CONFIG } from "../config/security"

export class AuthController {
  /**
   * Register a new customer
   */
  static async registerCustomer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, accountNumber, password, confirmPassword, fullName, idNumber } = req.body

      // Validate inputs
      if (!INPUT_VALIDATORS.username(username)) {
        res.status(400).json({ error: "Invalid username format" })
        return
      }

      if (!INPUT_VALIDATORS.accountNumber(accountNumber)) {
        res.status(400).json({ error: "Invalid account number format" })
        return
      }

      if (!INPUT_VALIDATORS.fullName(fullName)) {
        res.status(400).json({ error: "Invalid full name format" })
        return
      }

      if (!INPUT_VALIDATORS.idNumber(idNumber)) {
        res.status(400).json({ error: "Invalid ID number format" })
        return
      }

      if (password !== confirmPassword) {
        res.status(400).json({ error: "Passwords do not match" })
        return
      }

      const passwordValidation = PasswordManager.validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        res.status(400).json({ error: "Password does not meet requirements", details: passwordValidation.errors })
        return
      }

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ username }, { accountNumber }, { idNumber }],
      })

      if (existingUser) {
        res.status(409).json({ error: "User with this username, account number, or ID already exists" })
        return
      }

      // Hash password
      const passwordHash = await PasswordManager.hashPassword(password)

      // Create user
      const user = new User({
        username,
        accountNumber,
        passwordHash,
        fullName,
        idNumber,
        role: "customer",
        isActive: true,
      })

      await user.save()

      // Audit log
      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        userId: user._id?.toString() || "unknown",
        action: "CUSTOMER_REGISTRATION",
        resource: "auth/register",
        status: "success",
        ipAddress: req.ip,
      })

      res.status(201).json({
        message: "Customer registered successfully",
        userId: user._id,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: "Registration failed" })
    }
  }

  /**
   * Login for both customers and employees
   */
  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, accountNumber, password, mfaToken } = req.body

      // Validate inputs
      if (!username || !accountNumber || !password) {
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      if (!INPUT_VALIDATORS.username(username) || !INPUT_VALIDATORS.accountNumber(accountNumber)) {
        res.status(400).json({ error: "Invalid input format" })
        return
      }

      // Find user
      const user = await User.findOne({ username, accountNumber })

      if (!user) {
        await AuditLogger.logLogin("unknown", false, req.ip)
        res.status(401).json({ error: "Invalid credentials" })
        return
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await AuditLogger.logLogin(user._id?.toString() || "", false, req.ip)
        res.status(429).json({ error: "Account temporarily locked due to too many failed attempts" })
        return
      }

      // Verify password
      const passwordMatch = await PasswordManager.comparePassword(password, user.passwordHash)

      if (!passwordMatch) {
        user.loginAttempts += 1

        if (user.loginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
          user.lockedUntil = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MS)
        }

        await user.save()
        await AuditLogger.logLogin(user._id?.toString() || "", false, req.ip)

        res.status(401).json({ error: "Invalid credentials" })
        return
      }

      // Check if MFA is enabled
      if (user.mfaEnabled && user.mfaVerified) {
        if (!mfaToken) {
          res.status(403).json({ error: "MFA token required", requiresMFA: true })
          return
        }

        // Verify MFA token
        const mfaValid = MFAManager.verifyToken(user.mfaSecret || "", mfaToken)

        if (!mfaValid) {
          await AuditLogger.logLogin(user._id?.toString() || "", false, req.ip)
          res.status(401).json({ error: "Invalid MFA token" })
          return
        }
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0
      user.lockedUntil = undefined
      user.lastLogin = new Date()
      user.tokenVersion += 1

      await user.save()

      // Generate tokens
      const tokens = JWTManager.generateTokenPair(user._id!.toString(), user.username, user.role, user.tokenVersion)

      // Store refresh token in database
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      const session = new Session({
        userId: user._id,
        refreshToken: tokens.refreshToken,
        tokenVersion: user.tokenVersion,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        expiresAt: sessionExpiresAt,
      })

      await session.save()

      // Set secure refresh token cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth",
      })

      await AuditLogger.logLogin(user._id?.toString() || "", true, req.ip)

      res.json({
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Login failed" })
    }
  }

  /**
   * Setup MFA for user
   */
  static async setupMFA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const user = await User.findById(req.userId)

      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }

      // Generate MFA secret and QR code
      const mfaSetup = await MFAManager.setupMFA(user.username)

      // Don't save yet - user needs to verify
      res.json({
        secret: mfaSetup.secret,
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes,
        message: "Scan the QR code with your authenticator app. Save your backup codes in a secure location.",
      })
    } catch (error) {
      console.error("MFA setup error:", error)
      res.status(500).json({ error: "MFA setup failed" })
    }
  }

  /**
   * Verify and enable MFA
   */
  static async verifyMFA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const { secret, mfaToken, backupCodes } = req.body

      if (!secret || !mfaToken || !backupCodes) {
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      const user = await User.findById(req.userId)

      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }

      // Verify MFA token
      const isValid = MFAManager.verifyToken(secret, mfaToken)

      if (!isValid) {
        res.status(400).json({ error: "Invalid MFA token" })
        return
      }

      // Save MFA settings
      user.mfaSecret = secret
      user.mfaBackupCodes = backupCodes
      user.mfaEnabled = true
      user.mfaVerified = true

      await user.save()

      await AuditLogger.logMFASetup(user._id?.toString() || "", true)

      res.json({
        message: "MFA enabled successfully",
        mfaEnabled: true,
      })
    } catch (error) {
      console.error("MFA verification error:", error)
      res.status(500).json({ error: "MFA verification failed" })
    }
  }

  /**
   * Disable MFA
   */
  static async disableMFA(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const user = await User.findById(req.userId)

      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }

      user.mfaEnabled = false
      user.mfaVerified = false
      user.mfaSecret = undefined
      user.mfaBackupCodes = []

      await user.save()

      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        userId: user._id?.toString() || "",
        action: "MFA_DISABLED",
        resource: "auth/mfa",
        status: "success",
      })

      res.json({ message: "MFA disabled successfully" })
    } catch (error) {
      console.error("MFA disable error:", error)
      res.status(500).json({ error: "MFA disable failed" })
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken

      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token missing" })
        return
      }

      // Verify refresh token
      const payload = JWTManager.verifyRefreshToken(refreshToken)

      if (!payload) {
        res.status(401).json({ error: "Invalid or expired refresh token" })
        return
      }

      // Check session in database
      const session = await Session.findOne({
        refreshToken,
        userId: payload.userId,
        tokenVersion: payload.tokenVersion,
        revokedAt: null,
      })

      if (!session) {
        res.status(401).json({ error: "Session not found or revoked" })
        return
      }

      // Get user
      const user = await User.findById(payload.userId)

      if (!user || !user.isActive) {
        res.status(401).json({ error: "User not found or inactive" })
        return
      }

      // Generate new access token
      const newAccessToken = JWTManager.generateAccessToken(user._id!.toString(), user.username, user.role)

      res.json({
        accessToken: newAccessToken,
        expiresIn: 15 * 60, // 15 minutes
      })
    } catch (error) {
      console.error("Token refresh error:", error)
      res.status(500).json({ error: "Token refresh failed" })
    }
  }

  /**
   * Logout (revoke refresh token)
   */
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken

      if (refreshToken) {
        // Revoke session
        await Session.updateOne({ refreshToken }, { revokedAt: new Date() })
      }

      // Clear cookie
      res.clearCookie("refreshToken", { path: "/api/auth" })

      if (req.userId) {
        await AuditLogger.log({
          timestamp: new Date().toISOString(),
          userId: req.userId,
          action: "LOGOUT",
          resource: "auth/logout",
          status: "success",
        })
      }

      res.json({ message: "Logged out successfully" })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({ error: "Logout failed" })
    }
  }

  /**
   * Create employee account (admin only)
   */
  static async createEmployeeAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can create employee accounts" })
        return
      }

      const { username, accountNumber, password, fullName } = req.body

      // Validate inputs
      if (!INPUT_VALIDATORS.username(username) || !INPUT_VALIDATORS.accountNumber(accountNumber)) {
        res.status(400).json({ error: "Invalid input format" })
        return
      }

      const passwordValidation = PasswordManager.validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        res.status(400).json({ error: "Password does not meet requirements", details: passwordValidation.errors })
        return
      }

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ username }, { accountNumber }] })

      if (existingUser) {
        res.status(409).json({ error: "User with this username or account number already exists" })
        return
      }

      // Hash password
      const passwordHash = await PasswordManager.hashPassword(password)

      // Create employee
      const employee = new User({
        username,
        accountNumber,
        passwordHash,
        fullName,
        role: "employee",
        isActive: true,
      })

      await employee.save()

      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        userId: req.userId || "unknown",
        action: "EMPLOYEE_ACCOUNT_CREATED",
        resource: "auth/employees",
        status: "success",
        details: { employeeId: employee._id },
      })

      res.status(201).json({
        message: "Employee account created successfully",
        employeeId: employee._id,
        username: employee.username,
      })
    } catch (error) {
      console.error("Employee creation error:", error)
      res.status(500).json({ error: "Employee account creation failed" })
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }

      const user = await User.findById(req.userId).select("-passwordHash -mfaSecret -mfaBackupCodes")

      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }

      res.json(user)
    } catch (error) {
      console.error("Get user error:", error)
      res.status(500).json({ error: "Failed to get user" })
    }
  }
}
