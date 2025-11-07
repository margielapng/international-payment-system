import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/security/password"

describe("Password Security", () => {
  describe("hashPassword", () => {
    it("should hash password with bcrypt", async () => {
      const password = "SecurePass123!@#"
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    it("should generate different hashes for same password", async () => {
      const password = "SecurePass123!@#"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "SecurePass123!@#"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const password = "SecurePass123!@#"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword("WrongPassword123!", hash)

      expect(isValid).toBe(false)
    })
  })

  describe("validatePasswordStrength", () => {
    it("should accept strong password", () => {
      const result = validatePasswordStrength("SecurePass123!@#")
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject short password", () => {
      const result = validatePasswordStrength("Short1!")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must be at least 12 characters long")
    })

    it("should reject password without uppercase", () => {
      const result = validatePasswordStrength("securepass123!@#")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one uppercase letter")
    })

    it("should reject password without lowercase", () => {
      const result = validatePasswordStrength("SECUREPASS123!@#")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one lowercase letter")
    })

    it("should reject password without number", () => {
      const result = validatePasswordStrength("SecurePassword!@#")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one number")
    })

    it("should reject password without special character", () => {
      const result = validatePasswordStrength("SecurePassword123")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must contain at least one special character")
    })
  })
})
