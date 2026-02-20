import { db } from "@/db"
import {
  AppleContacts,
  AppleReminders,
  iMessageAttachments,
  iMessages,
  Locations,
  MacosStickies,
  ReadLogs,
  Screenshots,
  WhatsappMessages,
  WriteLogs,
} from "@/db/schema"
import { lt } from "drizzle-orm"
import { NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import { verifyCronAuth } from "../auth"

const logger = createLogger("cleanup")

function hoursFromEnv(key: string, fallback: number): number {
  const raw = process.env[key]
  if (!raw) {
    return fallback
  }
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) ? fallback : parsed
}

export const SCREENSHOT_RETENTION_HOURS = hoursFromEnv(
  "SCREENSHOT_RETENTION_HOURS",
  1
)
export const IMESSAGE_RETENTION_HOURS = hoursFromEnv(
  "IMESSAGE_RETENTION_HOURS",
  0
)
export const WHATSAPP_RETENTION_HOURS = hoursFromEnv(
  "WHATSAPP_RETENTION_HOURS",
  0
)
export const CONTACT_RETENTION_HOURS = hoursFromEnv(
  "CONTACT_RETENTION_HOURS",
  0
)
export const LOCATION_RETENTION_HOURS = hoursFromEnv(
  "LOCATION_RETENTION_HOURS",
  0
)
export const STICKIES_RETENTION_HOURS = hoursFromEnv(
  "STICKIES_RETENTION_HOURS",
  0
)
export const REMINDERS_RETENTION_HOURS = hoursFromEnv(
  "REMINDERS_RETENTION_HOURS",
  0
)
export const LOG_RETENTION_HOURS = hoursFromEnv("LOG_RETENTION_HOURS", 0)

function cutoffFromHours(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000)
}

type CleanupResult = {
  deletedCount: number
  retentionHours: number
  cutoffTime: string
}

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) {
    logger.warn("Auth error")
    return authError
  }

  logger.log("Starting cleanup cron")

  const results: Record<string, CleanupResult | "disabled"> = {}

  if (SCREENSHOT_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(SCREENSHOT_RETENTION_HOURS)
    const deleted = await db
      .delete(Screenshots)
      .where(lt(Screenshots.capturedAt, cutoff))
      .returning({ id: Screenshots.id })
    results.screenshots = {
      deletedCount: deleted.length,
      retentionHours: SCREENSHOT_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `screenshots: deleted ${deleted.length} (retention: ${SCREENSHOT_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.screenshots = "disabled"
    logger.log("screenshots: disabled")
  }

  if (IMESSAGE_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(IMESSAGE_RETENTION_HOURS)
    const deletedMessages = await db
      .delete(iMessages)
      .where(lt(iMessages.createdAt, cutoff))
      .returning({ id: iMessages.id })
    const deletedAttachments = await db
      .delete(iMessageAttachments)
      .where(lt(iMessageAttachments.createdAt, cutoff))
      .returning({ id: iMessageAttachments.id })
    results.imessages = {
      deletedCount: deletedMessages.length + deletedAttachments.length,
      retentionHours: IMESSAGE_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `imessages: deleted ${deletedMessages.length} messages + ${deletedAttachments.length} attachments (retention: ${IMESSAGE_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.imessages = "disabled"
    logger.log("imessages: disabled")
  }

  if (WHATSAPP_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(WHATSAPP_RETENTION_HOURS)
    const deleted = await db
      .delete(WhatsappMessages)
      .where(lt(WhatsappMessages.createdAt, cutoff))
      .returning({ id: WhatsappMessages.id })
    results.whatsapp = {
      deletedCount: deleted.length,
      retentionHours: WHATSAPP_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `whatsapp: deleted ${deleted.length} (retention: ${WHATSAPP_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.whatsapp = "disabled"
    logger.log("whatsapp: disabled")
  }

  if (CONTACT_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(CONTACT_RETENTION_HOURS)
    const deleted = await db
      .delete(AppleContacts)
      .where(lt(AppleContacts.createdAt, cutoff))
      .returning({ id: AppleContacts.id })
    results.contacts = {
      deletedCount: deleted.length,
      retentionHours: CONTACT_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `contacts: deleted ${deleted.length} (retention: ${CONTACT_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.contacts = "disabled"
    logger.log("contacts: disabled")
  }

  if (LOCATION_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(LOCATION_RETENTION_HOURS)
    const deleted = await db
      .delete(Locations)
      .where(lt(Locations.timestamp, cutoff))
      .returning({ id: Locations.id })
    results.locations = {
      deletedCount: deleted.length,
      retentionHours: LOCATION_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `locations: deleted ${deleted.length} (retention: ${LOCATION_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.locations = "disabled"
    logger.log("locations: disabled")
  }

  if (STICKIES_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(STICKIES_RETENTION_HOURS)
    const deleted = await db
      .delete(MacosStickies)
      .where(lt(MacosStickies.createdAt, cutoff))
      .returning({ id: MacosStickies.id })
    results.stickies = {
      deletedCount: deleted.length,
      retentionHours: STICKIES_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `stickies: deleted ${deleted.length} (retention: ${STICKIES_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.stickies = "disabled"
    logger.log("stickies: disabled")
  }

  if (REMINDERS_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(REMINDERS_RETENTION_HOURS)
    const deleted = await db
      .delete(AppleReminders)
      .where(lt(AppleReminders.createdAt, cutoff))
      .returning({ id: AppleReminders.id })
    results.reminders = {
      deletedCount: deleted.length,
      retentionHours: REMINDERS_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `reminders: deleted ${deleted.length} (retention: ${REMINDERS_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.reminders = "disabled"
    logger.log("reminders: disabled")
  }

  if (LOG_RETENTION_HOURS > 0) {
    const cutoff = cutoffFromHours(LOG_RETENTION_HOURS)
    const deletedWriteLogs = await db
      .delete(WriteLogs)
      .where(lt(WriteLogs.createdAt, cutoff))
      .returning({ id: WriteLogs.id })
    const deletedReadLogs = await db
      .delete(ReadLogs)
      .where(lt(ReadLogs.createdAt, cutoff))
      .returning({ id: ReadLogs.id })
    results.logs = {
      deletedCount: deletedWriteLogs.length + deletedReadLogs.length,
      retentionHours: LOG_RETENTION_HOURS,
      cutoffTime: cutoff.toISOString(),
    }
    logger.log(
      `logs: deleted ${deletedWriteLogs.length} write + ${deletedReadLogs.length} read (retention: ${LOG_RETENTION_HOURS}h, cutoff: ${cutoff.toISOString()})`
    )
  } else {
    results.logs = "disabled"
    logger.log("logs: disabled")
  }

  const totalDeleted = Object.values(results).reduce(
    (sum, r) => sum + (r === "disabled" ? 0 : r.deletedCount),
    0
  )
  logger.log(`Done. Total deleted: ${totalDeleted}`)

  return NextResponse.json({ success: true, results })
}
