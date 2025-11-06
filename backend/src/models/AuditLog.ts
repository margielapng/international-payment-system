import mongoose, { Schema, type Document } from "mongoose"

export interface IAuditLog extends Document {
  userId: string
  action: string
  resource: string
  status: "success" | "failure"
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  createdAt: Date
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_ATTEMPT",
        "LOGOUT",
        "REGISTRATION",
        "MFA_SETUP",
        "MFA_DISABLED",
        "PAYMENT_CREATED",
        "PAYMENT_VERIFIED",
        "PAYMENT_REJECTED",
        "PAYMENT_SUBMITTED_TO_SWIFT",
        "EMPLOYEE_ACCOUNT_CREATED",
        "EMPLOYEE_DELETED",
        "AUDIT_LOG_VIEWED",
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    details: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "auditlogs",
  },
)

// TTL index to auto-delete logs older than 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)
