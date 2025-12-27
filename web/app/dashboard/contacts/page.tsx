"use client"

import { useEffect, useState } from "react"
import { getContacts, type Contact } from "./actions"
import { Pagination } from "@/ui/Pagination"

export default function Page() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getContacts(page)
      setContacts(data.contacts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setLoading(false)
    }
    load()
  }, [page])

  let inner
  if (loading) {
    inner = <p className="text-zinc-500">Loading...</p>
  } else if (contacts.length === 0) {
    inner = <p className="text-zinc-500">No contacts yet.</p>
  } else {
    inner = (
      <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <span className="text-sm text-zinc-500">
          {total.toLocaleString()} total
        </span>
      </div>

      {inner}
    </div>
  )
}

function ContactCard({ contact }: { contact: Contact }) {
  const displayName = getDisplayName(contact)
  const initial = getInitial(displayName)
  const bgColor = getAvatarColor(contact.id)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${bgColor}`}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        {contact.organization && (
          <p className="truncate text-xs text-zinc-500">
            {contact.organization}
          </p>
        )}
        {contact.phoneNumbers.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {contact.phoneNumbers.slice(0, 2).map((phone, i) => (
              <span
                key={i}
                className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {formatPhone(phone)}
              </span>
            ))}
            {contact.phoneNumbers.length > 2 && (
              <span className="text-xs text-zinc-400">
                +{contact.phoneNumbers.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getDisplayName(contact: Contact): string {
  if (contact.firstName || contact.lastName) {
    return [contact.firstName, contact.lastName].filter(Boolean).join(" ")
  }
  if (contact.organization) {
    return contact.organization
  }
  if (contact.emails && contact.emails.length > 0) {
    return contact.emails[0]
  }
  if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
    return contact.phoneNumbers[0]
  }
  return "Unknown"
}

function getInitial(name: string): string {
  if (name.includes("@")) {
    return name.charAt(0).toUpperCase()
  }
  if (name.startsWith("+") || /^\d/.test(name)) {
    return "#"
  }
  return name.charAt(0).toUpperCase()
}

function formatPhone(phone: string): string {
  if (phone.startsWith("+1") && phone.length === 12) {
    return `(${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`
  }
  return phone
}

const avatarColors = [
  "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}
