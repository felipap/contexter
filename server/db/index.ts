import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN || ""

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
