export const INPUT_PATTERNS = {
  username: /^[a-zA-Z0-9_.-]{3,32}$/,
  accountNumber: /^[A-Z]{2}\d{1,30}$/,
  idNumber: /^\d{13}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  currencyCode: /^[A-Z]{3}$/,
  paymentAmount: /^\d+(\.\d{1,2})?$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

export const validateInput = (field: string, value: string): { valid: boolean; error?: string } => {
  if (!value) return { valid: false, error: "This field is required" }

  switch (field) {
    case "username":
      if (!INPUT_PATTERNS.username.test(value)) {
        return { valid: false, error: "Username must be 3-32 characters (alphanumeric, dash, dot, underscore)" }
      }
      break

    case "accountNumber":
      if (!INPUT_PATTERNS.accountNumber.test(value)) {
        return { valid: false, error: "Invalid account number format (e.g., ZA1234567890)" }
      }
      break

    case "idNumber":
      if (!INPUT_PATTERNS.idNumber.test(value)) {
        return { valid: false, error: "ID number must be 13 digits" }
      }
      break

    case "swiftCode":
      if (!INPUT_PATTERNS.swiftCode.test(value.toUpperCase())) {
        return { valid: false, error: "Invalid SWIFT code format" }
      }
      break

    case "currencyCode":
      if (!INPUT_PATTERNS.currencyCode.test(value.toUpperCase())) {
        return { valid: false, error: "Currency code must be 3 letters (e.g., USD, EUR, ZAR)" }
      }
      break

    case "paymentAmount":
      if (!INPUT_PATTERNS.paymentAmount.test(value)) {
        return { valid: false, error: "Invalid amount (must be positive number with up to 2 decimals)" }
      }
      const amount = Number.parseFloat(value)
      if (amount <= 0 || amount > 999999999.99) {
        return { valid: false, error: "Amount must be between 0.01 and 999,999,999.99" }
      }
      break

    case "password":
      if (value.length < 12) {
        return { valid: false, error: "Password must be at least 12 characters" }
      }
      if (!/[A-Z]/.test(value)) {
        return { valid: false, error: "Password must contain uppercase letter" }
      }
      if (!/[a-z]/.test(value)) {
        return { valid: false, error: "Password must contain lowercase letter" }
      }
      if (!/\d/.test(value)) {
        return { valid: false, error: "Password must contain number" }
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
        return { valid: false, error: "Password must contain special character" }
      }
      break

    case "email":
      if (!INPUT_PATTERNS.email.test(value)) {
        return { valid: false, error: "Invalid email format" }
      }
      break
  }

  return { valid: true }
}
