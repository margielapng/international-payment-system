import express from "express"
import { EmployeeController } from "../controllers/employeeController"
import { authMiddleware, roleMiddleware } from "../middleware/auth"
import { authLimiter } from "../middleware/security"

const router = express.Router()

// Employee management routes (admin only)
router.get("/", authMiddleware, roleMiddleware(["admin"]), EmployeeController.listEmployees)

router.get("/:employeeId", authMiddleware, roleMiddleware(["admin"]), EmployeeController.getEmployeeDetails)

router.post(
  "/:employeeId/reset-password",
  authLimiter,
  authMiddleware,
  roleMiddleware(["admin"]),
  EmployeeController.resetEmployeePassword,
)

router.post(
  "/:employeeId/deactivate",
  authLimiter,
  authMiddleware,
  roleMiddleware(["admin"]),
  EmployeeController.deactivateEmployee,
)

router.post(
  "/:employeeId/reactivate",
  authLimiter,
  authMiddleware,
  roleMiddleware(["admin"]),
  EmployeeController.reactivateEmployee,
)

export default router
