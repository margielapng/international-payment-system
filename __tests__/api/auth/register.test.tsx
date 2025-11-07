import { POST } from "@/app/api/auth/register/route"
import { NextRequest } from "next/server"

describe("POST /api/auth/register", () => {
  it("should register user with valid data", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "SecurePass123!@#",
        fullName: "John Doe",
        phone: "+1234567890",
        address: "123 Main St, City, Country",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toContain("Registration successful")
  })

  it("should reject registration with weak password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "weak",
        fullName: "John Doe",
        phone: "+1234567890",
        address: "123 Main St",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it("should reject registration with invalid email", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "SecurePass123!@#",
        fullName: "John Doe",
        phone: "+1234567890",
        address: "123 Main St",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("Invalid email")
  })

  it("should reject registration with SQL injection attempt", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "admin'--@example.com",
        password: "SecurePass123!@#",
        fullName: "'; DROP TABLE users; --",
        phone: "+1234567890",
        address: "123 Main St",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it("should reject registration with XSS attempt", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!@#",
        fullName: '<script>alert("xss")</script>',
        phone: "+1234567890",
        address: "123 Main St",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("Invalid name")
  })
})
