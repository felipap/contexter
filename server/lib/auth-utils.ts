// Environment variables for IP whitelists (comma-separated)
import { timingSafeEqual } from "crypto"
import type { NextRequest } from "next/server"

type Whitelist = string[]

export function parseWhitelist(envVar: string | undefined): Whitelist | null {
  if (!envVar || envVar.trim() === "") {
    throw new Error("!envVar")
  }
  return envVar
    .split(",")
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0)
}

export function isDashboardIpWhitelistEnabled(): boolean {
  const whitelist = process.env.DASHBOARD_IP_WHITELIST
  return Boolean(whitelist && whitelist.trim() !== "")
}

export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

const TRUSTED_PROXY = process.env.TRUSTED_PROXY === "true" || process.env.TRUSTED_PROXY === "1"

export function getClientIp(request: NextRequest): string | null {
  // @ts-expect-error - request.ip exists on Vercel but not in types
  const ip = request.ip
  if (ip) {
    return ip
  }

  // Forwarded headers are trivially spoofable by clients. Only trust them when
  // behind a reverse proxy that overwrites these headers (nginx, Caddy,
  // Cloudflare, etc). On Vercel, request.ip above is used instead.
  if (!TRUSTED_PROXY) {
    return null
  }

  const forwardedFor = request.headers.get("x-vercel-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  const remoteAddr = request.headers.get("remote-addr")
  if (remoteAddr) {
    return remoteAddr.trim()
  }

  return null
}

export function isIpAllowed(
  ip: string | null,
  whitelist: string[] | null
): boolean {
  // No whitelist configured = allow all
  if (whitelist === null) {
    return true
  }

  // Whitelist configured but no IP detected = deny
  if (ip === null) {
    return false
  }

  // Check if IP is in whitelist
  return whitelist.includes(ip)
}
