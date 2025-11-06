import type { Request, Response, NextFunction } from "express"
import { JWTManager } from "../utils/jwt"

export interface AuthRequest extends Request {
  userId?: string
  username?: string
  role?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" })
    return
  }

  const token = authHeader.substring(7)
  const payload = JWTManager.verifyAccessToken(token)

  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" })
    return
  }

  req.userId = payload.userId
  req.username = payload.username
  req.role = payload.role

  next()
}

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ error: "Insufficient permissions" })
      return
    }
    next()
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    const payload = JWTManager.verifyAccessToken(token)

    if (payload) {
      req.userId = payload.userId
      req.username = payload.username
      req.role = payload.role
    }
  }

  next()
}
