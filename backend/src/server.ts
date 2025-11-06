import express, { type Express, type Request, type Response } from "express"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

import {
  helmetMiddleware,
  corsOptions,
  generalLimiter,
  sanitizeMiddleware,
  hppMiddleware,
  httpsRedirectMiddleware,
  inputLengthMiddleware,
} from "./middleware/security"
import cors from "cors"
import authRoutes from "./routes/authRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import auditRoutes from "./routes/auditRoutes"
import employeeRoutes from "./routes/employeeRoutes"
import { AuditLogger } from "./utils/audit-logger"

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/secure-payments"

// Initialize audit logger
AuditLogger.initialize().catch(console.error)

// Security middleware
app.use(httpsRedirectMiddleware)
app.use(helmetMiddleware)
app.use(cors(corsOptions))
app.use(generalLimiter)

// Body parsers and sanitization
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ limit: "1mb", extended: true }))
app.use(cookieParser())
app.use(sanitizeMiddleware)
app.use(inputLengthMiddleware)
app.use(hppMiddleware)

// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/employees", employeeRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" })
})

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

export default app
