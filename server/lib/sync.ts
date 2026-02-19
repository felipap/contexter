import { truncateForLog } from "@/lib/logger"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  SyncErrorResponse,
  SyncSuccessResponse,
  formatZodError,
} from "@/app/api/types"

export const MessageSyncPostSchema = z.object({
  messages: z.array(z.unknown()),
  syncTime: z.string(),
  deviceId: z.string(),
  messageCount: z.number(),
})

type RejectedItem = {
  index: number
  item: unknown
  error: string
}

export function validateItems<T>(
  schema: z.ZodType<T>,
  items: unknown[],
  label: string
): { validItems: T[]; rejectedItems: RejectedItem[] } {
  const validItems: T[] = []
  const rejectedItems: RejectedItem[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const result = schema.safeParse(item)

    if (!result.success) {
      const error = formatZodError(result.error)
      rejectedItems.push({ index: i, item, error })
      console.warn(
        `Rejected ${label} at index ${i}:`,
        JSON.stringify({ item: truncateForLog(item), error }, null, 2)
      )
      continue
    }

    validItems.push(result.data)
  }

  return { validItems, rejectedItems }
}

type ParsedSyncBody<T extends z.ZodTypeAny> =
  | { ok: true; data: z.infer<T> }
  | { ok: false; response: NextResponse<SyncErrorResponse> }

export function parseSyncBody<T extends z.ZodTypeAny>(
  json: unknown,
  schema: T
): ParsedSyncBody<T> {
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    console.warn("Invalid request body", { error: parsed.error })
    return {
      ok: false,
      response: NextResponse.json<SyncErrorResponse>(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      ),
    }
  }
  return { ok: true, data: parsed.data }
}

export function emptySyncResponse() {
  return NextResponse.json<SyncSuccessResponse>({
    success: true,
    insertedCount: 0,
    updatedCount: 0,
    rejectedCount: 0,
    skippedCount: 0,
  })
}
