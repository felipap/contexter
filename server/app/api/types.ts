import { z } from "zod"

export type SyncSuccessResponse = {
  success: true
  insertedCount: number
  updatedCount: number
  rejectedCount: number
  skippedCount: number
}

export type SyncErrorResponse = {
  error: string
}

export type SyncResponse = SyncSuccessResponse | SyncErrorResponse

export function formatZodError(error: z.ZodError, maxIssues = 5): string {
  const issues = error.issues.slice(0, maxIssues)
  const formatted = issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : ""
      return `${path}${issue.message}`
    })
    .join("; ")
  const remaining = error.issues.length - issues.length
  if (remaining > 0) {
    return `${formatted} (and ${remaining} more)`
  }
  return formatted
}

export function summarizeZodError(error: z.ZodError): string {
  const total = error.issues.length
  const first = error.issues[0]
  const path = first.path.length > 0 ? `${first.path.join(".")}: ` : ""
  const suffix = total > 1 ? ` (and ${total - 1} more)` : ""
  return `${path}${first.message}${suffix}`
}
