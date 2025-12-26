import { useState, useEffect, useCallback } from 'react'
import { ApiRequestLog } from '../../electron'
import { Button } from '../../shared/ui/Button'

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: 'success' | 'error' }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Success
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      Error
    </span>
  )
}

export function LogsTab() {
  const [logs, setLogs] = useState<ApiRequestLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    const result = await window.electron.getRequestLogs()
    setLogs(result)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const handleClear = async () => {
    await window.electron.clearRequestLogs()
    setLogs([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-color-secondary)]">
        Loading logs...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Request Logs</h2>
        <Button variant="secondary" size="sm" onClick={handleClear} disabled={logs.length === 0}>
          Clear Logs
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-color-secondary)] py-12">
          <div className="text-4xl mb-3 opacity-40">📋</div>
          <p>No requests logged yet</p>
          <p className="text-sm mt-1">Requests to the context server will appear here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--background-color-one)]">
              <tr className="text-left text-[var(--text-color-secondary)] border-b">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Method</th>
                <th className="pb-2 font-medium">Path</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const showDate = index === 0 ||
                  formatDate(log.timestamp) !== formatDate(logs[index - 1].timestamp)

                return (
                  <tr key={log.id} className="border-b border-[var(--border-color-one)] hover:bg-[var(--background-color-three)]">
                    <td className="py-2.5 font-mono text-xs">
                      {showDate && (
                        <span className="text-[var(--text-color-secondary)] mr-1.5">
                          {formatDate(log.timestamp)}
                        </span>
                      )}
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--background-color-three)]">
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-xs text-[var(--text-color-secondary)]">
                      {log.path}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={log.status} />
                      {log.error && (
                        <span className="ml-2 text-xs text-red-500 dark:text-red-400">
                          {log.error}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-[var(--text-color-secondary)]">
                      {log.duration}ms
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}




