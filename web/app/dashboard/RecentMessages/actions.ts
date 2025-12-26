"use server"

import { isAuthenticated } from "@/lib/admin-auth"
import { db } from "@/db"
import { iMessages } from "@/db/schema"
import { desc } from "drizzle-orm"

export type Message = {
  id: string
  text: string | null
  contact: string
  date: Date | null
  isFromMe: boolean
  hasAttachments: boolean
  service: string
}

export async function getRecentMessages(): Promise<Message[]> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized")
  }

  const messages = await db.query.iMessages.findMany({
    orderBy: desc(iMessages.date),
    limit: 10,
    columns: {
      id: true,
      text: true,
      contact: true,
      date: true,
      isFromMe: true,
      hasAttachments: true,
      service: true,
    },
  })

  return messages.map((m) => ({
    id: m.id,
    text: m.text,
    contact: m.contact,
    date: m.date,
    isFromMe: m.isFromMe === 1,
    hasAttachments: m.hasAttachments === 1,
    service: m.service,
  }))
}
