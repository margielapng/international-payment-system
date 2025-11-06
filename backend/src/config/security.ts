// Security configuration constants
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  LOCKOUT_CLEAR_TIME_MS: 24 * 60 * 60 * 1000, // 24 hours

  // JWT tokens
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,
  LOGIN_RATE_LIMIT_MAX: 5, // per 5 minutes

  // MFA
  MFA_WINDOW_SIZE: 2, // Number of 30-second windows to accept
  MFA_BACKUP_CODES_COUNT: 10,

  // Session
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes

  // Input validation
  USERNAME_PATTERN: /^[a-zA-Z0-9_.-]{3,32}$/,
  ACCOUNT_NUMBER_PATTERN: /^[A-Z]{2}\d{1,30}$/,
  ID_NUMBER_PATTERN: /^\d{13}$/,
  SWIFT_CODE_PATTERN: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  CURRENCY_CODE_PATTERN: /^[A-Z]{3}$/,
  AMOUNT_PATTERN: /^\d+(\.\d{1,2})?$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

export const INPUT_VALIDATORS = {
  username: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.USERNAME_PATTERN.test(value) && value.length >= 3 && value.length <= 32
  },

  accountNumber: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.ACCOUNT_NUMBER_PATTERN.test(value)
  },

  idNumber: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.ID_NUMBER_PATTERN.test(value)
  },

  fullName: (value: string): boolean => {
    if (typeof value !== "string") return false
    return /^[a-zA-Z\s'-]{2,100}$/.test(value) && value.trim().length >= 2
  },

  swiftCode: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.SWIFT_CODE_PATTERN.test(value.toUpperCase())
  },

  currencyCode: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.CURRENCY_CODE_PATTERN.test(value.toUpperCase())
  },

  paymentAmount: (value: string | number): boolean => {
    const stringValue = String(value)
    if (!SECURITY_CONFIG.AMOUNT_PATTERN.test(stringValue)) return false
    const amount = Number.parseFloat(stringValue)
    return amount > 0 && amount <= 999999999.99
  },

  email: (value: string): boolean => {
    if (typeof value !== "string") return false
    return SECURITY_CONFIG.EMAIL_PATTERN.test(value) && value.length <= 255
  },

  password: (value: string): boolean => {
    if (typeof value !== "string") return false
    const config = SECURITY_CONFIG

    if (value.length < config.PASSWORD_MIN_LENGTH) return false
    if (config.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(value)) return false
    if (config.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(value)) return false
    if (config.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(value)) return false
    if (config.PASSWORD_REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return false

    return true
  },
}
