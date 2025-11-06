import express from "express"
import { AuditController } from "../controllers/auditController"
import { authMiddleware, roleMiddleware } from "../middleware/auth"
import { authLimiter } from "../middleware/security"

const router = express.Router()

// Audit log routes (employee/admin only)
router.get("/", authMiddleware, roleMiddleware(["employee", "admin"]), AuditController.getAuditLogs)

router.get("/user-activity", authMiddleware, roleMiddleware(["employee", "admin"]), AuditController.getUserActivity)

router.get("/system-activity", authMiddleware, roleMiddleware(["admin"]), AuditController.getSystemActivity)

router.get("/export", authLimiter, authMiddleware, roleMiddleware(["admin"]), AuditController.exportAuditLogs)

export default router
