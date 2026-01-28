import { NextResponse } from "next/server"
import { lt } from "drizzle-orm"
import { db } from "@/db"
import { Screenshots } from "@/db/schema"
import { timingSafeEqual } from "crypto"

const CRON_SECRET = process.env.CRON_SECRET
if (!CRON_SECRET) {
  throw new Error("CRON_SECRET environment variable is not set")
}

export const SCREENSHOT_RETENTION_HOURS = parseInt(
  process.env.SCREENSHOT_RETENTION_HOURS || "1",
  10
)

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expectedHeader = `Bearer ${CRON_SECRET}`
  if (!authHeader || !secureCompare(authHeader, expectedHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cutoffTime = new Date(
    Date.now() - SCREENSHOT_RETENTION_HOURS * 60 * 60 * 1000
  )

  const result = await db
    .delete(Screenshots)
    .where(lt(Screenshots.capturedAt, cutoffTime))
    .returning({ id: Screenshots.id })

  return NextResponse.json({
    success: true,
    deletedCount: result.length,
    retentionHours: SCREENSHOT_RETENTION_HOURS,
    cutoffTime: cutoffTime.toISOString(),
  })
}
