"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { ActivityLogs } from "./ActivityLogs"
import { Contacts } from "./Contacts"
import { RecentChats } from "./RecentChats"
import { RecentMessages } from "./RecentMessages"
import { RecentScreenshots } from "./RecentScreenshots"
import { getDashboardStats, type DashboardStats } from "./actions"

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes"
  }
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

type StatCardProps = {
  label: string
  value: string
  href: string
}

function StatCard({ label, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
        View all →
      </p>
    </Link>
  )
}

const tabs = [
  { id: "screenshots", label: "Screenshots" },
  { id: "messages", label: "Messages" },
  { id: "chats", label: "Chats" },
  { id: "contacts", label: "Contacts" },
  { id: "activity", label: "Activity" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("screenshots")

  useEffect(() => {
    getDashboardStats()
      .then((statsData) => {
        setStats(statsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-zinc-500">Loading...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Screenshots"
            value={stats.totalScreenshots.toLocaleString()}
            href="/dashboard/screenshots"
          />
          <StatCard
            label="Screenshot Storage"
            value={formatBytes(stats.totalStorageBytes)}
            href="/dashboard/screenshots"
          />
          <StatCard
            label="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            href="/dashboard/messages"
          />
          <StatCard
            label="Total Chats"
            value={stats.totalChats.toLocaleString()}
            href="/dashboard/chats"
          />
          <StatCard
            label="Total Contacts"
            value={stats.totalContacts.toLocaleString()}
            href="/dashboard/contacts"
          />
        </div>
      </div>

      <div>
        <div className="mb-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "screenshots" && <RecentScreenshots />}
        {activeTab === "messages" && <RecentMessages />}
        {activeTab === "chats" && <RecentChats />}
        {activeTab === "contacts" && <Contacts />}
        {activeTab === "activity" && <ActivityLogs />}
      </div>
    </div>
  )
}
