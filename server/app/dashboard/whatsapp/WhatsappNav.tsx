"use client"

import { useRouter } from "next/navigation"
import { NavTabs } from "@/ui/NavTabs"
import { PageHeader } from "@/ui/PageHeader"
import { deleteAllWhatsappMessages } from "./(messages)/actions"

const subTabs = [
  { href: "/dashboard/whatsapp", label: "Messages" },
  { href: "/dashboard/whatsapp/chats", label: "Chats" },
] as const

export function WhatsappNav() {
  const router = useRouter()

  async function handleDeleteAll() {
    await deleteAllWhatsappMessages()
    router.refresh()
  }

  return (
    <>
      <PageHeader
        title="WhatsApp"
        onDeleteAll={handleDeleteAll}
        deleteConfirmMessage="Delete all WhatsApp data? This will permanently delete all WhatsApp messages from the database."
      />

      <NavTabs tabs={subTabs} rootHref="/dashboard/whatsapp" />
    </>
  )
}
