import type { Request, Response, NextFunction } from "express"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import mongoSanitize from "mongo-sanitize"
import hpp from "hpp"

// CORS configuration
export const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

// Helmet middleware for HTTP headers security
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:3000"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: "deny", // Prevent clickjacking
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  xssFilter: true,
  noSniff: true,
})

// Rate limiting middleware
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: false,
  keyGenerator: (req, res) => {
    // Use username + IP as the key to limit per user + IP combination
    return `${req.body?.username || "unknown"}-${req.ip}`
  },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 requests per 15 minutes
  message: "Too many authentication requests, please try again later",
})

// Data sanitization middleware
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // cast to any to avoid strict typing complaints about unknown body/query/params shapes
  req.body   = mongoSanitize(req.body as any);
  req.query  = mongoSanitize(req.query as any);
  req.params = mongoSanitize(req.params as any);

  next();
}

// HPP (HTTP Parameter Pollution) middleware
export const hppMiddleware = hpp({
  whitelist: ["sort", "fields", "limit", "page"],
})

// Custom middleware for HTTPS enforcement
export const httpsRedirectMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === "production" && req.header("x-forwarded-proto") !== "https") {
    res.redirect(301, `https://${req.header("host")}${req.url}`)
  } else {
    next()
  }
}

// Input length validation middleware
export const inputLengthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const maxLength = 1000

  const checkLength = (obj: any): boolean => {
    if (typeof obj === "string" && obj.length > maxLength) {
      return false
    }
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (!checkLength(obj[key])) return false
      }
    }
    return true
  }

  if (!checkLength(req.body)) {
    res.status(400).json({ error: "Input exceeds maximum allowed length" })
    return
  }

  next()
}
