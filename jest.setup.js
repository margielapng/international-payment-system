"use client"

import "@testing-library/jest-dom"
import jest from "jest"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    }
  },
  usePathname() {
    return "/"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key-for-testing-only"
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key"
process.env.ENCRYPTION_KEY = "test-encryption-key-32-characters"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
