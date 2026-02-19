import { defineConfig } from "drizzle-kit"

const DATABASE_URL = process.env.DATABASE_URL || ""
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const isLocal = DATABASE_URL.startsWith("file:")

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect: isLocal ? "sqlite" : "turso",
  dbCredentials: isLocal
    ? { url: DATABASE_URL }
    : { url: DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN ?? "" },
})
