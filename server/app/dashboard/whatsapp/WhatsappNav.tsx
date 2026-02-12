"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { DeleteAllButton } from "@/ui/DeleteAllButton"
import { deleteAllWhatsappMessages } from "./(messages)/actions"

const subTabs = [
  { href: "/dashboard/whatsapp", label: "Messages" },
  { href: "/dashboard/whatsapp/chats", label: "Chats" },
] as const

export function WhatsappNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleDeleteAll() {
    await deleteAllWhatsappMessages()
    router.refresh()
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">WhatsApp</h1>
        <DeleteAllButton
          confirmMessage="Delete all WhatsApp data? This will permanently delete all WhatsApp messages from the database."
          onDelete={handleDeleteAll}
        />
      </div>

      <div className="mb-6 flex gap-2">
        {subTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard/whatsapp"
              ? pathname === "/dashboard/whatsapp"
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={twMerge(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
