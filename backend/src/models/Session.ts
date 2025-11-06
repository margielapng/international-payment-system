import mongoose, { Schema, type Document } from "mongoose"

export interface ISession extends Document {
  userId: string
  refreshToken: string
  tokenVersion: number
  ipAddress?: string
  userAgent?: string
  expiresAt: Date
  createdAt: Date
  revokedAt?: Date
}

const SessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    tokenVersion: {
      type: Number,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// TTL index to automatically delete expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
SessionSchema.index({ userId: 1 })

export const Session = mongoose.model<ISession>("Session", SessionSchema)
