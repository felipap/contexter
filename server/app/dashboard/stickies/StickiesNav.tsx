"use client"

import { useRouter } from "next/navigation"
import { NavTabs } from "@/ui/NavTabs"
import { PageHeader } from "@/ui/PageHeader"
import { deleteAllStickies } from "./actions"

const subTabs = [
  { href: "/dashboard/stickies", label: "macOS Stickies" },
  { href: "/dashboard/stickies/windows", label: "Windows Stickies" },
] as const

export function StickiesNav() {
  const router = useRouter()

  async function handleDeleteAll() {
    await deleteAllStickies()
    router.refresh()
  }

  return (
    <>
      <PageHeader
        title="Stickies"
        onDeleteAll={handleDeleteAll}
        deleteConfirmMessage="Delete all stickies? This will permanently delete all macOS and Windows sticky notes from the database."
      />

      <NavTabs tabs={subTabs} rootHref="/dashboard/stickies" />
    </>
  )
}
