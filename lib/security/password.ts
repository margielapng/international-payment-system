import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/

export async function hashPassword(password: string): Promise<string> {
  if (!passwordRegex.test(password)) {
    throw new Error("Password does not meet security requirements")
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`)
  }

  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (passwordRequirements.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
