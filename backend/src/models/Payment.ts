import mongoose, { Schema, type Document } from "mongoose"

export interface IPayment extends Document {
  customerId: string
  amount: number
  currency: string
  provider: string
  payeeFullName: string
  payeeAccountNumber: string
  payeeSwiftCode: string
  status: "pending" | "verified" | "submitted_to_swift" | "failed" | "rejected"
  verifiedBy?: string
  verificationTimestamp?: Date
  submittedToSwift?: Date
  failureReason?: string
  transactionReference?: string
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema: Schema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 999999999.99,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["USD", "EUR", "GBP", "ZAR", "JPY"],
    },
    provider: {
      type: String,
      required: true,
      default: "SWIFT",
      enum: ["SWIFT"],
    },
    payeeFullName: {
      type: String,
      required: true,
      trim: true,
    },
    payeeAccountNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    payeeSwiftCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "submitted_to_swift", "failed", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verificationTimestamp: {
      type: Date,
      default: null,
    },
    submittedToSwift: {
      type: Date,
      default: null,
    },
    failureReason: String,
    transactionReference: String,
  },
  {
    timestamps: true,
  },
)

// Indexes for query optimization
PaymentSchema.index({ customerId: 1, createdAt: -1 })
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ provider: 1 })

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema)
