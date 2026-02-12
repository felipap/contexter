import { db } from "@/db"
import { LoginAttempts } from "@/db/schema"
import { and, count, eq, gt, lt } from "drizzle-orm"

const MAX_ATTEMPTS = 10
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS)

  const [result] = await db
    .select({ count: count() })
    .from(LoginAttempts)
    .where(
      and(eq(LoginAttempts.ip, ip), gt(LoginAttempts.attemptedAt, windowStart))
    )

  console.log("ip", ip)
  console.log("result", result)

  if (result.count >= MAX_ATTEMPTS) {
    // Find the oldest attempt in the window to calculate when it expires
    const oldestInWindow = await db.query.LoginAttempts.findFirst({
      where: and(
        eq(LoginAttempts.ip, ip),
        gt(LoginAttempts.attemptedAt, windowStart)
      ),
      orderBy: (t, { asc }) => [asc(t.attemptedAt)],
    })

    if (oldestInWindow) {
      const expiresAt = oldestInWindow.attemptedAt.getTime() + WINDOW_MS
      const retryAfterSeconds = Math.ceil((expiresAt - Date.now()) / 1000)
      return {
        allowed: false,
        retryAfterSeconds: Math.max(retryAfterSeconds, 1),
      }
    }

    return { allowed: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) }
  }

  return { allowed: true }
}

export async function recordFailedAttempt(ip: string) {
  await db.insert(LoginAttempts).values({ ip })
}

export async function clearAttempts(ip: string) {
  await db.delete(LoginAttempts).where(eq(LoginAttempts.ip, ip))
}

export async function cleanupOldAttempts() {
  const cutoff = new Date(Date.now() - WINDOW_MS)
  await db.delete(LoginAttempts).where(lt(LoginAttempts.attemptedAt, cutoff))
}
