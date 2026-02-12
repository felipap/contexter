import { z } from "zod"

export type SyncSuccessResponse = {
  success: true
  syncedAt: string
  insertedCount: number
  updatedCount: number
  rejectedCount: number
  skippedCount: number
}

export type SyncErrorResponse = {
  error: string
}

export type SyncResponse = SyncSuccessResponse | SyncErrorResponse

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : ""
      return `${path}${issue.message}`
    })
    .join("; ")
}
