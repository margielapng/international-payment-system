import express from "express"
import { AuthController } from "../controllers/authController"
import { authMiddleware, roleMiddleware } from "../middleware/auth"
import { loginLimiter, authLimiter } from "../middleware/security"

const router = express.Router()

// Public routes
router.post("/register", loginLimiter, AuthController.registerCustomer)
router.post("/login", loginLimiter, AuthController.login)
router.post("/refresh-token", AuthController.refreshToken)

// Protected routes
router.post("/logout", authMiddleware, AuthController.logout)
router.get("/me", authMiddleware, AuthController.getCurrentUser)

// MFA routes
router.post("/mfa/setup", authLimiter, authMiddleware, AuthController.setupMFA)
router.post("/mfa/verify", authLimiter, authMiddleware, AuthController.verifyMFA)
router.post("/mfa/disable", authLimiter, authMiddleware, AuthController.disableMFA)

// Admin routes
router.post("/employees", authLimiter, authMiddleware, roleMiddleware(["admin"]), AuthController.createEmployeeAccount)

export default router
