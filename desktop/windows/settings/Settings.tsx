import { useState, useEffect } from 'react'
import { ScreenCaptureConfig } from '../electron'
import { LogsTab } from './logs/LogsTab'

type Tab = 'general' | 'logs'

function GeneralTab() {
  const [serverUrl, setServerUrl] = useState('')
  const [deviceSecret, setDeviceSecret] = useState('')
  const [config, setConfig] = useState<ScreenCaptureConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [url, secret, captureConfig] = await Promise.all([
        window.electron.getServerUrl(),
        window.electron.getDeviceSecret(),
        window.electron.getScreenCaptureConfig(),
      ])
      setServerUrl(url)
      setDeviceSecret(secret)
      setConfig(captureConfig)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleServerUrlBlur = async () => {
    await window.electron.setServerUrl(serverUrl)
  }

  const handleDeviceSecretBlur = async () => {
    await window.electron.setDeviceSecret(deviceSecret)
  }

  const handleIntervalChange = async (minutes: number) => {
    await window.electron.setScreenCaptureConfig({ intervalMinutes: minutes })
    setConfig((prev) => (prev ? { ...prev, intervalMinutes: minutes } : null))
  }

  const handleToggleEnabled = async () => {
    if (!config) {
      return
    }
    const newEnabled = !config.enabled
    await window.electron.setScreenCaptureConfig({ enabled: newEnabled })
    setConfig((prev) => (prev ? { ...prev, enabled: newEnabled } : null))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-color-secondary)]">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Server Connection</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Server URL
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              onBlur={handleServerUrlBlur}
              className="w-full px-3 py-2 rounded-md border bg-[var(--background-color-three)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://localhost:3000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Device Secret
            </label>
            <input
              type="password"
              value={deviceSecret}
              onChange={(e) => setDeviceSecret(e.target.value)}
              onBlur={handleDeviceSecretBlur}
              className="w-full px-3 py-2 rounded-md border bg-[var(--background-color-three)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the secret from your server"
            />
            <p className="text-xs text-[var(--text-color-secondary)] mt-1">
              Must match DEVICE_SECRET on the server
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Screen Capture</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Screen Capture</div>
              <div className="text-sm text-[var(--text-color-secondary)]">
                Automatically capture screenshots at regular intervals
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Capture Interval
            </label>
            <select
              value={config?.intervalMinutes || 5}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md border bg-[var(--background-color-three)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Every 1 minute</option>
              <option value={2}>Every 2 minutes</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-[var(--text-color-secondary)] hover:text-[var(--color-contrast)]'
      }`}
    >
      {children}
    </button>
  )
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div className="h-screen flex flex-col bg-[var(--background-color-one)]">
      <div className="flex-shrink-0 border-b px-4 pt-2">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          >
            General
          </TabButton>
          <TabButton
            active={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'logs' && <LogsTab />}
      </div>
    </div>
  )
}
