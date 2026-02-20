import { db } from "@/db"
import { AppleReminders } from "@/db/schema"
import { gte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logRead, logWrite } from "@/lib/activity-log"
import { getDataWindowCutoff, requireReadAuth, requireWriteAuth } from "@/lib/api-auth"
import { SyncSuccessResponse, SyncErrorResponse, formatZodError } from "@/app/api/types"

export async function GET(request: NextRequest) {
  const auth = await requireReadAuth(request, "apple-reminders")
  if (!auth.authorized) {
    return auth.response
  }

  const cutoff = getDataWindowCutoff(auth.token)

  const reminders = await db.query.AppleReminders.findMany({
    where: cutoff ? gte(AppleReminders.updatedAt, cutoff) : undefined,
    orderBy: (r, { desc }) => [desc(r.updatedAt)],
  })

  await logRead({
    type: "apple-reminder",
    description: "Fetched Apple Reminders",
    count: reminders.length,
    token: auth.token,
  })

  return Response.json({
    success: true,
    reminders,
    count: reminders.length,
  })
}

const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string().nullable(),
  listName: z.string().nullable(),
  completed: z.boolean(),
  flagged: z.boolean(),
  priority: z.number(),
  dueDate: z.string().nullable(),
  completionDate: z.string().nullable(),
  creationDate: z.string().nullable(),
  lastModifiedDate: z.string().nullable(),
})

const PostSchema = z.object({
  reminders: z.array(ReminderSchema),
  syncTime: z.string().optional(),
  deviceId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const unauthorized = await requireWriteAuth(request)
  if (unauthorized) {
    return unauthorized
  }

  const json = await request.json()

  const parsed = PostSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json<SyncErrorResponse>(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    )
  }

  const {
    reminders,
    syncTime = new Date().toISOString(),
    deviceId = "unknown",
  } = parsed.data

  if (reminders.length === 0) {
    return NextResponse.json<SyncSuccessResponse>({
      success: true,
      insertedCount: 0,
      updatedCount: 0,
      rejectedCount: 0,
      skippedCount: 0,
    })
  }

  const values = reminders.map((r) => ({
    reminderId: r.id,
    title: r.title,
    notes: r.notes,
    listName: r.listName,
    completed: r.completed,
    flagged: r.flagged,
    priority: r.priority,
    dueDate: r.dueDate ? new Date(r.dueDate) : null,
    completionDate: r.completionDate ? new Date(r.completionDate) : null,
    reminderCreatedAt: r.creationDate ? new Date(r.creationDate) : null,
    reminderModifiedAt: r.lastModifiedDate ? new Date(r.lastModifiedDate) : null,
    deviceId,
    syncTime: new Date(syncTime),
  }))

  let upsertedCount = 0

  const BATCH_SIZE = 50
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE)
    const result = await db
      .insert(AppleReminders)
      .values(batch)
      .onConflictDoUpdate({
        target: AppleReminders.reminderId,
        set: {
          title: sql`excluded.title`,
          notes: sql`excluded.notes`,
          listName: sql`excluded.list_name`,
          completed: sql`excluded.completed`,
          flagged: sql`excluded.flagged`,
          priority: sql`excluded.priority`,
          dueDate: sql`excluded.due_date`,
          completionDate: sql`excluded.completion_date`,
          reminderCreatedAt: sql`excluded.reminder_created_at`,
          reminderModifiedAt: sql`excluded.reminder_modified_at`,
          deviceId: sql`excluded.device_id`,
          syncTime: sql`excluded.sync_time`,
          updatedAt: new Date(),
        },
      })
      .returning()

    upsertedCount += result.length
  }

  if (upsertedCount > 0) {
    await logWrite({
      type: "apple-reminder",
      description: `Synced Apple Reminders from ${deviceId}`,
      count: upsertedCount,
    })
  }

  return NextResponse.json<SyncSuccessResponse>({
    success: true,
    insertedCount: upsertedCount,
    updatedCount: 0,
    rejectedCount: 0,
    skippedCount: 0,
  })
}
