import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { devices } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  const deviceId = request.headers.get("x-device-id")

  if (!deviceId) {
    return NextResponse.json({ error: "Missing device ID" }, { status: 400 })
  }

  const existing = await db.query.devices.findFirst({
    where: eq(devices.deviceId, deviceId),
  })

  if (existing) {
    await db
      .update(devices)
      .set({ lastSeenAt: new Date() })
      .where(eq(devices.deviceId, deviceId))

    return NextResponse.json({
      registered: true,
      approved: existing.approved,
      deviceId: existing.deviceId,
    })
  }

  const [device] = await db
    .insert(devices)
    .values({
      deviceId,
      name: request.headers.get("x-device-name") || "Unknown Device",
      approved: false,
      lastSeenAt: new Date(),
    })
    .returning()

  return NextResponse.json({
    registered: true,
    approved: device.approved,
    deviceId: device.deviceId,
  })
}
