import { NextRequest } from "next/server"

export function validateDeviceAuth(request: NextRequest): boolean {
  const expected = process.env.DEVICE_SECRET
  if (!expected) {
    return true
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.slice(7)
  return token === expected
}

