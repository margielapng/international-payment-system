import type { NextResponse } from "next/server"

export function applyHelmetHeaders(response: NextResponse): NextResponse {
  // Strict Transport Security
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  // X-Frame-Options (clickjacking protection)
  response.headers.set("X-Frame-Options", "DENY")

  // X-Content-Type-Options (MIME sniffing protection)
  response.headers.set("X-Content-Type-Options", "nosniff")

  // X-XSS-Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()",
  )

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  )

  // X-DNS-Prefetch-Control
  response.headers.set("X-DNS-Prefetch-Control", "on")

  // Cross-Origin policies
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin")

  return response
}
