"use server"

import { isAuthenticated } from "@/lib/admin-auth"
import { db } from "@/db"
import { AppleReminders } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { unauthorized } from "next/navigation"

export type ReminderItem = {
  id: string
  reminderId: string
  title: string
  notes: string | null
  listName: string | null
  completed: boolean
  flagged: boolean
  priority: number
  dueDate: Date | null
  completionDate: Date | null
  reminderCreatedAt: Date | null
  reminderModifiedAt: Date | null
  updatedAt: Date
}

export type RemindersPage = {
  reminders: ReminderItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getReminders(
  page: number = 1,
  pageSize: number = 30,
  filter: "all" | "incomplete" | "completed" = "all"
): Promise<RemindersPage> {
  if (!(await isAuthenticated())) {
    unauthorized()
  }

  const offset = (page - 1) * pageSize

  const whereClause =
    filter === "completed"
      ? eq(AppleReminders.completed, true)
      : filter === "incomplete"
        ? eq(AppleReminders.completed, false)
        : undefined

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(AppleReminders)
    .where(whereClause)

  const total = countResult.count

  const results = await db.query.AppleReminders.findMany({
    where: whereClause,
    orderBy: desc(AppleReminders.updatedAt),
    limit: pageSize,
    offset,
  })

  const reminders: ReminderItem[] = results.map((row) => ({
    id: row.id,
    reminderId: row.reminderId,
    title: row.title,
    notes: row.notes,
    listName: row.listName,
    completed: row.completed,
    flagged: row.flagged,
    priority: row.priority,
    dueDate: row.dueDate,
    completionDate: row.completionDate,
    reminderCreatedAt: row.reminderCreatedAt,
    reminderModifiedAt: row.reminderModifiedAt,
    updatedAt: row.updatedAt,
  }))

  return {
    reminders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
