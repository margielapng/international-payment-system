import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  username: string
  accountNumber: string
  passwordHash: string
  fullName?: string
  idNumber?: string
  email?: string
  role: "customer" | "employee" | "admin"
  mfaEnabled: boolean
  mfaSecret?: string
  mfaBackupCodes: string[]
  mfaVerified: boolean
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  lastLogin?: Date
  loginAttempts: number
  lockedUntil?: Date
  tokenVersion: number
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: function () {
        return this.role === "customer"
      },
      trim: true,
    },
    idNumber: {
  type: String,
  required: function (this: any): boolean {
    return this.role === "customer";
  },
  unique: true,
  sparse: true,
},
email: {
  type: String,
  unique: true,
  sparse: true,
  trim: true,
  lowercase: true,
},

    role: {
      type: String,
      enum: ["customer", "employee", "admin"],
      default: "customer",
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      default: null,
    },
    mfaBackupCodes: {
      type: [String],
      default: [],
    },
    mfaVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
UserSchema.index({ username: 1 })
UserSchema.index({ accountNumber: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ isActive: 1 })

export const User = mongoose.model<IUser>("User", UserSchema)
