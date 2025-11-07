export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[a-zA-Z\s\-']{2,50}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  accountNumber: /^[0-9]{8,17}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  iban: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
  sortCode: /^\d{6}$/,
  routingNumber: /^\d{9}$/,
  address: /^[a-zA-Z0-9\s,.\-']{5,100}$/,
  city: /^[a-zA-Z\s\-']{2,50}$/,
  postalCode: /^[A-Z0-9\s-]{3,10}$/,
  country: /^[A-Z]{2}$/,
}

export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input)
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
}

export function validateEmail(email: string): boolean {
  return validationPatterns.email.test(email)
}

export function validateAmount(amount: string): boolean {
  if (!validationPatterns.amount.test(amount)) return false
  const numAmount = Number.parseFloat(amount)
  return numAmount > 0 && numAmount <= 1000000
}

export function validateIBAN(iban: string): boolean {
  return validationPatterns.iban.test(iban)
}

export function validateSWIFT(swift: string): boolean {
  return validationPatterns.swiftCode.test(swift)
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateTransactionData(data: {
  recipientName: string
  recipientBank: string
  accountNumber: string
  swiftCode: string
  amount: string
  currency: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!validateInput(data.recipientName, validationPatterns.name)) {
    errors.recipientName = "Invalid recipient name format"
  }

  if (!validateInput(data.recipientBank, validationPatterns.name)) {
    errors.recipientBank = "Invalid bank name format"
  }

  if (!validateInput(data.accountNumber, validationPatterns.accountNumber)) {
    errors.accountNumber = "Invalid account number format"
  }

  if (!validateSWIFT(data.swiftCode)) {
    errors.swiftCode = "Invalid SWIFT code format"
  }

  if (!validateAmount(data.amount)) {
    errors.amount = "Invalid amount (must be between 0 and 1,000,000)"
  }

  if (!data.currency || data.currency.length !== 3) {
    errors.currency = "Invalid currency code"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
