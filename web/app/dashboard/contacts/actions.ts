"use server"

import { isAuthenticated } from "@/lib/admin-auth"
import { db } from "@/db"
import { Contacts } from "@/db/schema"
import { desc, sql } from "drizzle-orm"
import { unauthorized } from "next/navigation"

export type Contact = {
  id: string
  contactId: string
  firstName: string | null
  lastName: string | null
  organization: string | null
  emails: string[]
  phoneNumbers: string[]
}

export type ContactsPage = {
  contacts: Contact[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getContacts(
  page: number = 1,
  pageSize: number = 20
): Promise<ContactsPage> {
  if (!(await isAuthenticated())) {
    unauthorized()
  }

  const offset = (page - 1) * pageSize

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(Contacts)

  const total = countResult.count

  const results = await db.query.Contacts.findMany({
    orderBy: desc(Contacts.updatedAt),
    limit: pageSize,
    offset,
  })

  const contacts = results.map((row) => {
    let emails: string[] = []
    let phoneNumbers: string[] = []

    try {
      emails = JSON.parse(row.emails)
    } catch {}

    try {
      phoneNumbers = JSON.parse(row.phoneNumbers)
    } catch {}

    return {
      id: row.id,
      contactId: row.contactId,
      firstName: row.firstName,
      lastName: row.lastName,
      organization: row.organization,
      emails,
      phoneNumbers,
    }
  })

  return {
    contacts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
