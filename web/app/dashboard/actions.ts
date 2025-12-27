"use server"

import { clearAuthCookie } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function logout(): Promise<void> {
  await clearAuthCookie()
  revalidatePath("/", "layout")
  redirect("/")
}
