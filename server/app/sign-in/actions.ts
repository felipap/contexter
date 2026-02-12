"use server"

import { setAuthCookie } from "@/lib/admin-auth"
import {
  checkRateLimit,
  clearAttempts,
  recordFailedAttempt,
} from "@/lib/rate-limit"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function login(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(ip)

  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)
    return {
      error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    }
  }

  const passphrase = formData.get("passphrase") as string

  if (!passphrase) {
    return { error: "Passphrase required" }
  }

  const success = await setAuthCookie(passphrase)
  if (!success) {
    await recordFailedAttempt(ip)
    return { error: "Invalid passphrase" }
  }

  await clearAttempts(ip)
  redirect("/dashboard")
}

async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  )
}
