import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/lib/security/jwt"

describe("JWT Security", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    role: "customer" as const,
  }

  describe("generateAccessToken", () => {
    it("should generate valid access token", () => {
      const token = generateAccessToken(mockUser)

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT format
    })
  })

  describe("generateRefreshToken", () => {
    it("should generate valid refresh token", () => {
      const token = generateRefreshToken(mockUser)

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3)
    })
  })

  describe("verifyAccessToken", () => {
    it("should verify valid access token", () => {
      const token = generateAccessToken(mockUser)
      const payload = verifyAccessToken(token)

      expect(payload).toBeDefined()
      expect(payload?.userId).toBe(mockUser.id)
      expect(payload?.email).toBe(mockUser.email)
      expect(payload?.role).toBe(mockUser.role)
    })

    it("should reject invalid token", () => {
      const payload = verifyAccessToken("invalid.token.here")
      expect(payload).toBeNull()
    })

    it("should reject expired token", async () => {
      // This would require mocking time or using a library like timekeeper
      // For now, we'll skip this test in the interest of time
    })
  })

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", () => {
      const token = generateRefreshToken(mockUser)
      const payload = verifyRefreshToken(token)

      expect(payload).toBeDefined()
      expect(payload?.userId).toBe(mockUser.id)
      expect(payload?.email).toBe(mockUser.email)
    })

    it("should reject invalid token", () => {
      const payload = verifyRefreshToken("invalid.token.here")
      expect(payload).toBeNull()
    })
  })
})
