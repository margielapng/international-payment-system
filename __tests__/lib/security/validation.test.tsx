import {
  validateEmail,
  validateName,
  validatePhone,
  validateAmount,
  validateAccountNumber,
  validateSwiftCode,
  validateIBAN,
  sanitizeInput,
  sanitizeHtml,
} from "@/lib/security/validation"

describe("Input Validation", () => {
  describe("validateEmail", () => {
    it("should accept valid email", () => {
      expect(validateEmail("user@example.com")).toBe(true)
      expect(validateEmail("test.user+tag@domain.co.uk")).toBe(true)
    })

    it("should reject invalid email", () => {
      expect(validateEmail("invalid")).toBe(false)
      expect(validateEmail("user@")).toBe(false)
      expect(validateEmail("@domain.com")).toBe(false)
      expect(validateEmail("user @domain.com")).toBe(false)
    })
  })

  describe("validateName", () => {
    it("should accept valid names", () => {
      expect(validateName("John Doe")).toBe(true)
      expect(validateName("O'Brien")).toBe(true)
      expect(validateName("Mary-Jane")).toBe(true)
    })

    it("should reject invalid names", () => {
      expect(validateName("J")).toBe(false) // Too short
      expect(validateName("John123")).toBe(false) // Contains numbers
      expect(validateName("John@Doe")).toBe(false) // Invalid characters
    })
  })

  describe("validatePhone", () => {
    it("should accept valid phone numbers", () => {
      expect(validatePhone("+1234567890")).toBe(true)
      expect(validatePhone("+447911123456")).toBe(true)
      expect(validatePhone("1234567890")).toBe(true)
    })

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("123")).toBe(false) // Too short
      expect(validatePhone("+0123456789")).toBe(false) // Starts with 0
      expect(validatePhone("abc1234567")).toBe(false) // Contains letters
    })
  })

  describe("validateAmount", () => {
    it("should accept valid amounts", () => {
      expect(validateAmount("100")).toBe(true)
      expect(validateAmount("100.50")).toBe(true)
      expect(validateAmount("1000.99")).toBe(true)
    })

    it("should reject invalid amounts", () => {
      expect(validateAmount("0")).toBe(false) // Zero
      expect(validateAmount("-100")).toBe(false) // Negative
      expect(validateAmount("100.999")).toBe(false) // Too many decimals
      expect(validateAmount("abc")).toBe(false) // Not a number
    })
  })

  describe("validateAccountNumber", () => {
    it("should accept valid account numbers", () => {
      expect(validateAccountNumber("12345678")).toBe(true)
      expect(validateAccountNumber("1234567890123456")).toBe(true)
    })

    it("should reject invalid account numbers", () => {
      expect(validateAccountNumber("1234567")).toBe(false) // Too short
      expect(validateAccountNumber("12345678901234567")).toBe(false) // Too long
      expect(validateAccountNumber("1234abcd")).toBe(false) // Contains letters
    })
  })

  describe("validateSwiftCode", () => {
    it("should accept valid SWIFT codes", () => {
      expect(validateSwiftCode("DEUTDEFF")).toBe(true)
      expect(validateSwiftCode("DEUTDEFF500")).toBe(true)
    })

    it("should reject invalid SWIFT codes", () => {
      expect(validateSwiftCode("DEUT")).toBe(false) // Too short
      expect(validateSwiftCode("deutdeff")).toBe(false) // Lowercase
      expect(validateSwiftCode("DEUT123F")).toBe(false) // Numbers in wrong place
    })
  })

  describe("validateIBAN", () => {
    it("should accept valid IBAN", () => {
      expect(validateIBAN("GB82WEST12345698765432")).toBe(true)
      expect(validateIBAN("DE89370400440532013000")).toBe(true)
    })

    it("should reject invalid IBAN", () => {
      expect(validateIBAN("GB82")).toBe(false) // Too short
      expect(validateIBAN("gb82WEST12345698765432")).toBe(false) // Lowercase
      expect(validateIBAN("1234567890")).toBe(false) // No country code
    })
  })

  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeInput("<b>Bold</b> text")).toBe("Bold text")
    })

    it("should trim whitespace", () => {
      expect(sanitizeInput("  text  ")).toBe("text")
    })

    it("should handle empty input", () => {
      expect(sanitizeInput("")).toBe("")
      expect(sanitizeInput("   ")).toBe("")
    })
  })

  describe("sanitizeHtml", () => {
    it("should encode HTML entities", () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;")
      expect(sanitizeHtml("Test & <test>")).toBe("Test &amp; &lt;test&gt;")
    })
  })
})
