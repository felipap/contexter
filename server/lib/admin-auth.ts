import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "context_admin"

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

const DASHBOARD_SECRET = process.env.DASHBOARD_SECRET || ""
if (!DASHBOARD_SECRET) {
  throw new Error("DASHBOARD_SECRET is not set")
}

// Generate a signature of the secret to store in cookie instead of raw secret.
// If the cookie leaks, attacker gets a hash, not the actual passphrase.
function generateAuthToken(secret: string): string {
  return createHmac("sha256", secret).update("context_admin_auth").digest("hex")
}

const EXPECTED_TOKEN = generateAuthToken(DASHBOARD_SECRET)

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) {
    return false
  }
  return secureCompare(token, EXPECTED_TOKEN)
}

export async function setAuthCookie(secret: string): Promise<boolean> {
  const expected = process.env.DASHBOARD_SECRET
  if (!expected || !secureCompare(secret, expected)) {
    return false
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, generateAuthToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })
  return true
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: COOKIE_NAME,
    path: "/",
  })
}
