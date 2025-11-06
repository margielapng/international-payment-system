import { PasswordManager } from "../src/utils/password"

const API_URL = "http://localhost:5000/api"

describe("Authentication Tests", () => {
  describe("Password validation", () => {
    it("should validate strong password", () => {
      const password = "TestPassword123!@#"
      const result = PasswordManager.validatePasswordStrength(password)
      expect(result.isValid).toBe(true)
    })

    it("should reject weak password", () => {
      const password = "weak"
      const result = PasswordManager.validatePasswordStrength(password)
      expect(result.isValid).toBe(false)
    })

    it("should reject password without uppercase", () => {
      const password = "testpassword123!@#"
      const result = PasswordManager.validatePasswordStrength(password)
      expect(result.isValid).toBe(false)
    })

    it("should reject password without numbers", () => {
      const password = "TestPassword!@#"
      const result = PasswordManager.validatePasswordStrength(password)
      expect(result.isValid).toBe(false)
    })

    it("should reject password without special chars", () => {
      const password = "TestPassword123"
      const result = PasswordManager.validatePasswordStrength(password)
      expect(result.isValid).toBe(false)
    })
  })

  describe("Password hashing", () => {
    it("should hash password with bcrypt", async () => {
      const password = "TestPassword123!@#"
      const hash = await PasswordManager.hashPassword(password)
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20)
    })

    it("should verify correct password", async () => {
      const password = "TestPassword123!@#"
      const hash = await PasswordManager.hashPassword(password)
      const isValid = await PasswordManager.comparePassword(password, hash)
      expect(isValid).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const password = "TestPassword123!@#"
      const hash = await PasswordManager.hashPassword(password)
      const isValid = await PasswordManager.comparePassword("wrongPassword", hash)
      expect(isValid).toBe(false)
    })
  })
})
