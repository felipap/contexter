"use client"

import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import {
  getRecentWriteLogs,
  getRecentReadLogs,
  type WriteLogEntry,
  type ReadLogEntry,
} from "./actions"
import { Button } from "@/ui/Button"

type LogTab = "writes" | "reads"

export function ActivityLogs() {
  const [activeTab, setActiveTab] = useState<LogTab>("writes")
  const { writeLogs, readLogs, loading } = useActivityLogs()

  return (
    <div>
      <div className="mb-4 flex gap-1">
        <Button
          size="sm"
          variant={activeTab === "writes" ? "default" : "secondary"}
          onClick={() => setActiveTab("writes")}
          className={twMerge(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            activeTab === "writes"
              ? "bg-neutral-900 text-inverted dark:bg-neutral-100"
              : "text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          Writes
        </Button>
        <Button
          size="sm"
          variant={activeTab === "reads" ? "default" : "secondary"}
          onClick={() => setActiveTab("reads")}
          className={twMerge(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            activeTab === "reads"
              ? "bg-neutral-900 text-inverted dark:bg-neutral-100"
              : "text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          Reads
        </Button>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-secondary">Loading...</p>
      ) : activeTab === "writes" ? (
        <WriteLogsTable logs={writeLogs} />
      ) : (
        <ReadLogsTable logs={readLogs} />
      )}
    </div>
  )
}

function WriteLogsTable({ logs }: { logs: WriteLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-secondary">No write activity yet.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-4 py-2.5 text-left text-sm font-medium text-secondary">
              Type
            </th>
            <th className="px-4 py-2.5 text-left text-sm font-medium text-secondary">
              Description
            </th>
            <th className="px-4 py-2.5 text-left text-sm font-medium text-secondary">
              Count
            </th>
            <th className="px-4 py-2.5 text-left text-sm font-medium text-secondary">
              Token
            </th>
            <th className="px-4 py-2.5 text-left text-sm font-medium text-secondary">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <td className="px-4 py-2.5">
                <TypeBadge type={log.type} />
              </td>
              <td className="px-4 py-2.5 text-sm text-secondary">
                {log.description}
              </td>
              <td className="px-4 py-2.5 font-mono text-sm tabular-nums text-contrast">
                {log.count.toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <TokenLabel prefix={log.tokenPrefix} />
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-secondary">
                {formatRelativeTime(new Date(log.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReadLogsTable({ logs }: { logs: ReadLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-secondary">No read activity yet.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">
              Type
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">
              Description
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">
              Items
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">
              Token
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-secondary">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <td className="px-4 py-2.5">
                <TypeBadge type={log.type} />
              </td>
              <td className="px-4 py-2.5 text-sm text-secondary">
                {log.description}
              </td>
              <td className="px-4 py-2.5 font-mono text-sm tabular-nums text-contrast">
                {log.count?.toLocaleString() ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                <TokenLabel prefix={log.tokenPrefix} />
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-secondary">
                {formatRelativeTime(new Date(log.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TokenLabel({ prefix }: { prefix: string | null }) {
  if (!prefix) {
    return <span className="text-xs text-secondary">—</span>
  }
  return (
    <code className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-secondary dark:border-neutral-800 dark:bg-neutral-900">
      {prefix}...
    </code>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-secondary dark:border-neutral-800 dark:bg-neutral-900">
      {type}
    </span>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return "now"
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays === 1) {
    return "yesterday"
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

function useActivityLogs() {
  const [writeLogs, setWriteLogs] = useState<WriteLogEntry[]>([])
  const [readLogs, setReadLogs] = useState<ReadLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRecentWriteLogs(), getRecentReadLogs()])
      .then(([writes, reads]) => {
        setWriteLogs(writes)
        setReadLogs(reads)
      })
      .finally(() => setLoading(false))
  }, [])

  return { writeLogs, readLogs, loading }
}
