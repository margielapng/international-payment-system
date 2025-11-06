import express from "express"
import { PaymentController } from "../controllers/paymentController"
import { authMiddleware, roleMiddleware } from "../middleware/auth"
import { authLimiter } from "../middleware/security"

const router = express.Router()

// Customer routes
router.post("/", authLimiter, authMiddleware, roleMiddleware(["customer"]), PaymentController.createPayment)

router.get("/", authMiddleware, roleMiddleware(["customer"]), PaymentController.getCustomerPayments)

router.get("/:paymentId", authMiddleware, roleMiddleware(["customer"]), PaymentController.getPaymentDetails)

// Employee routes
router.get("/pending", authMiddleware, roleMiddleware(["employee", "admin"]), PaymentController.getPendingPayments)

router.post(
  "/:paymentId/verify",
  authLimiter,
  authMiddleware,
  roleMiddleware(["employee", "admin"]),
  PaymentController.verifyPayment,
)

router.post(
  "/swift/submit",
  authLimiter,
  authMiddleware,
  roleMiddleware(["employee", "admin"]),
  PaymentController.submitToSwift,
)

router.get("/stats/overview", authMiddleware, roleMiddleware(["employee", "admin"]), PaymentController.getPaymentStats)

export default router
