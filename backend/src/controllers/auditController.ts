import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import { AuditLog } from "../models/AuditLog"

export class AuditController {
  /**
   * Get audit logs (admin/employee only)
   */
  static async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin" && req.role !== "employee") {
        res.status(403).json({ error: "Access denied" })
        return
      }

      const { page = 1, limit = 50, userId, action, status, startDate, endDate } = req.query

      const query: Record<string, any> = {}

      if (userId) {
        query.userId = userId
      }

      if (action) {
        query.action = action
      }

      if (status) {
        query.status = status
      }

      if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) {
          query.timestamp.$gte = new Date(String(startDate))
        }
        if (endDate) {
          query.timestamp.$lte = new Date(String(endDate))
        }
      }

      const logs = await AuditLog.find(query)
        .populate("userId", "username role")
        .sort({ timestamp: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .lean()

      const total = await AuditLog.countDocuments(query)

      // Log the audit log access
      await AuditLog.create({
        userId: req.userId,
        action: "AUDIT_LOG_VIEWED",
        resource: "audit-logs",
        status: "success",
        details: { filters: Object.keys(query).length },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        timestamp: new Date(),
      })

      res.json({
        logs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error("Get audit logs error:", error)
      res.status(500).json({ error: "Failed to fetch audit logs" })
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin" && req.role !== "employee") {
        res.status(403).json({ error: "Access denied" })
        return
      }

      const { userId, days = 30 } = req.query

      if (!userId) {
        res.status(400).json({ error: "User ID required" })
        return
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number(days))

      const activity = await AuditLog.aggregate([
        {
          $match: {
            userId: new (require("mongoose").Types.ObjectId)(String(userId)),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
            lastOccurrence: { $max: "$timestamp" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])

      const totalActions = activity.reduce((sum: number, item: any) => sum + item.count, 0)

      res.json({
        userId,
        daysAnalyzed: Number(days),
        totalActions,
        activityBreakdown: activity,
      })
    } catch (error) {
      console.error("Get user activity error:", error)
      res.status(500).json({ error: "Failed to fetch user activity" })
    }
  }

  /**
   * Get system activity summary
   */
  static async getSystemActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can view system activity" })
        return
      }

      const { days = 7 } = req.query

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number(days))

      const activity = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              action: "$action",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])

      const users = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$userId",
            actionCount: { $sum: 1 },
          },
        },
        {
          $sort: { actionCount: -1 },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
      ])

      res.json({
        daysAnalyzed: Number(days),
        totalActions: await AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
        activityBreakdown: activity,
        topUsers: users,
      })
    } catch (error) {
      console.error("Get system activity error:", error)
      res.status(500).json({ error: "Failed to fetch system activity" })
    }
  }

  /**
   * Export audit logs (admin only)
   */
  static async exportAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.role !== "admin") {
        res.status(403).json({ error: "Only admins can export logs" })
        return
      }

      const { startDate, endDate, format = "json" } = req.query

      const query: Record<string, any> = {}

      if (startDate || endDate) {
        query.timestamp = {}
        if (startDate) {
          query.timestamp.$gte = new Date(String(startDate))
        }
        if (endDate) {
          query.timestamp.$lte = new Date(String(endDate))
        }
      }

      const logs = await AuditLog.find(query).populate("userId", "username role").lean()

      if (format === "csv") {
        // CSV export
        const csv = this.logsToCSV(logs)
        res.set("Content-Type", "text/csv")
        res.set("Content-Disposition", 'attachment; filename="audit-logs.csv"')
        res.send(csv)
      } else {
        // JSON export
        res.set("Content-Type", "application/json")
        res.set("Content-Disposition", 'attachment; filename="audit-logs.json"')
        res.json(logs)
      }

      // Log the export
      await AuditLog.create({
        userId: req.userId,
        action: "AUDIT_LOG_VIEWED",
        resource: "audit-logs/export",
        status: "success",
        details: { format, logCount: logs.length },
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Export audit logs error:", error)
      res.status(500).json({ error: "Failed to export audit logs" })
    }
  }

  /**
   * Helper: Convert logs to CSV
   */
  private static logsToCSV(logs: any[]): string {
    const headers = ["Timestamp", "User", "Action", "Resource", "Status", "IP Address", "Details"]
    const rows = logs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.userId?.username || "Unknown",
      log.action,
      log.resource,
      log.status,
      log.ipAddress || "N/A",
      JSON.stringify(log.details || {}),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    return csvContent
  }
}
