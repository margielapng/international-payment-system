import { securityHeaders } from "@/lib/security/headers"

describe("Security Headers", () => {
  it("should include Content-Security-Policy", () => {
    expect(securityHeaders["Content-Security-Policy"]).toBeDefined()
    expect(securityHeaders["Content-Security-Policy"]).toContain("default-src 'self'")
  })

  it("should include X-Frame-Options", () => {
    expect(securityHeaders["X-Frame-Options"]).toBe("DENY")
  })

  it("should include X-Content-Type-Options", () => {
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff")
  })

  it("should include Strict-Transport-Security", () => {
    expect(securityHeaders["Strict-Transport-Security"]).toContain("max-age=31536000")
    expect(securityHeaders["Strict-Transport-Security"]).toContain("includeSubDomains")
  })

  it("should include X-XSS-Protection", () => {
    expect(securityHeaders["X-XSS-Protection"]).toBe("1; mode=block")
  })

  it("should include Referrer-Policy", () => {
    expect(securityHeaders["Referrer-Policy"]).toBe("strict-origin-when-cross-origin")
  })

  it("should include Permissions-Policy", () => {
    expect(securityHeaders["Permissions-Policy"]).toContain("geolocation=()")
    expect(securityHeaders["Permissions-Policy"]).toContain("microphone=()")
    expect(securityHeaders["Permissions-Policy"]).toContain("camera=()")
  })
})
