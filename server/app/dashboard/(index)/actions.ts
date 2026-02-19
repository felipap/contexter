"use server"

import { db } from "@/db"
import {
  DEFAULT_USER_ID,
  iMessages,
  Locations,
  MacosStickies,
  Screenshots,
} from "@/db/schema"
import { isAuthenticated } from "@/lib/admin-auth"
import { eq, sql } from "drizzle-orm"
import { unauthorized } from "next/navigation"

export type DashboardStats = {
  totalScreenshots: number
  totalStorageBytes: number
  totalMessages: number
  totalChats: number
  totalContacts: number
  totalLocations: number
  totalStickies: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!(await isAuthenticated())) {
    unauthorized()
  }

  const [screenshotStats] = await db
    .select({
      count: sql<number>`count(*)`,
      totalBytes: sql<number>`coalesce(sum(${Screenshots.sizeBytes}), 0)`,
    })
    .from(Screenshots)

  const [messageStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(iMessages)
    .where(eq(iMessages.userId, DEFAULT_USER_ID))

  const chatStats = await db.all<{ count: number }>(sql`
    SELECT COUNT(DISTINCT COALESCE(chat_id, contact_index)) as count
    FROM imessages
    WHERE user_id = ${DEFAULT_USER_ID}
  `)

  const contactStats = await db.all<{ count: number }>(sql`
    SELECT COUNT(DISTINCT contact_index) as count
    FROM imessages
    WHERE user_id = ${DEFAULT_USER_ID}
  `)

  const [locationStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(Locations)

  const [stickiesStats] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(MacosStickies)

  return {
    totalScreenshots: screenshotStats.count,
    totalStorageBytes: screenshotStats.totalBytes,
    totalMessages: messageStats.count,
    totalChats: chatStats[0]?.count ?? 0,
    totalContacts: contactStats[0]?.count ?? 0,
    totalLocations: locationStats.count,
    totalStickies: stickiesStats.count,
  }
}
